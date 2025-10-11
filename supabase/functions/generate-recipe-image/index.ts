import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { recipeName, description, ingredients } = await req.json();

    if (!recipeName) {
      return new Response(
        JSON.stringify({ error: 'Recipe name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!GOOGLE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google AI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let prompt = `Create a photorealistic appetizing image of ${recipeName}`;
    
    if (description) {
      prompt += `, ${description}`;
    }
    
    if (ingredients && ingredients.length > 0) {
      const mainIngredients = ingredients.slice(0, 3).join(', ');
      prompt += `, featuring ${mainIngredients}`;
    }
    
    prompt += ' in 4:5 ratio';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '4:5'
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Imagen API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorText }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await response.json();
    
    if (!result.predictions || result.predictions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const imageData = result.predictions[0].bytesBase64Encoded;

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:image/png;base64,${imageData}`,
        prompt: prompt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});