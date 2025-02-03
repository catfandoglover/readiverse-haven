import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const notionApiKey = Deno.env.get('NOTION_API_KEY')
    const notionDatabaseId = Deno.env.get('NOTION_DATABASE_ID')

    if (!notionApiKey || !notionDatabaseId) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({
          error: 'Server configuration error - missing required environment variables'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // For now, return a success response to verify the function is working
    return new Response(
      JSON.stringify({
        message: "Edge function is working",
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})