
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

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

    console.log('Starting to fetch all questions from Notion database...');
    
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;
    let totalProcessed = 0;

    // Default illustrations based on category
    const defaultIllustrations = {
      'ETHICS': 'https://images.unsplash.com/photo-1473177104440-ffee2f376098',
      'THEOLOGY': 'https://images.unsplash.com/photo-1473177104440-ffee2f376098',
      'POLITICS': 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
      'AESTHETICS': 'https://images.unsplash.com/photo-1466442929976-97f336a657be',
      'ONTOLOGY': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      'EPISTEMOLOGY': 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7'
    };

    // Global fallback illustration
    const defaultIllustration = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';

    while (hasMore) {
      try {
        console.log(`Fetching page of results${startCursor ? ' starting from cursor: ' + startCursor : ''}`);
        
        const response = await notion.databases.query({
          database_id: notionDatabaseId,
          start_cursor: startCursor,
          page_size: 100,
        });

        console.log(`Processing ${response.results.length} questions from current page`);

        for (const page of response.results) {
          try {
            const properties = page.properties;
            
            // Extract and validate required fields
            const categoryNumber = properties['Category Number']?.title?.[0]?.plain_text || null;
            const questionText = properties['Question']?.rich_text?.[0]?.plain_text;
            const category = (properties.Category?.select?.name || 'ETHICS').toUpperCase();
            
            // Skip if question text is missing
            if (!questionText) {
              console.log('Skipping question with missing text');
              continue;
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
                console.error('Error fetching related classic:', error);
              }
            }

            // Get category-specific illustration or fall back to default
            const illustration = defaultIllustrations[category] || defaultIllustration;

            console.log(`Processing question: "${questionText}" with category ${category}`);

            const { data, error: questionError } = await supabase
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
              console.error('Error upserting question:', questionError);
              throw questionError;
            }

            totalProcessed++;
            console.log(`Successfully processed question ${totalProcessed}: ${questionText}`);
          } catch (pageError) {
            console.error('Error processing page:', pageError);
          }
        }

        // Update pagination info for next iteration
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;

      } catch (batchError) {
        console.error('Error processing batch:', batchError);
        throw batchError;
      }
    }

    console.log('Sync completed successfully');
    return new Response(
      JSON.stringify({
        message: "Successfully synced questions from Notion",
        timestamp: new Date().toISOString(),
        totalProcessed: totalProcessed
      }),
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

