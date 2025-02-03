import { createClient } from 'https://esm.sh/@notionhq/client'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient as createSupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('Received request:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    console.log('Starting Notion sync process...')
    
    // Check environment variables
    const notionKey = Deno.env.get('NOTION_API_KEY')
    const notionDbId = Deno.env.get('NOTION_DATABASE_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Checking environment variables...')
    if (!notionKey || !notionDbId || !supabaseUrl || !supabaseServiceKey) {
      const missingVars = [
        !notionKey && 'NOTION_API_KEY',
        !notionDbId && 'NOTION_DATABASE_ID',
        !supabaseUrl && 'SUPABASE_URL',
        !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY'
      ].filter(Boolean)
      
      console.error('Missing required environment variables:', missingVars)
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }

    console.log('Initializing Notion client...')
    const notion = new createClient({ auth: notionKey })
    
    console.log('Initializing Supabase client...')
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Querying Notion database:', { databaseId: notionDbId })
    const response = await notion.databases.query({
      database_id: notionDbId,
      page_size: 100,
    })

    console.log('Retrieved pages from Notion:', { pageCount: response.results.length })

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
        console.log('Processing page:', { 
          pageId: page.id, 
          properties: Object.keys(properties)
        })
        
        // Extract question data
        const categoryNumber = properties.CategoryNumber?.number || null
        const category = properties.Category?.select?.name || 'Uncategorized'
        const questionText = properties.Question?.title?.[0]?.plain_text || ''

        console.log('Extracted question data:', {
          categoryNumber,
          category,
          questionText: questionText.substring(0, 50) + '...'
        })

        if (!questionText) {
          console.log('Warning: Skipping page with no question text:', { pageId: page.id })
          continue
        }

        // Upsert question to Supabase
        console.log('Upserting question to Supabase...')
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
          console.error('Error upserting question:', { error: questionError, pageId: page.id })
          errors.push({ type: 'question_upsert', pageId: page.id, error: questionError.message })
          errorCount++
          continue
        }

        // Get book relations and create book-question associations
        const bookRelations = properties['The Classics']?.relation || []
        console.log('Found book relations:', { 
          questionId: questionData.id,
          relationCount: bookRelations.length 
        })
        
        // Delete existing relationships for this question to avoid duplicates
        console.log('Deleting existing relationships...')
        const { error: deleteError } = await supabase
          .from('book_questions')
          .delete()
          .eq('question_id', questionData.id)

        if (deleteError) {
          console.error('Error deleting existing relationships:', { error: deleteError })
          errors.push({ type: 'relationship_delete', error: deleteError.message })
          errorCount++
        }

        // Create new relationships with randomizer values
        for (const bookRef of bookRelations) {
          console.log('Creating book-question relation:', {
            questionId: questionData.id,
            bookId: bookRef.id
          })
          
          const { error: relationError } = await supabase
            .from('book_questions')
            .insert({
              question_id: questionData.id,
              book_id: bookRef.id,
              randomizer: Math.random(),
            })

          if (relationError) {
            console.error('Error creating book-question relation:', {
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
        console.error('Error processing page:', error)
        errors.push({ type: 'page_processing', error: error.message })
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
        message: `Sync completed. Processed ${processedCount} questions with ${errorCount} errors.`
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
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})