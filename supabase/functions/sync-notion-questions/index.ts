import { createClient } from 'https://esm.sh/@notionhq/client'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient as createSupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const notion = new createClient({
      auth: Deno.env.get('NOTION_API_KEY'),
    })

    const supabase = createSupabaseClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all entries from the Notion database
    const databaseId = Deno.env.get('NOTION_DATABASE_ID')
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID is not set')
    }

    const response = await notion.databases.query({
      database_id: databaseId,
    })

    // Process each entry and update Supabase
    for (const page of response.results) {
      if (!('properties' in page)) continue

      const properties = page.properties as any
      
      // Get the book relations
      const bookRelations = properties.Books?.relation || []
      // Get the question relations
      const questionRelations = properties.Questions?.relation || []

      // Create associations in Supabase
      for (const book of bookRelations) {
        for (const question of questionRelations) {
          const { error } = await supabase
            .from('book_questions')
            .upsert({
              book_id: book.id,
              question_id: question.id,
            }, {
              onConflict: 'book_id,question_id'
            })

          if (error) {
            console.error('Error upserting book-question relation:', error)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})