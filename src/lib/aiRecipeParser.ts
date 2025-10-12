interface ParsedRecipe {
  title?: string;
  servings?: number;
  prep_time?: string;
  cook_time?: string;
  difficulty?: string;
  ingredients: Array<{
    amount: string;
    unit: string;
    name: string;
  }>;
  instructions: string[];
  tags?: string[];
}

async function parseDescriptionWithGemini(description: string): Promise<ParsedRecipe> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const prompt = `You are a professional recipe creator and parser. Based on this recipe description, create a complete, structured recipe.

Recipe Description:
"${description}"

Extract and format into this EXACT JSON structure (respond with ONLY valid JSON, no other text):

{
  "title": "Recipe name (extract from description or create appropriate name)",
  "servings": number,
  "prep_time": "XX min",
  "cook_time": "XX min",
  "difficulty": "Easy" or "Intermediate" or "Advanced",
  "ingredients": [
    {
      "amount": "2",
      "unit": "cups",
      "name": "all-purpose flour"
    }
  ],
  "instructions": [
    "Preheat oven to 350°F (175°C)",
    "Mix flour and sugar in a large bowl"
  ],
  "tags": ["tag1", "tag2", "tag3"]
}

CRITICAL RULES:
1. BE CREATIVE! If the description is vague or incomplete, fill in realistic details based on the dish type
2. Extract any ingredients mentioned, and ADD common ingredients typically used in this type of recipe
3. If no amounts are specified, use standard recipe amounts (e.g., "2 cups", "1 tablespoon", "to taste")
4. Create complete, detailed cooking instructions even if only hints are provided
5. Each instruction should be ONE clear action
6. Infer appropriate tags based on cuisine, cooking method, dietary info
7. Return ONLY the JSON object, no markdown, no explanation
8. ALWAYS return at least 3-5 ingredients and 4-6 instructions minimum
9. Make educated guesses to create a complete, usable recipe
10. Ensure all JSON is valid and properly formatted

Even with minimal information, create a complete recipe that someone could actually cook from!`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error('No response from AI');
  }

  let cleanedText = generatedText.trim();
  cleanedText = cleanedText.replace(/```json\n?/g, '');
  cleanedText = cleanedText.replace(/```\n?/g, '');
  cleanedText = cleanedText.trim();

  try {
    const recipeData = JSON.parse(cleanedText);
    return recipeData;
  } catch (parseError) {
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse AI response into recipe format');
  }
}

export async function parseDescriptionToRecipe(description: string): Promise<ParsedRecipe> {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  try {
    const result = await parseDescriptionWithGemini(description);

    if (!result.ingredients || result.ingredients.length === 0) {
      throw new Error('AI could not generate ingredients. Please try a different description.');
    }

    if (!result.instructions || result.instructions.length === 0) {
      throw new Error('AI could not generate instructions. Please try a different description.');
    }

    return result;
  } catch (error) {
    console.error('Recipe parsing error:', error);
    throw error;
  }
}
