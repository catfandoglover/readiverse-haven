
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to extract thinker names from DNA analysis
function extractThinkersFromAnalysis(analysisData: Record<string, string>): string[] {
  const thinkers: string[] = [];
  
  // Extract thinker names from all kindred_spirit and challenging_voice fields
  const domains = ['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'];
  
  domains.forEach(domain => {
    for (let i = 1; i <= 5; i++) {
      // Extract kindred spirit thinkers
      const kindredSpiritKey = `${domain}_kindred_spirit_${i}`;
      if (analysisData[kindredSpiritKey]) {
        thinkers.push(analysisData[kindredSpiritKey]);
      }
      
      // Extract challenging voice thinkers
      const challengingVoiceKey = `${domain}_challenging_voice_${i}`;
      if (analysisData[challengingVoiceKey]) {
        thinkers.push(analysisData[challengingVoiceKey]);
      }
    }
  });
  
  // Also add most_kindred_spirit and most_challenging_voice if they exist
  if (analysisData.most_kindred_spirit) {
    thinkers.push(analysisData.most_kindred_spirit);
  }
  
  if (analysisData.most_challenging_voice) {
    thinkers.push(analysisData.most_challenging_voice);
  }
  
  return [...new Set(thinkers)]; // Remove duplicates
}

// Helper to extract classic texts from DNA analysis
function extractClassicsFromAnalysis(analysisData: Record<string, string>): string[] {
  const classics: string[] = [];
  
  // Extract classic text titles from all kindred_spirit_classic and challenging_voice_classic fields
  const domains = ['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'];
  
  domains.forEach(domain => {
    for (let i = 1; i <= 5; i++) {
      // Extract kindred spirit classics
      const kindredSpiritClassicKey = `${domain}_kindred_spirit_${i}_classic`;
      if (analysisData[kindredSpiritClassicKey]) {
        // Extract just the title part (removing year/date in parentheses)
        const classicMatch = analysisData[kindredSpiritClassicKey].match(/([^(]+)(?:\s*\(\d+\))?/);
        if (classicMatch && classicMatch[1]) {
          classics.push(classicMatch[1].trim());
        } else {
          classics.push(analysisData[kindredSpiritClassicKey]);
        }
      }
      
      // Extract challenging voice classics
      const challengingVoiceClassicKey = `${domain}_challenging_voice_${i}_classic`;
      if (analysisData[challengingVoiceClassicKey]) {
        // Extract just the title part (removing year/date in parentheses)
        const classicMatch = analysisData[challengingVoiceClassicKey].match(/([^(]+)(?:\s*\(\d+\))?/);
        if (classicMatch && classicMatch[1]) {
          classics.push(classicMatch[1].trim());
        } else {
          classics.push(analysisData[challengingVoiceClassicKey]);
        }
      }
    }
  });
  
  return [...new Set(classics)]; // Remove duplicates
}

async function performSemanticMatching(items: string[], type: 'thinker' | 'classic', analysisId: string | null) {
  if (items.length === 0) return { matched: [], unmatched: [] };

  try {
    let dbItems: any[] = [];
    let itemsToLookup: string[];
    
    // Fetch all items from database at once to minimize queries
    if (type === 'thinker') {
      const { data, error } = await supabase
        .from('icons')
        .select('id, name');
      
      if (error) throw error;
      dbItems = data || [];
      itemsToLookup = items;
    } else { // classic texts
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author');
      
      if (error) throw error;
      dbItems = data || [];
      itemsToLookup = items;
    }

    // If we have a reasonable amount of items to check, use Gemini for semantic matching
    if (items.length > 0 && dbItems.length > 0) {
      console.log(`Performing semantic matching for ${items.length} ${type}s against ${dbItems.length} database entries`);

      const prompt = `
I need to match these ${type} names/titles from a philosophical DNA analysis against our database entries. 
For each item in List A, find the best semantic match from List B, or indicate if there's no good match.

List A (from analysis):
${itemsToLookup.map((item, i) => `${i+1}. "${item}"`).join('\n')}

List B (from database):
${dbItems.map((item, i) => {
  if (type === 'thinker') {
    return `${i+1}. ID: ${item.id}, Name: "${item.name}"`;
  } else {
    return `${i+1}. ID: ${item.id}, Title: "${item.title}", Author: ${item.author || 'Unknown'}`;
  }
}).join('\n')}

For each item in List A, provide:
1. The item name/title from List A
2. The best matching database ID from List B (just the UUID), or "no_match" if no good semantic match is found
3. A confidence score (0-100) indicating how confident you are in the match

Format your response as a JSON array of objects with properties: "item", "match_id", "confidence".
Provide the raw JSON array only, with no additional explanation or text.
`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Lovable.dev'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API responded with status: ${response.status}`);
      }

      const responseData = await response.json();
      let matchResults: { item: string, match_id: string, confidence: number }[] = [];
      
      try {
        const content = responseData.choices[0].message.content;
        // Parse the JSON content
        matchResults = JSON.parse(content);
      } catch (parseError) {
        console.error("Error parsing LLM response:", parseError);
        console.log("Raw response:", responseData.choices[0].message.content);
        // Fallback to empty results
        matchResults = [];
      }

      console.log(`Got ${matchResults.length} match results`);

      // Filter results into matched and unmatched
      const matched = matchResults
        .filter(result => result.match_id !== "no_match" && result.confidence >= 70)
        .map(result => ({
          item: result.item,
          db_id: result.match_id,
          confidence: result.confidence
        }));

      const unmatched = matchResults
        .filter(result => result.match_id === "no_match" || result.confidence < 70)
        .map(result => result.item);

      // Record unmatched entities in the database if we have an analysis ID
      if (unmatched.length > 0 && analysisId) {
        try {
          const unmatchedData = type === 'thinker' ? 
            { analysis_id: analysisId, unmatched_thinkers: unmatched } : 
            { analysis_id: analysisId, unmatched_classics: unmatched };
          
          const { data, error } = await supabase
            .from('dna_unmatched_entities')
            .upsert([unmatchedData], { onConflict: 'analysis_id' });
          
          if (error) {
            console.error(`Error storing unmatched ${type}s:`, error);
          } else {
            console.log(`Stored ${unmatched.length} unmatched ${type}s in database`);
          }
        } catch (storageError) {
          console.error(`Error in unmatched ${type}s storage:`, storageError);
        }
      }

      return { matched, unmatched };
    } else {
      console.log(`Not enough data to perform semantic matching for ${type}s`);
      return { matched: [], unmatched: items };
    }
  } catch (error) {
    console.error(`Error in semantic matching for ${type}s:`, error);
    return { matched: [], unmatched: items };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisData, analysisId } = await req.json();
    
    // Enhanced validation to ensure at least one parameter is provided
    if (!analysisData && !analysisId) {
      throw new Error('Either analysisData or analysisId must be provided');
    }
    
    let dataToValidate: Record<string, string> = {};
    
    if (analysisId) {
      // Fetch the analysis data from the database
      const { data, error } = await supabase
        .from('dna_analysis_results')
        .select('*')
        .eq('id', analysisId)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) throw new Error(`No analysis found with id: ${analysisId}`);
      
      dataToValidate = data;
    } else if (analysisData) {
      // Use the provided analysis data directly
      dataToValidate = analysisData;
    } else {
      // This should never happen due to earlier validation, but just in case
      throw new Error('No valid data source provided for validation');
    }
    
    // The actual analysis ID to use for storage, or null if we're validating pre-storage data
    const actualAnalysisId = analysisId || null;
    
    console.log(`Validating entities ${actualAnalysisId ? 'for analysis ID: ' + actualAnalysisId : 'for pre-storage data'}`);
    
    // Extract thinkers and classics from the analysis
    const thinkers = extractThinkersFromAnalysis(dataToValidate);
    const classics = extractClassicsFromAnalysis(dataToValidate);
    
    console.log(`Extracted ${thinkers.length} thinkers and ${classics.length} classics from analysis`);
    
    // Perform semantic matching for thinkers and classics
    const thinkerResults = await performSemanticMatching(thinkers, 'thinker', actualAnalysisId);
    const classicResults = await performSemanticMatching(classics, 'classic', actualAnalysisId);

    // Generate validation report
    const validationReport = {
      analysisId: actualAnalysisId,
      thinkers: {
        total: thinkers.length,
        matched: thinkerResults.matched.length,
        unmatched: thinkerResults.unmatched.length,
        matchDetails: thinkerResults.matched,
        unmatchedItems: thinkerResults.unmatched
      },
      classics: {
        total: classics.length,
        matched: classicResults.matched.length,
        unmatched: classicResults.unmatched.length,
        matchDetails: classicResults.matched,
        unmatchedItems: classicResults.unmatched
      },
      summary: {
        totalEntities: thinkers.length + classics.length,
        totalMatched: thinkerResults.matched.length + classicResults.matched.length,
        totalUnmatched: thinkerResults.unmatched.length + classicResults.unmatched.length,
        matchRate: thinkers.length + classics.length > 0 ? 
          ((thinkerResults.matched.length + classicResults.matched.length) / 
           (thinkers.length + classics.length) * 100).toFixed(2) + '%' : 
          '0%'
      }
    };
    
    return new Response(JSON.stringify(validationReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in validate-dna-entities function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
