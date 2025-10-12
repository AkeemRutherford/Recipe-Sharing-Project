import { fileToBase64 } from './imageUpload';

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HF_API_BASE = 'https://api-inference.huggingface.co/models';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface GeneratedRecipe {
  title: string;
  description: string;
  servings: number;
  prep_time: string;
  cook_time: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  ingredients: Array<{
    amount: string;
    unit: string;
    name: string;
  }>;
  instructions: string[];
  tags: string[];
  ai_generated: boolean;
  ai_confidence_score?: number;
  generation_method: 'voice' | 'image';
  original_transcript?: string;
}

export async function analyzeImage(imageFile: File): Promise<string> {
  const base64Image = await fileToBase64(imageFile);
  const base64Data = base64Image.split(',')[1];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Analyze this food image and provide a detailed description of the dish, including what it appears to be, key ingredients you can identify, cooking method, and presentation style. Be specific and focus on culinary details."
            },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Data
              }
            }
          ]
        }]
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Image analysis failed: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const description = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Unknown food dish';
  return description;
}

export async function generateRecipeFromDescription(
  description: string,
  source: 'voice' | 'image',
  enhanceDescription: boolean = true
): Promise<GeneratedRecipe> {
  const prompt = `You are a professional chef and recipe creator. ${
    source === 'image'
      ? `Based on this food image description: "${description}"`
      : `Based on this spoken recipe description: "${description}"`
  }, create a complete, accurate recipe.

Return ONLY valid JSON in this exact format, with no additional text:

{
  "title": "Short, catchy recipe name (3-6 words max)",
  "description": "Appetizing description that makes you want to cook this (max 200 characters)",
  "servings": 4,
  "prep_time": "15 min",
  "cook_time": "30 min",
  "difficulty": "Easy",
  "ingredients": [
    {"amount": "2", "unit": "cups", "name": "all-purpose flour"},
    {"amount": "1", "unit": "tsp", "name": "salt"}
  ],
  "instructions": [
    "Preheat oven to 350°F",
    "Mix dry ingredients in a bowl"
  ],
  "tags": ["comfort food", "family friendly", "dinner"]
}

Important:
- Title: Create a SHORT, memorable name (NOT a copy of the input description). Examples: "Crispy Garlic Chicken", "Mom's Secret Meatloaf", "Golden Honey Glazed Salmon"
- Description: ${enhanceDescription ? 'Write an enticing, professional description that highlights flavors, textures, and appeal. Make it sound delicious and inviting!' : 'Keep description brief and accurate.'} Maximum 200 characters including spaces.
- Use realistic measurements and common units (cups, tsp, tbsp, oz, lb, g, ml)
- Include all necessary ingredients with specific amounts
- Write clear, numbered steps in instructions array
- Choose difficulty based on technique complexity
- Include 3-5 relevant tags
- Make servings realistic (typically 4-8)
${source === 'voice' ? '- Extract amounts from spoken numbers (e.g., "two cups" → "2 cups")' : ''}
${source === 'voice' ? '- Convert conversational language to precise cooking steps' : ''}`;

  const response = await fetch(
    `${HF_API_BASE}/mistralai/Mistral-7B-Instruct-v0.2`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: source === 'voice' ? 1500 : 1000,
          temperature: 0.5,
          return_full_text: false
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Recipe generation failed: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  const responseText = data[0]?.generated_text || '';

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse recipe from AI response. Please try again.');
  }

  try {
    const recipe = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Incomplete recipe generated. Please try again.');
    }

    // Add metadata
    recipe.ai_generated = true;
    recipe.generation_method = source;
    recipe.ai_confidence_score = 0.75; // Default confidence

    if (source === 'voice') {
      recipe.original_transcript = description;
    }

    return recipe as GeneratedRecipe;
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    throw new Error('Invalid recipe format generated. Please try again.');
  }
}

export async function generateRecipeFromImage(imageFile: File, enhanceDescription: boolean = true): Promise<GeneratedRecipe> {
  // Step 1: Analyze image
  const description = await analyzeImage(imageFile);

  // Step 2: Generate recipe from description
  const recipe = await generateRecipeFromDescription(description, 'image', enhanceDescription);

  return recipe;
}

export async function parseVoiceToRecipe(transcript: string, enhanceDescription: boolean = true): Promise<GeneratedRecipe> {
  if (!transcript || transcript.trim().length < 50) {
    throw new Error('Transcript too short. Please provide more detail about the recipe.');
  }

  const recipe = await generateRecipeFromDescription(transcript, 'voice', enhanceDescription);
  return recipe;
}
