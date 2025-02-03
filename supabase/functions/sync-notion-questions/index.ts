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
    
    // Check environment variables first
    const notionKey = Deno.env.get('NOTION_API_KEY')
    const notionDbId = Deno.env.get('NOTION_DATABASE_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Environment check:', {
      hasNotionKey: !!notionKey,
      hasNotionDbId: !!notionDbId,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    })

    if (!notionKey || !notionDbId) {
      throw new Error('Missing required environment variables: NOTION_API_KEY or NOTION_DATABASE_ID')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    const notion = new createClient({ auth: notionKey })
    
    const supabase = createSupabaseClient(
      supabaseUrl,
      supabaseServiceKey
    )

    console.log('Querying Notion database:', notionDbId)
    const response = await notion.databases.query({
      database_id: notionDbId,
      page_size: 100, // Adjust based on your needs
    })
    console.log('Retrieved', response.results.length, 'entries from Notion')

    // Process each entry and update Supabase
    let processedCount = 0
    let errorCount = 0
    const errors = []

    for (const page of response.results) {
      try {
        if (!('properties' in page)) {
          console.warn('Skipping page without properties')
          continue
        }

        const properties = page.properties as any
        console.log('Processing page:', {
          id: page.id,
          propertyKeys: Object.keys(properties),
        })

        // Extract question data
        const categoryNumber = properties.CategoryNumber?.number || 0
        const category = properties.Category?.select?.name || 'Uncategorized'
        const questionText = properties.Question?.title?.[0]?.plain_text || ''

        if (!questionText) {
          console.warn('Skipping page with no question text:', page.id)
          continue
        }

        // Upsert question to Supabase
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .upsert({
            category_number: categoryNumber,
            category: category,
            question: questionText,
          }, {
            onConflict: 'question'
          })
          .select()
          .single()

        if (questionError) {
          console.error('Error upserting question:', questionError)
          errors.push({
            type: 'question_upsert',
            pageId: page.id,
            error: questionError.message
          })
          errorCount++
          continue
        }

        // Get book relations
        const bookRelations = properties.Books?.relation || []
        console.log('Processing book relations:', bookRelations.length)

        // Create book-question associations
        for (const bookRef of bookRelations) {
          const { error: relationError } = await supabase
            .from('book_questions')
            .upsert({
              book_id: bookRef.id,
              question_id: questionData.id,
            }, {
              onConflict: 'book_id,question_id'
            })

          if (relationError) {
            console.error('Error creating book-question relation:', relationError)
            errors.push({
              type: 'relation_upsert',
              pageId: page.id,
              bookId: bookRef.id,
              error: relationError.message
            })
            errorCount++
          }
        }

        processedCount++
      } catch (error) {
        console.error('Error processing page:', page.id, error)
        errors.push({
          type: 'page_processing',
          pageId: page.id,
          error: error.message
        })
        errorCount++
      }
    }

    console.log('Sync completed:', {
      totalProcessed: processedCount,
      errorCount,
      errors
    })

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors,
        message: `Sync completed. Processed ${processedCount} entries with ${errorCount} errors.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Fatal error during sync:', error)
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