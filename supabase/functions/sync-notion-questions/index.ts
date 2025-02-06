import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
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

    console.log('Fetching questions from Notion database...');
    
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      page_size: 5, // Reduced batch size to prevent timeouts
    });

    console.log(`Processing ${response.results.length} questions`);
    let successCount = 0;

    for (const page of response.results) {
      try {
        const properties = page.properties;
        const categoryNumber = properties['Category Number']?.title?.[0]?.plain_text || null;
        const questionText = properties['Question']?.rich_text?.[0]?.plain_text || 'No question text';
        
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

        const { error: questionError } = await supabase
          .from('great_questions')
          .upsert({
            notion_id: page.id,
            category: properties.Category?.select?.name || 'Uncategorized',
            category_number: categoryNumber,
            question: questionText,
            related_classics: relatedUrls
          }, {
            onConflict: 'notion_id'
          });

        if (questionError) {
          console.error('Error upserting question:', questionError);
          throw questionError;
        }
        successCount++;
        console.log(`Successfully processed question ${successCount}`);
      } catch (pageError) {
        console.error('Error processing page:', pageError);
      }
    }

    console.log('Sync completed successfully');
    return new Response(
      JSON.stringify({
        message: "Successfully synced questions from Notion",
        timestamp: new Date().toISOString(),
        processed: response.results.length,
        success: successCount
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