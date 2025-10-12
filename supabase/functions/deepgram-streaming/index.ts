import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');
    if (!deepgramApiKey) {
      throw new Error('DEEPGRAM_API_KEY not configured');
    }

    // Check if this is a WebSocket upgrade request
    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response(
        JSON.stringify({ error: "Expected WebSocket connection" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create WebSocket connection to client
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

    // Connect to Deepgram
    const deepgramUrl = "wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&interim_results=true&smart_format=true";
    const deepgramSocket = new WebSocket(deepgramUrl, [
      "token",
      deepgramApiKey,
    ]);

    // Forward messages from client to Deepgram
    clientSocket.onmessage = (event) => {
      if (deepgramSocket.readyState === WebSocket.OPEN) {
        deepgramSocket.send(event.data);
      }
    };

    // Forward messages from Deepgram to client
    deepgramSocket.onmessage = (event) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
    };

    // Handle Deepgram connection open
    deepgramSocket.onopen = () => {
      console.log('Connected to Deepgram');
    };

    // Handle errors
    deepgramSocket.onerror = (error) => {
      console.error('Deepgram error:', error);
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({ error: 'Deepgram connection error' }));
      }
    };

    clientSocket.onerror = (error) => {
      console.error('Client socket error:', error);
      if (deepgramSocket.readyState === WebSocket.OPEN) {
        deepgramSocket.close();
      }
    };

    // Handle closures
    deepgramSocket.onclose = () => {
      console.log('Deepgram connection closed');
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.close();
      }
    };

    clientSocket.onclose = () => {
      console.log('Client connection closed');
      if (deepgramSocket.readyState === WebSocket.OPEN) {
        deepgramSocket.close();
      }
    };

    return response;
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});