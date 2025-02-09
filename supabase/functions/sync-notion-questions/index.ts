
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const BATCH_SIZE = 20; // Reduced batch size for more reliable processing
const DELAY_BETWEEN_BATCHES = 2000; // Increased delay between batches
const MAX_RETRIES = 7; // Increased max retries
const MAX_CONCURRENT_REQUESTS = 3; // Limit concurrent requests

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: corsHeaders,
      status: 405
    });
  }

  try {
    console.log('Starting Notion sync process...');
    
    const notionApiKey = Deno.env.get('NOTION_API_KEY');
    const notionDatabaseId = Deno.env.get('NOTION_DATABASE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!notionApiKey || !notionDatabaseId || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      throw new Error('Missing required environment variables');
    }

    const notion = new Client({ auth: notionApiKey });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Default illustrations based on category
    const defaultIllustrations = {
      'ETHICS': 'https://images.unsplash.com/photo-1473177104440-ffee2f376098',
      'THEOLOGY': 'https://images.unsplash.com/photo-1473177104440-ffee2f376098',
      'POLITICS': 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
      'AESTHETICS': 'https://images.unsplash.com/photo-1466442929976-97f336a657be',
      'ONTOLOGY': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      'EPISTEMOLOGY': 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7'
    };

    const defaultIllustration = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';

    let hasMore = true;
    let startCursor: string | undefined = undefined;
    let totalProcessed = 0;
    let pageCount = 0;
    let failedQuestions = 0;
    let retryQueue: any[] = [];

    // Function to process a single question with retries
    async function processQuestion(page: any, retryCount = 0): Promise<boolean> {
      try {
        const properties = page.properties;
        
        const categoryNumber = properties['Category Number']?.title?.[0]?.plain_text || null;
        const questionText = properties['Question']?.rich_text?.[0]?.plain_text;
        const category = (properties.Category?.select?.name || 'ETHICS').toUpperCase();
        
        if (!questionText) {
          console.log(`Skipping question with missing text (ID: ${page.id})`);
          return true;
        }

        const classicsRelation = properties['The Classics']?.relation || [];
        
        // Process related classics in smaller chunks
        const relatedUrls = [];
        for (let i = 0; i < classicsRelation.length; i++) {
          try {
            const relation = classicsRelation[i];
            const relatedPage = await notion.pages.retrieve({ page_id: relation.id });
            if (relatedPage.url) {
              relatedUrls.push(relatedPage.url);
            }
            // Add small delay between related page requests
            if (i < classicsRelation.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(`Error fetching related classic for question "${questionText}":`, error);
          }
        }

        const illustration = defaultIllustrations[category] || defaultIllustration;

        console.log(`Processing question ${totalProcessed + 1}: "${questionText.substring(0, 50)}..." (Category: ${category})`);

        const { error: questionError } = await supabase
          .from('great_questions')
          .upsert({
            notion_id: page.id,
            category: category,
            category_number: categoryNumber,
            question: questionText,
            related_classics: relatedUrls,
            illustration: illustration
          }, {
            onConflict: 'notion_id'
          });

        if (questionError) {
          throw questionError;
        }

        return true;
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying question after error (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return processQuestion(page, retryCount + 1);
        }
        console.error('Error processing question after max retries:', error);
        failedQuestions++;
        // Add to retry queue for a final attempt
        retryQueue.push(page);
        return false;
      }
    }

    // Main processing loop
    while (hasMore) {
      try {
        pageCount++;
        console.log(`Fetching page ${pageCount} of results${startCursor ? ' starting from cursor: ' + startCursor : ''}`);
        
        const response = await notion.databases.query({
          database_id: notionDatabaseId,
          start_cursor: startCursor,
          page_size: BATCH_SIZE,
        });

        console.log(`Received ${response.results.length} questions from current page`);
        
        // Process questions in smaller concurrent batches
        const currentBatch = response.results;
        let successfulProcessed = 0;
        
        // Process in chunks of MAX_CONCURRENT_REQUESTS
        for (let i = 0; i < currentBatch.length; i += MAX_CONCURRENT_REQUESTS) {
          const chunk = currentBatch.slice(i, i + MAX_CONCURRENT_REQUESTS);
          const results = await Promise.all(
            chunk.map(page => processQuestion(page))
          );
          
          successfulProcessed += results.filter(Boolean).length;
          totalProcessed += results.filter(Boolean).length;
          
          // Add delay between chunks
          if (i + MAX_CONCURRENT_REQUESTS < currentBatch.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        console.log(`Successfully processed ${successfulProcessed}/${currentBatch.length} questions in current batch`);
        console.log(`Total processed so far: ${totalProcessed}`);

        // Update pagination info
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;

        if (hasMore && !startCursor) {
          console.error('Has more pages but no cursor provided. Breaking loop to prevent infinite iteration.');
          hasMore = false;
        }

        // Add delay between batches
        if (hasMore) {
          console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before processing next batch...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }

      } catch (batchError) {
        console.error('Error processing batch:', batchError);
        // Increased delay on batch error
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES * 2));
      }
    }

    // Process retry queue if there are any failed questions
    if (retryQueue.length > 0) {
      console.log(`Attempting to process ${retryQueue.length} failed questions...`);
      let recoveredQuestions = 0;

      for (const page of retryQueue) {
        try {
          const success = await processQuestion(page, 0);
          if (success) {
            recoveredQuestions++;
            failedQuestions--;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Final retry failed for question:', error);
        }
      }

      console.log(`Recovered ${recoveredQuestions} questions from retry queue`);
    }

    const summary = {
      message: "Notion sync completed",
      timestamp: new Date().toISOString(),
      totalProcessed,
      pagesProcessed: pageCount,
      failedQuestions,
      retriedQuestions: retryQueue.length,
      status: failedQuestions === 0 ? "success" : "completed_with_errors"
    };

    console.log('Sync summary:', summary);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: corsHeaders,
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
        headers: corsHeaders,
        status: 500,
      },
    );
  }
});
