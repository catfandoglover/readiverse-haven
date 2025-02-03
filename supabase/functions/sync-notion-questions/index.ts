import { createClient } from 'https://esm.sh/@notionhq/client'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient as createSupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Add timestamp to all logs for better tracking
  const logWithTimestamp = (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data) : '')
  }

  if (req.method === 'OPTIONS') {
    logWithTimestamp('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logWithTimestamp('Starting Notion sync process...')
    
    // Check environment variables first
    const notionKey = Deno.env.get('NOTION_API_KEY')
    const notionDbId = Deno.env.get('NOTION_DATABASE_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    logWithTimestamp('Environment variables check:', {
      hasNotionKey: !!notionKey,
      hasNotionDbId: !!notionDbId,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    })

    if (!notionKey || !notionDbId) {
      const error = 'Missing required environment variables: NOTION_API_KEY or NOTION_DATABASE_ID'
      logWithTimestamp('Error:', { error })
      throw new Error(error)
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      const error = 'Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      logWithTimestamp('Error:', { error })
      throw new Error(error)
    }

    const notion = new createClient({ auth: notionKey })
    logWithTimestamp('Notion client created successfully')
    
    const supabase = createSupabaseClient(
      supabaseUrl,
      supabaseServiceKey
    )
    logWithTimestamp('Supabase client created successfully')

    logWithTimestamp('Querying Notion database:', { databaseId: notionDbId })
    const response = await notion.databases.query({
      database_id: notionDbId,
      page_size: 100,
    })
    logWithTimestamp('Retrieved entries from Notion:', { count: response.results.length })

    let processedCount = 0
    let errorCount = 0
    const errors = []

    for (const page of response.results) {
      try {
        if (!('properties' in page)) {
          logWithTimestamp('Warning: Skipping page without properties', { pageId: page.id })
          continue
        }

        const properties = page.properties as any
        logWithTimestamp('Processing page:', {
          id: page.id,
          propertyKeys: Object.keys(properties),
        })

        // Extract question data
        const categoryNumber = properties.CategoryNumber?.number || 0
        const category = properties.Category?.select?.name || 'Uncategorized'
        const questionText = properties.Question?.title?.[0]?.plain_text || ''

        logWithTimestamp('Extracted question data:', {
          categoryNumber,
          category,
          questionText: questionText.substring(0, 50) + '...' // Log first 50 chars for privacy
        })

        if (!questionText) {
          logWithTimestamp('Warning: Skipping page with no question text:', { pageId: page.id })
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
          logWithTimestamp('Error upserting question:', {
            error: questionError,
            pageId: page.id
          })
          errors.push({
            type: 'question_upsert',
            pageId: page.id,
            error: questionError.message
          })
          errorCount++
          continue
        }

        logWithTimestamp('Question upserted successfully:', {
          questionId: questionData.id
        })

        // Get book relations
        const bookRelations = properties.Books?.relation || []
        logWithTimestamp('Processing book relations:', {
          count: bookRelations.length,
          pageId: page.id
        })

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
            logWithTimestamp('Error creating book-question relation:', {
              error: relationError,
              pageId: page.id,
              bookId: bookRef.id
            })
            errors.push({
              type: 'relation_upsert',
              pageId: page.id,
              bookId: bookRef.id,
              error: relationError.message
            })
            errorCount++
          } else {
            logWithTimestamp('Book-question relation created successfully:', {
              bookId: bookRef.id,
              questionId: questionData.id
            })
          }
        }

        processedCount++
        logWithTimestamp('Successfully processed page:', {
          pageId: page.id,
          processedCount
        })
      } catch (error) {
        logWithTimestamp('Error processing page:', {
          pageId: page.id,
          error: error.message
        })
        errors.push({
          type: 'page_processing',
          pageId: page.id,
          error: error.message
        })
        errorCount++
      }
    }

    const summary = {
      totalProcessed: processedCount,
      errorCount,
      errors
    }
    logWithTimestamp('Sync completed:', summary)

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
    logWithTimestamp('Fatal error during sync:', {
      error: error.message,
      stack: error.stack
    })
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