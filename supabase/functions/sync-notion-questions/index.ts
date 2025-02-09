
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const BATCH_SIZE = 50; // Increased from 10 to 50 for faster processing
const DELAY_BETWEEN_BATCHES = 1500; // Increased delay to prevent rate limiting
const MAX_RETRIES = 5; // Increased max retries

serve(async (req) => {
  // Handle CORS preflight requests
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
    let currentBatchSize = 0;
    let failedQuestions = 0;

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
        
        const relatedUrls = [];
        for (const relation of classicsRelation) {
          try {
            const relatedPage = await notion.pages.retrieve({ page_id: relation.id });
            if (relatedPage.url) {
              relatedUrls.push(relatedPage.url);
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
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return processQuestion(page, retryCount + 1);
        }
        console.error('Error processing question after max retries:', error);
        failedQuestions++;
        return false;
      }
    }

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
        
        // Process each question in the current batch
        currentBatchSize = response.results.length;
        let successfulProcessed = 0;

        for (const page of response.results) {
          const success = await processQuestion(page);
          if (success) {
            successfulProcessed++;
            totalProcessed++;
          }
        }

        console.log(`Successfully processed ${successfulProcessed}/${currentBatchSize} questions in current batch`);
        console.log(`Total processed so far: ${totalProcessed}`);

        // Update pagination info
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;

        if (hasMore && !startCursor) {
          console.error('Has more pages but no cursor provided. Breaking loop to prevent infinite iteration.');
          hasMore = false;
        }

        // Add delay between batches to prevent rate limiting
        if (hasMore) {
          console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before processing next batch...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }

      } catch (batchError) {
        console.error('Error processing batch:', batchError);
        // Don't throw here, try to continue with next batch
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES * 2));
      }
    }

    const summary = {
      message: "Notion sync completed",
      timestamp: new Date().toISOString(),
      totalProcessed,
      pagesProcessed: pageCount,
      failedQuestions,
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
