import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }

    const notion = new Client({ auth: notionApiKey })
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Fetching questions from Notion database...')
    
    let allQuestions = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
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
          
          const classicsRelation = properties['The Classics']?.relation || [];
          console.log('The Classics relation:', classicsRelation);

          const relatedUrls = await Promise.all(
            classicsRelation.map(async (relation) => {
              try {
                const relatedPage = await notion.pages.retrieve({ page_id: relation.id });
                console.log('Retrieved related classic:', {
                  pageId: relation.id,
                  url: relatedPage.url
                });
                return relatedPage.url;
              } catch (error) {
                console.error('Error fetching related classic:', error);
                return null;
              }
            })
          );

          const validUrls = relatedUrls.filter((url): url is string => url !== null);
          console.log('Related classics URLs:', validUrls);

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

          if (questionError) {
            console.error('Error upserting question:', {
              error: questionError,
              questionData: {
                notion_id: page.id,
                category: properties.Category?.select?.name,
                category_number: categoryNumber,
                question: questionText,
                related_classics: validUrls
              }
            });
            continue;
          }

          console.log('Inserted/updated question:', insertedQuestion);
          allQuestions.push(insertedQuestion);

        } catch (pageError) {
          console.error('Error processing page:', {
            pageId: page.id,
            error: pageError.message,
            stack: pageError.stack,
            cause: pageError.cause
          });
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
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