import { fileToBase64 } from './imageUpload';

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HF_API_BASE = 'https://api-inference.huggingface.co/models';

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
  if (!HF_API_KEY || HF_API_KEY === 'undefined' || HF_API_KEY.length < 10) {
    throw new Error('Hugging Face API key not configured. Get your FREE API key at https://huggingface.co/settings/tokens and add it to .env as VITE_HUGGINGFACE_API_KEY');
  }

  const base64Image = await fileToBase64(imageFile);

  const response = await fetch(
    `${HF_API_BASE}/Salesforce/blip-image-captioning-large`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: base64Image
      })
    }
  );

  if (!response.ok) {
    let errorMessage = `Image analysis failed (${response.status})`;
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;

      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Invalid Hugging Face API key. Please get a valid FREE API key at https://huggingface.co/settings/tokens';
      }
    } catch {
      const text = await response.text();
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Invalid Hugging Face API key. Please get a valid FREE API key at https://huggingface.co/settings/tokens';
      } else {
        errorMessage = text || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result[0]?.generated_text || 'Unknown food dish';
}

export async function generateRecipeFromDescription(
  description: string,
  source: 'voice' | 'image'
): Promise<GeneratedRecipe> {
  if (!HF_API_KEY || HF_API_KEY === 'undefined' || HF_API_KEY.length < 10) {
    throw new Error('Hugging Face API key not configured. Get your FREE API key at https://huggingface.co/settings/tokens and add it to .env as VITE_HUGGINGFACE_API_KEY');
  }

  const prompt = `You are a professional chef and recipe creator. ${
    source === 'image'
      ? `Based on this food image description: "${description}"`
      : `Based on this spoken recipe description: "${description}"`
  }, create a complete, accurate recipe.

Return ONLY valid JSON in this exact format, with no additional text:

{
  "title": "Descriptive recipe name",
  "description": "Brief appetizing description (1-2 sentences)",
  "servings": 4,
  "prep_time": "15 min",
  "cook_time": "30 min",
  "difficulty": "Easy",
  "ingredients": [
    {"amount": "2", "unit": "cups", "name": "all-purpose flour"},
    {"amount": "1", "unit": "tsp", "name": "salt"}
  ],
  "instructions": [
    "Preheat oven to 350�F",
    "Mix dry ingredients in a bowl"
  ],
  "tags": ["comfort food", "family friendly", "dinner"]
}

Important:
- Use realistic measurements and common units (cups, tsp, tbsp, oz, lb, g, ml)
- Include all necessary ingredients with specific amounts
- Write clear, numbered steps in instructions array
- Choose difficulty based on technique complexity
- Include 3-5 relevant tags
- Make servings realistic (typically 4-8)
${source === 'voice' ? '- Extract amounts from spoken numbers (e.g., "two cups" � "2 cups")' : ''}
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
    let errorMessage = `Recipe generation failed (${response.status})`;
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;

      if (errorMessage.includes('loading') || errorMessage.includes('currently loading')) {
        errorMessage = 'AI model is loading. Please wait 20 seconds and try again.';
      }

      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Invalid Hugging Face API key. Please get a valid FREE API key at https://huggingface.co/settings/tokens';
      }
    } catch {
      const text = await response.text();
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Invalid Hugging Face API key. Please get a valid FREE API key at https://huggingface.co/settings/tokens';
      } else {
        errorMessage = text || errorMessage;
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const responseText = data[0]?.generated_text || '';

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse recipe from AI response. Please try again.');
  }

  try {
    const recipe = JSON.parse(jsonMatch[0]);

    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Incomplete recipe generated. Please try again.');
    }

    recipe.ai_generated = true;
    recipe.generation_method = source;
    recipe.ai_confidence_score = 0.75;

    if (source === 'voice') {
      recipe.original_transcript = description;
    }

    return recipe as GeneratedRecipe;
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    throw new Error('Invalid recipe format generated. Please try again.');
  }
}

export async function generateRecipeFromImage(imageFile: File): Promise<GeneratedRecipe> {
  const description = await analyzeImage(imageFile);
  const recipe = await generateRecipeFromDescription(description, 'image');
  return recipe;
}

export async function parseVoiceToRecipe(transcript: string): Promise<GeneratedRecipe> {
  if (!transcript || transcript.trim().length < 50) {
    throw new Error('Transcript too short. Please provide more detail about the recipe.');
  }

  const recipe = await generateRecipeFromDescription(transcript, 'voice');
  return recipe;
}
