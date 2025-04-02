import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Supabase client with error handling
const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThinkerClassicPair {
  thinker: string;
  classic: string;
  domain: string;
  type: 'kindred_spirit' | 'challenging_voice';
  index: number;
}

// Helper to extract thinker names from DNA analysis
function extractThinkersFromAnalysis(analysisData: Record<string, any>): string[] {
  const thinkers: string[] = [];
  console.log('Starting thinker extraction from analysis data');
  
  // Extract thinker names from all kindred_spirit and challenging_voice fields
  const domains = ['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'];
  
  domains.forEach(domain => {
    console.log(`Processing domain: ${domain}`);
    for (let i = 1; i <= 5; i++) {
      // Extract kindred spirit thinkers
      const kindredSpiritKey = `${domain}_kindred_spirit_${i}`;
      if (analysisData[kindredSpiritKey]) {
        thinkers.push(analysisData[kindredSpiritKey]);
        console.log(`Found kindred spirit: ${kindredSpiritKey} = ${analysisData[kindredSpiritKey]}`);
      } else {
        console.log(`Not found: ${kindredSpiritKey}`);
      }
      
      // Extract challenging voice thinkers
      const challengingVoiceKey = `${domain}_challenging_voice_${i}`;
      if (analysisData[challengingVoiceKey]) {
        thinkers.push(analysisData[challengingVoiceKey]);
        console.log(`Found challenging voice: ${challengingVoiceKey} = ${analysisData[challengingVoiceKey]}`);
      } else {
        console.log(`Not found: ${challengingVoiceKey}`);
      }
    }
  });
  
  // Also add most_kindred_spirit and most_challenging_voice if they exist
  if (analysisData.most_kindred_spirit) {
    thinkers.push(analysisData.most_kindred_spirit);
    console.log(`Found most_kindred_spirit: ${analysisData.most_kindred_spirit}`);
  }
  
  if (analysisData.most_challenging_voice) {
    thinkers.push(analysisData.most_challenging_voice);
    console.log(`Found most_challenging_voice: ${analysisData.most_challenging_voice}`);
  }
  
  const uniqueThinkers = [...new Set(thinkers)]; // Remove duplicates
  console.log(`Total unique thinkers extracted: ${uniqueThinkers.length}`);
  console.log('First 5 thinkers:', uniqueThinkers.slice(0, 5));
  
  return uniqueThinkers;
}

// Helper to extract classic texts from DNA analysis
function extractClassicsFromAnalysis(analysisData: Record<string, any>): string[] {
  const classics: string[] = [];
  console.log('Starting classics extraction from analysis data');
  
  // Extract classic text titles from all kindred_spirit_classic and challenging_voice_classic fields
  const domains = ['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'];
  
  domains.forEach(domain => {
    console.log(`Processing classics for domain: ${domain}`);
    for (let i = 1; i <= 5; i++) {
      // Extract kindred spirit classics
      const kindredSpiritClassicKey = `${domain}_kindred_spirit_${i}_classic`;
      if (analysisData[kindredSpiritClassicKey]) {
        // Extract just the title part (removing year/date in parentheses)
        const classicMatch = String(analysisData[kindredSpiritClassicKey]).match(/([^(]+)(?:\s*\(\d+\))?/);
        if (classicMatch && classicMatch[1]) {
          classics.push(classicMatch[1].trim());
          console.log(`Found kindred classic: ${kindredSpiritClassicKey} = ${classicMatch[1].trim()}`);
        } else {
          classics.push(String(analysisData[kindredSpiritClassicKey]));
          console.log(`Found kindred classic (no match): ${kindredSpiritClassicKey} = ${analysisData[kindredSpiritClassicKey]}`);
        }
      } else {
        console.log(`Not found: ${kindredSpiritClassicKey}`);
      }
      
      // Extract challenging voice classics
      const challengingVoiceClassicKey = `${domain}_challenging_voice_${i}_classic`;
      if (analysisData[challengingVoiceClassicKey]) {
        // Extract just the title part (removing year/date in parentheses)
        const classicMatch = String(analysisData[challengingVoiceClassicKey]).match(/([^(]+)(?:\s*\(\d+\))?/);
        if (classicMatch && classicMatch[1]) {
          classics.push(classicMatch[1].trim());
          console.log(`Found challenging classic: ${challengingVoiceClassicKey} = ${classicMatch[1].trim()}`);
        } else {
          classics.push(String(analysisData[challengingVoiceClassicKey]));
          console.log(`Found challenging classic (no match): ${challengingVoiceClassicKey} = ${analysisData[challengingVoiceClassicKey]}`);
        }
      } else {
        console.log(`Not found: ${challengingVoiceClassicKey}`);
      }
    }
  });
  
  const uniqueClassics = [...new Set(classics)]; // Remove duplicates
  console.log(`Total unique classics extracted: ${uniqueClassics.length}`);
  console.log('First 5 classics:', uniqueClassics.slice(0, 5));
  
  return uniqueClassics;
}

// Helper to extract thinker-classic pairs from DNA analysis
function extractThinkerClassicPairs(analysisData: Record<string, any>): ThinkerClassicPair[] {
  const pairs: ThinkerClassicPair[] = [];
  console.log('Starting thinker-classic pair extraction from analysis data');
  
  const domains = ['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'];
  
  domains.forEach(domain => {
    console.log(`Processing domain: ${domain}`);
    for (let i = 1; i <= 5; i++) {
      // Process kindred spirit pairs
      const kindredSpiritKey = `${domain}_kindred_spirit_${i}`;
      const kindredSpiritClassicKey = `${domain}_kindred_spirit_${i}_classic`;
      
      if (analysisData[kindredSpiritKey] && analysisData[kindredSpiritClassicKey]) {
        const classicMatch = String(analysisData[kindredSpiritClassicKey]).match(/([^(]+)(?:\s*\(\d+\))?/);
        const classic = classicMatch && classicMatch[1] ? classicMatch[1].trim() : String(analysisData[kindredSpiritClassicKey]);
        
        pairs.push({
          thinker: analysisData[kindredSpiritKey],
          classic,
          domain,
          type: 'kindred_spirit',
          index: i
        });
        console.log(`Found kindred spirit pair: ${analysisData[kindredSpiritKey]} - ${classic}`);
      }
      
      // Process challenging voice pairs
      const challengingVoiceKey = `${domain}_challenging_voice_${i}`;
      const challengingVoiceClassicKey = `${domain}_challenging_voice_${i}_classic`;
      
      if (analysisData[challengingVoiceKey] && analysisData[challengingVoiceClassicKey]) {
        const classicMatch = String(analysisData[challengingVoiceClassicKey]).match(/([^(]+)(?:\s*\(\d+\))?/);
        const classic = classicMatch && classicMatch[1] ? classicMatch[1].trim() : String(analysisData[challengingVoiceClassicKey]);
        
        pairs.push({
          thinker: analysisData[challengingVoiceKey],
          classic,
          domain,
          type: 'challenging_voice',
          index: i
        });
        console.log(`Found challenging voice pair: ${analysisData[challengingVoiceKey]} - ${classic}`);
      }
    }
  });
  
  // Add most kindred spirit and challenging voice if they exist
  if (analysisData.most_kindred_spirit && analysisData.most_kindred_spirit_classic) {
    const classicMatch = String(analysisData.most_kindred_spirit_classic).match(/([^(]+)(?:\s*\(\d+\))?/);
    const classic = classicMatch && classicMatch[1] ? classicMatch[1].trim() : String(analysisData.most_kindred_spirit_classic);
    
    pairs.push({
      thinker: analysisData.most_kindred_spirit,
      classic,
      domain: 'overall',
      type: 'kindred_spirit',
      index: 0
    });
  }
  
  if (analysisData.most_challenging_voice && analysisData.most_challenging_voice_classic) {
    const classicMatch = String(analysisData.most_challenging_voice_classic).match(/([^(]+)(?:\s*\(\d+\))?/);
    const classic = classicMatch && classicMatch[1] ? classicMatch[1].trim() : String(analysisData.most_challenging_voice_classic);
    
    pairs.push({
      thinker: analysisData.most_challenging_voice,
      classic,
      domain: 'overall',
      type: 'challenging_voice',
      index: 0
    });
  }
  
  console.log(`Total thinker-classic pairs extracted: ${pairs.length}`);
  return pairs;
}

function parseMatches(content: string, items: string[], dbItems: any[]): { matched: { item: string, db_id: string, confidence: number }[], unmatched: string[] } {
  const matched: { item: string, db_id: string, confidence: number }[] = [];
  const unmatched: string[] = [];
  
  // Split the content into individual match entries
  const entries = content.split('\n\n').filter(entry => entry.trim());
  
  for (const entry of entries) {
    const lines = entry.split('\n').map(line => line.trim());
    const itemMatch = lines.find(line => line.startsWith('Item:'));
    const matchMatch = lines.find(line => line.startsWith('Match:'));
    const confidenceMatch = lines.find(line => line.startsWith('Confidence:'));
    
    if (!itemMatch || !matchMatch || !confidenceMatch) {
      console.log('Skipping malformed entry:', entry);
      continue;
    }
    
    const itemIndex = parseInt(itemMatch.split(':')[1].trim()) - 1;
    const matchText = matchMatch.split(':')[1].trim();
    const confidence = parseFloat(confidenceMatch.split(':')[1].trim());
    
    if (itemIndex < 0 || itemIndex >= items.length) {
      console.log('Invalid item index:', itemIndex);
      continue;
    }
    
    const item = items[itemIndex];
    
    if (matchText === 'No match' || confidence < 0.7) {
      unmatched.push(item);
      continue;
    }
    
    const matchIndex = parseInt(matchText) - 1;
    if (matchIndex < 0 || matchIndex >= dbItems.length) {
      console.log('Invalid match index:', matchIndex);
      unmatched.push(item);
      continue;
    }
    
    const dbItem = dbItems[matchIndex];
    matched.push({
      item,
      db_id: dbItem.id,
      confidence
    });
  }
  
  // Add any items that weren't processed to unmatched
  const processedItems = new Set(matched.map(m => m.item));
  const missingItems = items.filter(item => !processedItems.has(item));
  unmatched.push(...missingItems);
  
  return { matched, unmatched };
}

// Fetch all items from DB with pagination support
async function fetchAllItems(type: 'thinker' | 'classic'): Promise<any[]> {
  const pageSize = 1000;
  let allItems: any[] = [];
  let page = 0;
  let hasMoreData = true;
  
  try {
    while (hasMoreData) {
      const query = type === 'thinker' 
        ? supabase.from('icons').select('id, name').range(page * pageSize, (page + 1) * pageSize - 1)
        : supabase.from('books').select('id, title, author').range(page * pageSize, (page + 1) * pageSize - 1);
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${type}s (page ${page}):`, error);
        throw error;
      }
      
      if (data && data.length > 0) {
        allItems = [...allItems, ...data];
        page++;
        
        // Check if we likely have more data
        if (data.length < pageSize) {
          hasMoreData = false;
        }
      } else {
        hasMoreData = false;
      }
    }
    
    console.log(`Successfully fetched ${allItems.length} ${type}s from database`);
    return allItems;
  } catch (error) {
    console.error(`Error in fetchAllItems for ${type}:`, error);
    return [];
  }
}

// IMPROVED: Store unmatched entities using assessment_id for linking
async function storeUnmatchedEntities(
  assessment_id: string | null,
  analysis_id: string | null,
  thinkers: string[] = [],
  classics: string[] = []
): Promise<boolean> {
  // Enhanced logging to help debug missing IDs
  if (!assessment_id && !analysis_id) {
    console.error('No assessment_id or analysis_id provided, cannot store unmatched entities');
    console.error('assessment_id:', assessment_id);
    console.error('analysis_id:', analysis_id);
    return false;
  }
  
  if (thinkers.length === 0 && classics.length === 0) {
    console.log(`No unmatched entities to store for assessment_id ${assessment_id || 'unknown'}`);
    return true;
  }
  
  try {
    console.log(`Storing unmatched entities for assessment_id ${assessment_id || 'unknown'}:`, {
      thinkers: thinkers.length,
      classics: classics.length
    });
    
    // Create data object for upsert
    const data: Record<string, any> = {
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add the appropriate ID for linking
    if (analysis_id) {
      data.analysis_id = analysis_id;
    }
    
    // Add assessment_id if available (our new approach)
    if (assessment_id) {
      data.assessment_id = assessment_id;
    }
    
    // Add entities if provided
    if (thinkers.length > 0) {
      data.unmatched_thinkers = thinkers;
    }
    
    if (classics.length > 0) {
      data.unmatched_classics = classics;
    }
    
    // Log complete insert data for debugging
    console.log('Upsert data:', JSON.stringify(data));
    
    // If we have an analysis_id, upsert based on that
    if (analysis_id) {
      const { error } = await supabase
        .from('dna_unmatched_entities')
        .upsert([data], { 
          onConflict: 'analysis_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error storing unmatched entities:`, error);
        console.error(`Full error details:`, JSON.stringify(error));
        return false;
      }
    } 
    // If we have only assessment_id, upsert based on that
    else if (assessment_id) {
      const { error } = await supabase
        .from('dna_unmatched_entities')
        .upsert([data], { 
          onConflict: 'assessment_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error storing unmatched entities:`, error);
        console.error(`Full error details:`, JSON.stringify(error));
        return false;
      }
    }
    
    console.log(`Successfully stored unmatched entities for ${analysis_id ? 'analysis_id' : 'assessment_id'} ${analysis_id || assessment_id}`);
    return true;
  } catch (error) {
    console.error(`Exception in storeUnmatchedEntities:`, error);
    return false;
  }
}

async function performSemanticMatching(
  items: string[], 
  type: 'thinker' | 'classic', 
  assessment_id: string | null, 
  analysis_id: string | null
): Promise<{ matched: { item: string, db_id: string, confidence: number }[], unmatched: string[], error?: string }> {
  // Enhanced logging for debugging
  console.log(`Starting semantic matching with IDs - assessment_id: ${assessment_id || 'null'}, analysis_id: ${analysis_id || 'null'}`);
  
  if (items.length === 0) {
    console.log(`No ${type}s to match, returning empty results`);
    return { matched: [], unmatched: [] };
  }

  try {
    // Fetch all items from database with pagination
    const dbItems = await fetchAllItems(type);
    const itemsToLookup = items;
    
    // If we have a reasonable amount of items to check, use OpenRouter for semantic matching
    if (items.length > 0 && dbItems.length > 0) {
      console.log(`Performing semantic matching for ${items.length} ${type}s against ${dbItems.length} database entries`);

      // Process in batches if we have too many items to match
      const batchSize = 50; // Adjust based on what the LLM can handle
      let matched: { item: string, db_id: string, confidence: number }[] = [];
      let unmatched: string[] = [];
      
      // Process items in batches
      for (let i = 0; i < itemsToLookup.length; i += batchSize) {
        const itemsBatch = itemsToLookup.slice(i, i + batchSize);
        
        // Ensure we have a valid API key
        if (!openrouterApiKey || openrouterApiKey.trim() === '') {
          console.error('No OpenRouter API key provided');
          // Store unmatched entities before returning
          if (assessment_id || analysis_id) {
            await storeUnmatchedEntities(assessment_id, analysis_id, type === 'thinker' ? itemsBatch : [], type === 'classic' ? itemsBatch : []);
          }
          return { 
            matched: [], 
            unmatched: itemsToLookup, 
            error: 'No OpenRouter API key provided' 
          };
        }
        
        const prompt = `
I need to match these philosophical thinkers and their works from a DNA analysis against our database entries.
For each item in List A, find the best semantic match from List B, or indicate if there's no good match.

List A (from analysis):
${itemsBatch.map((item, i) => `${i+1}. "${item}"`).join('\n')}

List B (from database):
${dbItems.map((item, i) => {
  if (type === 'thinker') {
    return `${i+1}. ID: ${item.id}, Name: "${item.name}"`;
  } else {
    return `${i+1}. ID: ${item.id}, Title: "${item.title}"`;
  }
}).join('\n')}

For each item in List A, respond with:
1. The number of the best match from List B (or "No match" if none found)
2. A confidence score from 0-1
3. A brief explanation of why this is a good match

Format each response as:
Item: [List A number]
Match: [List B number or "No match"]
Confidence: [0-1]
Explanation: [brief explanation]

Example:
Item: 1
Match: 3
Confidence: 0.95
Explanation: Exact name match with minor spelling variation

Item: 2
Match: No match
Confidence: 0
Explanation: No similar entries found in database

Please analyze each item carefully, considering:
- Exact matches (including common variations in spelling or formatting)
- Semantic similarity in meaning and context
- Historical and philosophical context
- The relationship between thinkers and their works
`;

        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openrouterApiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://readiverse.com',
              'X-Title': 'Readiverse DNA Analysis'
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-pro-exp-03-25:free',
              messages: [
                {
                  role: 'system',
                  content: 'You are a precise matching system for philosophical thinkers and their works. Your task is to match entries from a DNA analysis against a database of known philosophers and their works. Consider both exact matches and semantic similarity, paying special attention to the relationship between thinkers and their classic works.'
                },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: prompt
                    }
                  ]
                }
              ],
              temperature: 0.1,
              max_tokens: 2000
            })
          });

          if (!response.ok) {
            throw new Error(`API error! Status: ${response.status}`);
          }

          const result = await response.json();
          const content = result.choices[0].message.content;
          
          // Parse the response and extract matches
          const matches = parseMatches(content, itemsBatch, dbItems);
          matched = [...matched, ...matches.matched];
          unmatched = [...unmatched, ...matches.unmatched];
          
        } catch (apiError) {
          console.error(`Error in batch ${i/batchSize + 1}:`, apiError);
          // Add all items in this batch to unmatched
          unmatched = [...unmatched, ...itemsBatch];
          
          // Store unmatched entities from this batch
          if (assessment_id || analysis_id) {
            await storeUnmatchedEntities(
              assessment_id, 
              analysis_id, 
              type === 'thinker' ? itemsBatch : [], 
              type === 'classic' ? itemsBatch : []
            );
          }
        }
      }

      console.log(`Total matched: ${matched.length}, Total unmatched: ${unmatched.length}`);

      // Store any remaining unmatched entities
      if (unmatched.length > 0 && (assessment_id || analysis_id)) {
        console.log(`Storing ${unmatched.length} unmatched ${type}s with assessment_id: ${assessment_id}, analysis_id: ${analysis_id}`);
        await storeUnmatchedEntities(
          assessment_id, 
          analysis_id, 
          type === 'thinker' ? unmatched : [], 
          type === 'classic' ? unmatched : []
        );
      }

      return { matched, unmatched };
    } else {
      console.log(`Not enough data to perform semantic matching for ${type}s`);
      // Store all items as unmatched if we can't perform matching
      if (items.length > 0 && (assessment_id || analysis_id)) {
        await storeUnmatchedEntities(
          assessment_id, 
          analysis_id, 
          type === 'thinker' ? items : [], 
          type === 'classic' ? items : []
        );
      }
      return { matched: [], unmatched: items };
    }
  } catch (error) {
    console.error(`Error in semantic matching for ${type}s:`, error);
    // Store all items as unmatched in case of error
    if (items.length > 0 && (assessment_id || analysis_id)) {
      await storeUnmatchedEntities(
        assessment_id, 
        analysis_id, 
        type === 'thinker' ? items : [], 
        type === 'classic' ? items : []
      );
    }
    return { matched: [], unmatched: items, error: `Matching error: ${error.message || 'Unknown error'}` };
  }
}

export async function validateDNAEntities(assessment_id: string): Promise<Response> {
  try {
    if (!assessment_id) {
      throw new Error('assessment_id is required');
    }
    
    // Get the analysis data from the database
    const { data: analysis, error: analysisError } = await supabase
      .from('dna_analysis_results')
      .select('*')
      .eq('assessment_id', assessment_id)
      .single();
      
    if (analysisError) {
      throw new Error(`Error fetching analysis: ${analysisError.message}`);
    }
    
    if (!analysis) {
      throw new Error(`No analysis found for assessment_id: ${assessment_id}`);
    }
    
    // Extract thinkers and classics from the analysis
    const thinkers = extractThinkersFromAnalysis(analysis);
    const classics = extractClassicsFromAnalysis(analysis);
    
    console.log(`Extracted ${thinkers.length} thinkers and ${classics.length} classics from analysis`);
    
    // Perform semantic matching for thinkers
    const thinkerResults = await performSemanticMatching(thinkers, 'thinker', assessment_id, analysis.id);
    console.log(`Thinker matching complete: ${thinkerResults.matched.length} matched, ${thinkerResults.unmatched.length} unmatched`);
    
    // Perform semantic matching for classics
    const classicResults = await performSemanticMatching(classics, 'classic', assessment_id, analysis.id);
    console.log(`Classic matching complete: ${classicResults.matched.length} matched, ${classicResults.unmatched.length} unmatched`);
    
    // Calculate match rates for summary
    const totalThinkers = thinkers.length;
    const totalClassics = classics.length;
    const matchedThinkers = thinkerResults.matched.length;
    const matchedClassics = classicResults.matched.length;
    const totalEntities = totalThinkers + totalClassics;
    const totalMatched = matchedThinkers + matchedClassics;
    
    const validationSummary = {
      timestamp: new Date().toISOString(),
      thinkers: {
        total: totalThinkers,
        matched: matchedThinkers,
        unmatched: thinkerResults.unmatched.length,
        match_rate: totalThinkers > 0 ? ((matchedThinkers / totalThinkers) * 100).toFixed(2) + '%' : '0%',
        has_errors: !!thinkerResults.error
      },
      classics: {
        total: totalClassics,
        matched: matchedClassics,
        unmatched: classicResults.unmatched.length,
        match_rate: totalClassics > 0 ? ((matchedClassics / totalClassics) * 100).toFixed(2) + '%' : '0%',
        has_errors: !!classicResults.error
      },
      overall: {
        total: totalEntities,
        matched: totalMatched,
        unmatched: (totalEntities - totalMatched),
        match_rate: totalEntities > 0 ? ((totalMatched / totalEntities) * 100).toFixed(2) + '%' : '0%',
        has_errors: !!(thinkerResults.error || classicResults.error)
      }
    };
    
    // Update the analysis with validation results
    const { error: updateError } = await supabase
      .from('dna_analysis_results')
      .update({
        validation_summary: validationSummary,
        validated_at: new Date().toISOString()
      })
      .eq('assessment_id', assessment_id);
      
    if (updateError) {
      throw new Error(`Error updating analysis: ${updateError.message}`);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      thinkers: {
        total: totalThinkers,
        matched: matchedThinkers,
        unmatched: thinkerResults.unmatched,
        matchDetails: thinkerResults.matched
      },
      classics: {
        total: totalClassics,
        matched: matchedClassics,
        unmatched: classicResults.unmatched,
        matchDetails: classicResults.matched
      },
      summary: validationSummary
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error validating DNA entities:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting validate-dna-entities function');
    const { assessment_id } = await req.json();
    
    if (!assessment_id) {
      throw new Error('assessment_id is required');
    }
    
    // Use the validateDNAEntities function with the parsed assessment_id
    return await validateDNAEntities(assessment_id);
  } catch (error) {
    console.error('Error in validate-dna-entities function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      summary: {
        totalEntities: 0,
        totalMatched: 0,
        totalUnmatched: 0,
        matchRate: '0%',
        hasErrors: true
      } 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
