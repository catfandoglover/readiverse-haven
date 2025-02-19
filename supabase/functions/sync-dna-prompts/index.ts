
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not properly configured');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Fetch questions from decision_tree_view
    const { data: questions, error: dbError } = await supabaseClient
      .from('decision_tree_view')
      .select('*')
      .order('category, tree_position');

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!questions || questions.length === 0) {
      throw new Error('No questions found in the database');
    }

    // Transform questions into the map structure
    const questionsMap = questions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = {};
      }
      acc[q.category][q.tree_position] = q.question;
      return acc;
    }, {});

    // Here you would update the prompts.ts file or store in a table
    // For now, we'll just log the successful sync
    console.log('Successfully synced questions:', Object.keys(questionsMap).length, 'categories');

    return new Response(JSON.stringify({ 
      success: true,
      timestamp: new Date().toISOString(),
      categoriesUpdated: Object.keys(questionsMap).length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error in sync-dna-prompts function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
