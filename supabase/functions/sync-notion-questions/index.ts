import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds
const BATCH_SIZE = 10; // Process 10 questions at a time

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
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('Starting Notion sync process...');
    
    const notionApiKey = Deno.env.get('NOTION_API_KEY');
    const notionDatabaseId = Deno.env.get('NOTION_DATABASE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!notionApiKey || !notionDatabaseId || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const notion = new Client({ auth: notionApiKey });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching questions from Notion database...');
    
    let hasMore = true;
    let startCursor = undefined;
    let totalProcessed = 0;
    let successCount = 0;

    while (hasMore) {
      const response = await fetchWithRetry(async () => {
        return await notion.databases.query({
          database_id: notionDatabaseId,
          start_cursor: startCursor,
          page_size: BATCH_SIZE,
        });
      });

      console.log(`Processing batch of ${response.results.length} questions`);

      for (const page of response.results) {
        try {
          const properties = page.properties;
          const categoryNumber = properties['Category Number']?.title?.[0]?.plain_text || null;
          const questionText = properties['Question']?.rich_text?.[0]?.plain_text || 'No question text';
          
          const classicsRelation = properties['The Classics']?.relation || [];
          
          // Process related URLs in smaller batches
          const relatedUrls = [];
          for (const relation of classicsRelation) {
            try {
              const relatedPage = await fetchWithRetry(async () => {
                return await notion.pages.retrieve({ page_id: relation.id });
              });
              if (relatedPage.url) {
                relatedUrls.push(relatedPage.url);
              }
              // Small delay between relation fetches
              await delay(100);
            } catch (error) {
              console.error('Error fetching related classic:', error);
            }
          }

          const { data: insertedQuestion, error: questionError } = await supabase
            .from('great_questions')
            .upsert({
              notion_id: page.id,
              category: properties.Category?.select?.name || 'Uncategorized',
              category_number: categoryNumber,
              question: questionText,
              related_classics: relatedUrls
            }, {
              onConflict: 'notion_id'
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Process book relations one at a time
          for (const url of relatedUrls) {
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
                  randomizer: Math.random()
                }, {
                  onConflict: 'question_id,book_id'
                });
            }
          }

          successCount++;
        } catch (pageError) {
          console.error('Error processing page:', pageError);
        }
        
        totalProcessed++;
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
      
      // Add delay between batches
      if (hasMore) {
        await delay(500);
      }
    }

    console.log('Sync completed successfully');
    return new Response(
      JSON.stringify({
        message: "Successfully synced questions from Notion",
        timestamp: new Date().toISOString(),
        totalProcessed,
        successCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
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
    );
  }
});