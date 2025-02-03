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

    if (!notionApiKey || !notionDatabaseId || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({
          error: 'Server configuration error - missing required environment variables'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Initialize Notion client
    const notion = new Client({ auth: notionApiKey })
    
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Fetching questions from Notion database...')
    
    let allQuestions = [];
    let hasMore = true;
    let startCursor = undefined;

    // Fetch all pages from the Notion database using pagination
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: notionDatabaseId,
        start_cursor: startCursor,
        page_size: 100, // Maximum allowed by Notion API
      });

      console.log(`Fetched ${response.results.length} questions from current page`);

      // Process each page and extract question data
      const questions = response.results.map(page => {
        const properties = page.properties
        
        // Debug logging to see the structure of the properties
        console.log('Page properties:', JSON.stringify(properties, null, 2))
        
        // Extract category number (title of the question)
        const categoryNumber = properties['Category Number']?.title?.[0]?.plain_text || null
        
        // Extract the question text
        const questionText = properties['Question']?.rich_text?.[0]?.plain_text || 'No question text'
        
        return {
          notion_id: page.id,
          category: properties.Category?.select?.name || 'Uncategorized',
          category_number: categoryNumber,
          question: questionText,
        }
      });

      allQuestions = [...allQuestions, ...questions];
      
      // Update pagination info
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    console.log(`Total questions fetched: ${allQuestions.length}`);
    console.log('Questions to be inserted:', JSON.stringify(allQuestions, null, 2));
    console.log('Inserting questions into Supabase...');

    // Insert questions into Supabase, using upsert to avoid duplicates
    const { data, error } = await supabase
      .from('great_questions')
      .upsert(
        allQuestions,
        { 
          onConflict: 'notion_id',
          ignoreDuplicates: false 
        }
      );

    if (error) {
      console.error('Error inserting questions:', error);
      throw error;
    }

    console.log('Successfully synced questions with Supabase');

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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})