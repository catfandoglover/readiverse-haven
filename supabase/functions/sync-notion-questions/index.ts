import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds

async function fetchWithRetry(fn: () => Promise<any>, retries = MAX_RETRIES, delayMs = INITIAL_RETRY_DELAY): Promise<any> {
  try {
    return await fn();
  } catch (error) {
    console.error('Error in fetchWithRetry:', error);
    
    if (retries > 0 && (error.message?.includes('rate limit') || error.status === 429)) {
      const nextDelay = Math.min(delayMs * 2, MAX_RETRY_DELAY);
      console.log(`Rate limited, retrying in ${delayMs}ms... (${retries} retries left)`);
      await delay(delayMs);
      return fetchWithRetry(fn, retries - 1, nextDelay);
    }
    throw error;
  }
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

    if (!notionApiKey || !notionDatabaseId || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const notion = new Client({ auth: notionApiKey })
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Fetching questions from Notion database...')
    
    let allQuestions = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await fetchWithRetry(async () => {
        return await notion.databases.query({
          database_id: notionDatabaseId,
          start_cursor: startCursor,
          page_size: 50, // Reduced from 100 to help with rate limits
        });
      });

      console.log(`Fetched ${response.results.length} questions from current page`);

      for (const page of response.results) {
        try {
          const properties = page.properties;
          const categoryNumber = properties['Category Number']?.title?.[0]?.plain_text || null;
          const questionText = properties['Question']?.rich_text?.[0]?.plain_text || 'No question text';
          
          const classicsRelation = properties['The Classics']?.relation || [];

          const relatedUrls = await Promise.all(
            classicsRelation.map(async (relation) => {
              try {
                const relatedPage = await fetchWithRetry(async () => {
                  return await notion.pages.retrieve({ page_id: relation.id });
                });
                return relatedPage.url;
              } catch (error) {
                console.error('Error fetching related classic:', error);
                return null;
              }
            })
          );

          const validUrls = relatedUrls.filter((url): url is string => url !== null);

          const { data: insertedQuestion, error: questionError } = await supabase
            .from('great_questions')
            .upsert({
              notion_id: page.id,
              category: properties.Category?.select?.name || 'Uncategorized',
              category_number: categoryNumber,
              question: questionText,
              related_classics: validUrls
            }, {
              onConflict: 'notion_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // For each valid URL, create or update the book_questions relationship
          for (const url of validUrls) {
            const { data: book } = await supabase
              .from('books')
              .select('id')
              .eq('Notion_URL', url)
              .single();

            if (book) {
              await supabase
                .from('book_questions')
                .upsert({
                  question_id: insertedQuestion.id,
                  book_id: book.id,
                  notion_url: url,
                  randomizer: Math.random()
                }, {
                  onConflict: 'question_id,notion_url'
                });
            }
          }

          allQuestions.push(insertedQuestion);

        } catch (pageError) {
          console.error('Error processing page:', pageError);
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
      
      // Add a small delay between pages to help with rate limiting
      if (hasMore) {
        await delay(1000);
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
    console.error('Error in sync process:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})