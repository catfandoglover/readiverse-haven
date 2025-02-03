import { createClient } from 'https://esm.sh/@notionhq/client'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient as createSupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('Starting Notion sync process...')
    
    // Check environment variables
    const notionKey = Deno.env.get('NOTION_API_KEY')
    const notionDbId = Deno.env.get('NOTION_DATABASE_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!notionKey || !notionDbId || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const notion = new createClient({ auth: notionKey })
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Querying Notion database:', { databaseId: notionDbId })
    const response = await notion.databases.query({
      database_id: notionDbId,
      page_size: 100,
    })

    let processedCount = 0
    let errorCount = 0
    const errors = []

    for (const page of response.results) {
      try {
        if (!('properties' in page)) {
          console.log('Warning: Skipping page without properties', { pageId: page.id })
          continue
        }

        const properties = page.properties as any
        
        // Extract question data
        const categoryNumber = properties.CategoryNumber?.number || null
        const category = properties.Category?.select?.name || 'Uncategorized'
        const questionText = properties.Question?.title?.[0]?.plain_text || ''

        if (!questionText) {
          console.log('Warning: Skipping page with no question text:', { pageId: page.id })
          continue
        }

        // Upsert question to Supabase
        const { data: questionData, error: questionError } = await supabase
          .from('great_questions')
          .upsert({
            notion_id: page.id,
            category_number: categoryNumber,
            category: category,
            question: questionText,
          }, {
            onConflict: 'notion_id'
          })
          .select()
          .single()

        if (questionError) {
          console.log('Error upserting question:', { error: questionError, pageId: page.id })
          errors.push({ type: 'question_upsert', pageId: page.id, error: questionError.message })
          errorCount++
          continue
        }

        // Get book relations and create book-question associations
        const bookRelations = properties['The Classics']?.relation || []
        
        // Delete existing relationships for this question to avoid duplicates
        const { error: deleteError } = await supabase
          .from('book_questions')
          .delete()
          .eq('question_id', questionData.id)

        if (deleteError) {
          console.log('Error deleting existing relationships:', { error: deleteError })
          errors.push({ type: 'relationship_delete', error: deleteError.message })
          errorCount++
        }

        // Create new relationships with randomizer values
        for (const bookRef of bookRelations) {
          const { error: relationError } = await supabase
            .from('book_questions')
            .insert({
              question_id: questionData.id,
              book_id: bookRef.id,
              randomizer: Math.random(), // Generate random value for ordering
            })

          if (relationError) {
            console.log('Error creating book-question relation:', {
              error: relationError,
              questionId: questionData.id,
              bookId: bookRef.id
            })
            errors.push({
              type: 'relation_insert',
              questionId: questionData.id,
              bookId: bookRef.id,
              error: relationError.message
            })
            errorCount++
          }
        }

        processedCount++
        console.log('Successfully processed question:', {
          questionId: questionData.id,
          bookRelationsCount: bookRelations.length
        })
      } catch (error) {
        console.log('Error processing page:', { error: error.message })
        errors.push({ type: 'page_processing', error: error.message })
        errorCount++
      }
    }

    const summary = {
      totalProcessed: processedCount,
      errorCount,
      errors
    }
    console.log('Sync completed:', summary)

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors,
        message: `Sync completed. Processed ${processedCount} questions with ${errorCount} errors.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.log('Fatal error during sync:', { error: error.message })
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})