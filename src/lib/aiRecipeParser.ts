interface ParsedRecipe {
  title?: string;
  description?: string;
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

function createBasicRecipeTemplate(description: string): ParsedRecipe {
  const titleMatch = description.match(/^([^.!?]+)/);
  const title = titleMatch
    ? titleMatch[1].trim().split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    : "Recipe from Description";

  const ingredients: Array<{ amount: string; unit: string; name: string }> = [];
  const lines = description.split(/[.\n,]/);

  lines.forEach(line => {
    const match = line.match(/(\d+\/?\d*)\s*(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|piece|pieces|clove|cloves)?\s*([a-zA-Z\s]+)/i);
    if (match) {
      ingredients.push({
        amount: match[1],
        unit: match[2] || "",
        name: match[3].trim()
      });
    }
  });

  if (ingredients.length === 0) {
    ingredients.push(
      { amount: "1", unit: "cup", name: "main ingredient" },
      { amount: "2", unit: "tbsp", name: "oil or butter" },
      { amount: "to taste", unit: "", name: "salt and pepper" }
    );
  }

  const instructions = [
    "Gather and prepare all ingredients",
    "Follow the cooking method described in your recipe",
    "Cook until desired doneness",
    "Season to taste and serve hot"
  ];

  return {
    title: title,
    servings: 4,
    prep_time: "15 min",
    cook_time: "30 min",
    difficulty: "Easy",
    ingredients: ingredients,
    instructions: instructions,
    tags: ["Home Cooking", "Simple"]
  };
}

async function parseDescriptionWithGemini(description: string): Promise<ParsedRecipe> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const prompt = `You are a creative recipe AI assistant. Your job is to take ANY recipe description, no matter how vague or incomplete, and turn it into a structured recipe. BE EXTREMELY CREATIVE and make reasonable assumptions.

Recipe Description:
"${description}"

CRITICAL INSTRUCTIONS:
- Title: Create a SHORT, catchy name (3-6 words max). NOT a copy of the input. Examples: "Crispy Garlic Chicken", "Classic Beef Stew", "Honey Glazed Salmon"
- Description: Write an enticing, appetizing description (max 200 characters) that highlights flavors and textures
- If ingredients are mentioned WITHOUT amounts, make reasonable guesses (e.g., "1 cup", "2 tablespoons", "to taste")
- If NO ingredients are mentioned at all, infer common ingredients based on the dish type
- If steps are vague, create detailed step-by-step instructions from your culinary knowledge
- If it's just a dish NAME (like "chocolate cake"), generate a complete basic recipe for that dish
- If servings not mentioned, assume 4-6 servings
- If times not mentioned, estimate realistic prep and cook times
- NEVER refuse to generate a recipe - always try your best with whatever info given
- Make it sound delicious and professional

Output this EXACT JSON structure (ONLY JSON, no other text):

{
  "title": "Short catchy recipe name (3-6 words)",
  "description": "Appetizing description highlighting flavors (max 200 chars)",
  "servings": 4,
  "prep_time": "XX min",
  "cook_time": "XX min",
  "difficulty": "Easy",
  "ingredients": [
    {"amount": "2", "unit": "cups", "name": "flour"},
    {"amount": "1", "unit": "tsp", "name": "salt"}
  ],
  "instructions": [
    "First clear step",
    "Second clear step"
  ],
  "tags": ["Cuisine", "Type", "Diet"]
}

EXAMPLES OF WHAT YOU SHOULD HANDLE:

Input: "pancakes"
Output: Generate a complete pancake recipe with flour, eggs, milk, etc.

Input: "my mom's soup with chicken and vegetables"
Output: Generate chicken vegetable soup with reasonable ingredients and steps

Input: "chocolate cookies with butter sugar flour eggs and chocolate chips bake 12 minutes"
Output: Structure this into proper recipe format with amounts and full steps

Input: "pasta"
Output: Generate a simple pasta recipe (e.g., spaghetti with tomato sauce)

BE CREATIVE. BE HELPFUL. NEVER REFUSE. Always generate something useful.`;

  try {
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return createBasicRecipeTemplate(description);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return createBasicRecipeTemplate(description);
    }

    let cleanedText = generatedText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();

    try {
      const recipeData = JSON.parse(cleanedText);

      if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
        recipeData.ingredients = [
          { amount: "1", unit: "cup", name: "main ingredient" },
          { amount: "to taste", unit: "", name: "salt and pepper" }
        ];
      }

      if (!recipeData.instructions || recipeData.instructions.length === 0) {
        recipeData.instructions = [
          "Prepare ingredients as described",
          "Combine ingredients according to recipe",
          "Cook until done",
          "Serve and enjoy"
        ];
      }

      return recipeData;

    } catch (parseError) {
      console.error('JSON parse error:', parseError);

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          return createBasicRecipeTemplate(description);
        }
      }

      return createBasicRecipeTemplate(description);
    }

  } catch (error) {
    console.error('Recipe generation error:', error);
    return createBasicRecipeTemplate(description);
  }
}

export async function parseDescriptionToRecipe(description: string): Promise<ParsedRecipe> {
  if (!description || description.trim().length === 0) {
    throw new Error('Description is required');
  }

  try {
    const result = await parseDescriptionWithGemini(description);
    return result;
  } catch (error) {
    console.error('Recipe parsing error:', error);
    return createBasicRecipeTemplate(description);
  }
}
