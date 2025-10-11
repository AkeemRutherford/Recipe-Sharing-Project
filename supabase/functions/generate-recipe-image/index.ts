import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

    let prompt = `Create a photorealistic appetizing image of ${recipeName}`;
    
    if (description) {
      prompt += `, ${description}`;
    }
    
    if (ingredients && ingredients.length > 0) {
      const mainIngredients = ingredients.slice(0, 3).join(', ');
      prompt += `, featuring ${mainIngredients}`;
    }
    
    prompt += ' in 4:5 ratio';

    console.log('Attempting to generate image with prompt:', prompt);

    // Use Pollinations AI which is free and reliable
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      `Professional food photography of ${recipeName}, appetizing, high quality, well-lit, 4:5 aspect ratio`
    )}?width=800&height=1000&nologo=true&enhance=true`;

    console.log('Fetching image from Pollinations...');

    // Fetch the image
    const imageResponse = await fetch(pollinationsUrl);

    if (!imageResponse.ok) {
      console.error('Pollinations API error:', imageResponse.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: imageResponse.statusText }),
        {
          status: imageResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Convert to base64
    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log('Image generated successfully, size:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:image/jpeg;base64,${base64Image}`,
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