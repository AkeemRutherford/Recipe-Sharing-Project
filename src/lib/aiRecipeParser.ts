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
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not found.');
  }

  console.log('=== GEMINI API CALL ===');
  console.log('Input description:', description);

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
      `${supabaseUrl}/functions/v1/gemini-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          prompt: prompt
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log('Gemini raw response:', data);
    console.log('Generated text:', generatedText);

    if (!generatedText) {
      console.error('No generated text from Gemini:', data);
      throw new Error('No generated text from Gemini API');
    }

    let cleanedText = generatedText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();

    console.log('Cleaned text:', cleanedText);

    try {
      const recipeData = JSON.parse(cleanedText);
      console.log('Parsed recipe data:', recipeData);

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
      console.error('Failed to parse text:', cleanedText);

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      throw new Error('No valid JSON found in AI response');
    }

  } catch (error) {
    console.error('Recipe generation error:', error);
    throw error;
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
    console.error('Recipe parsing error - falling back to template:', error);
    return createBasicRecipeTemplate(description);
  }
}
