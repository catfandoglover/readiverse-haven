import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    
    const notionApiKey = Deno.env.get('NOTION_API_KEY')
    const notionDatabaseId = Deno.env.get('NOTION_DATABASE_ID')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Log environment variable status (without revealing values)
    console.log('Environment variables check:', {
      hasNotionApiKey: !!notionApiKey,
      hasNotionDatabaseId: !!notionDatabaseId,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey
    })

    if (!notionApiKey || !notionDatabaseId || !supabaseUrl || !supabaseServiceKey) {
      const missingVars = [
        !notionApiKey && 'NOTION_API_KEY',
        !notionDatabaseId && 'NOTION_DATABASE_ID',
        !supabaseUrl && 'SUPABASE_URL',
        !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY'
      ].filter(Boolean)

      const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`
      console.error(errorMsg)
      return new Response(
        JSON.stringify({
          error: errorMsg
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Initialize clients
    const notion = new Client({ auth: notionApiKey })
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Fetching questions from Notion database...')
    
    let allQuestions = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      try {
        const response = await notion.databases.query({
          database_id: notionDatabaseId,
          start_cursor: startCursor,
          page_size: 100,
        });

        console.log(`Fetched ${response.results.length} questions from current page`);

        for (const page of response.results) {
          try {
            console.log('Processing Notion page:', page.id);
            
            const properties = page.properties;
            const categoryNumber = properties['Category Number']?.title?.[0]?.plain_text || null;
            const questionText = properties['Question']?.rich_text?.[0]?.plain_text || 'No question text';
            const relatedBooks = properties['Books']?.relation || [];

            console.log('Found related books:', relatedBooks);

            // Insert/update the question in great_questions table
            const { data: insertedQuestion, error: questionError } = await supabase
              .from('great_questions')
              .upsert({
                notion_id: page.id,
                category: properties.Category?.select?.name || 'Uncategorized',
                category_number: categoryNumber,
                question: questionText
              })
              .select()
              .single();

            if (questionError) {
              console.error('Error upserting question:', questionError);
              continue;
            }

            console.log('Inserted/updated question:', insertedQuestion);

            // Get all books that have Notion URLs
            const { data: books, error: booksError } = await supabase
              .from('books')
              .select('id, Notion_URL');

            if (booksError) {
              console.error('Error fetching books:', booksError);
              continue;
            }

            // Create a mapping of Notion page IDs to Supabase book IDs
            const bookMap = new Map(
              books
                .filter(book => book.Notion_URL)
                .map(book => [
                  book.Notion_URL.split('/').pop()?.replace(/-/g, ''),
                  book.id
                ])
            );

            // Process each related book
            for (const relation of relatedBooks) {
              const notionBookId = relation.id.replace(/-/g, '');
              const supabaseBookId = bookMap.get(notionBookId);

              if (supabaseBookId) {
                console.log(`Creating relationship between question ${insertedQuestion.id} and book ${supabaseBookId}`);
                
                const { error: relationError } = await supabase
                  .from('book_questions')
                  .upsert({
                    question_id: insertedQuestion.id,
                    book_id: supabaseBookId,
                    randomizer: Math.random()
                  }, {
                    onConflict: 'question_id,book_id'
                  });

                if (relationError) {
                  console.error('Error creating book-question relationship:', relationError);
                } else {
                  console.log('Successfully created book-question relationship');
                }
              } else {
                console.warn(`No matching Supabase book found for Notion book ID: ${notionBookId}`);
              }
            }
          } catch (pageError) {
            console.error('Error processing page:', page.id, pageError);
          }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
      } catch (queryError) {
        console.error('Error querying Notion database:', queryError);
        throw queryError;
      }
    }

    console.log('Sync completed successfully');

    return new Response(
      JSON.stringify({
        message: "Successfully synced questions from Notion",
        timestamp: new Date().toISOString(),
        questionsProcessed: allQuestions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    // Log the full error details
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})