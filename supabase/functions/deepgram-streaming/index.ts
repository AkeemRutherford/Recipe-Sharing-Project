import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions",
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

    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

    const deepgramUrl = "wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&interim_results=true&smart_format=true";
    const deepgramSocket = new WebSocket(deepgramUrl, [
      "token",
      deepgramApiKey,
    ]);

    clientSocket.onmessage = (event) => {
      if (deepgramSocket.readyState === WebSocket.OPEN) {
        deepgramSocket.send(event.data);
      }
    };

    deepgramSocket.onmessage = (event) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
    };

    deepgramSocket.onopen = () => {
      console.log('Connected to Deepgram');
    };

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