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
    console.log('Starting Notion sync process...')
    
    const notion = new createClient({
      auth: Deno.env.get('NOTION_API_KEY'),
    })

    const supabase = createSupabaseClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasNotionKey: !!Deno.env.get('NOTION_API_KEY'),
      hasNotionDbId: !!Deno.env.get('NOTION_DATABASE_ID'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    })

    // Fetch all entries from the Notion database
    const databaseId = Deno.env.get('NOTION_DATABASE_ID')
    if (!databaseId) {
      console.error('NOTION_DATABASE_ID is not set')
      throw new Error('NOTION_DATABASE_ID is not set')
    }

    console.log('Querying Notion database:', databaseId)
    const response = await notion.databases.query({
      database_id: databaseId,
    })
    console.log('Retrieved', response.results.length, 'entries from Notion')

    // Process each entry and update Supabase
    let processedCount = 0
    for (const page of response.results) {
      if (!('properties' in page)) {
        console.warn('Skipping page without properties')
        continue
      }

      const properties = page.properties as any
      console.log('Processing page with properties:', JSON.stringify(properties, null, 2))
      
      // Get the book relations
      const bookRelations = properties.Books?.relation || []
      // Get the question relations
      const questionRelations = properties.Questions?.relation || []

      console.log('Found relations:', {
        books: bookRelations.length,
        questions: questionRelations.length
      })

      // Create associations in Supabase
      for (const book of bookRelations) {
        for (const question of questionRelations) {
          console.log('Creating association:', {
            book_id: book.id,
            question_id: question.id
          })

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
          } else {
            processedCount++
          }
        }
      }
    }

    console.log('Sync completed. Processed', processedCount, 'associations')

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: processedCount,
        message: `Sync completed. Processed ${processedCount} associations.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error during sync:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})