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
function extractThinkerClassicPairs(analysisData: Record<string, any>): { thinker: string, classic: string, domain: string, type: 'kindred_spirit' | 'challenging_voice', index: number }[] {
  const pairs: { thinker: string, classic: string, domain: string, type: 'kindred_spirit' | 'challenging_voice', index: number }[] = [];
  console.log('Starting thinker-classic pair extraction from analysis data');
  
  // Log the analysis data structure to help debug
  console.log('Analysis data keys:', Object.keys(analysisData));
  
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
    console.log(`Found most kindred spirit pair: ${analysisData.most_kindred_spirit} - ${classic}`);
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
    console.log(`Found most challenging voice pair: ${analysisData.most_challenging_voice} - ${classic}`);
  }
  
  // Check for direct thinker-classic pairs in the analysis data
  // This is a fallback in case the pairs are stored in a different format
  if (analysisData.thinker_classic_pairs && Array.isArray(analysisData.thinker_classic_pairs)) {
    console.log(`Found ${analysisData.thinker_classic_pairs.length} direct thinker-classic pairs`);
    analysisData.thinker_classic_pairs.forEach((pair: any) => {
      if (pair.thinker && pair.classic) {
        pairs.push({
          thinker: pair.thinker,
          classic: pair.classic,
          domain: pair.domain || 'unknown',
          type: pair.type || 'kindred_spirit',
          index: pair.index || 0
        });
        console.log(`Added direct pair: ${pair.thinker} - ${pair.classic}`);
      }
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
  analysis_id: string | null,
  thinkerClassicPairs?: { thinker: string, classic: string, domain: string, type: 'kindred_spirit' | 'challenging_voice', index: number }[]
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
        
        // Create a map of classics to their associated thinkers for context
        const classicToThinkerMap = new Map<string, string>();
        if (type === 'classic' && thinkerClassicPairs && thinkerClassicPairs.length > 0) {
          thinkerClassicPairs.forEach(pair => {
            classicToThinkerMap.set(pair.classic, pair.thinker);
          });
          console.log(`Created map of ${classicToThinkerMap.size} classics to their associated thinkers`);
          
          // Log the map contents for debugging
          classicToThinkerMap.forEach((thinker, classic) => {
            console.log(`Map entry: "${classic}" -> "${thinker}"`);
          });
        }
        
        const prompt = `
I need to match these ${type} names/titles from a philosophical DNA analysis against our database entries.
For each item in List A, find the best semantic match from List B, or indicate if there's no good match.

List A (from analysis):
${itemsBatch.map((item, i) => {
  if (type === 'classic' && classicToThinkerMap.has(item)) {
    return `${i+1}. "${item}" (associated with thinker: ${classicToThinkerMap.get(item)})`;
  } else {
    return `${i+1}. "${item}"`;
  }
}).join('\n')}

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

Please analyze each item carefully, considering:
- Exact matches (including common variations in spelling or formatting)
- Semantic similarity in meaning and context
- Historical and philosophical context
- The relationship between thinkers and their works

IMPORTANT MATCHING GUIDELINES:
${type === 'classic' ? `
For classics, be especially generous with matching:
- Match partial titles (e.g., "Politics" should match "Politics" by Aristotle)
- Match common variations (e.g., "Second Treatise" should match "Second Treatise of Government")
- Match without author names (e.g., "Analects" should match "The Analects" by Confucius)
- Match without articles (e.g., "Symposium" should match "The Symposium" by Plato)
- Match without subtitles (e.g., "Truth" should match "On Truth" or similar titles)
- Match without year/date information (e.g., "The Picture of Dorian Gray" should match even if the database has "The Picture of Dorian Gray (1890)")
- Use the associated thinker information to help with matching (e.g., if a classic is associated with Aristotle, it's more likely to be "Politics" by Aristotle)
- If a classic is associated with a specific thinker, prioritize matching it to a work by that thinker
- For well-known classics like "Politics", "Leviathan", "The Communist Manifesto", etc., be especially generous with matching when the associated thinker matches the author
` : `
For thinkers, be especially careful with matching:
- Match variations of names (e.g., "Nietzsche" should match "Friedrich Nietzsche")
- Match without titles (e.g., "Kant" should match "Immanuel Kant")
- Match without middle names (e.g., "John Locke" should match "John W. Locke")
`}

Format your response as a JSON array of objects with properties: "item", "match_id", "confidence".
Provide the raw JSON array only, with no additional explanation or text.
`;

        console.log(`Sending batch ${i/batchSize + 1} of ${Math.ceil(itemsToLookup.length/batchSize)} to OpenRouter`);
        console.log(`Batch contains ${itemsBatch.length} items`);

        try {
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
            const errorBody = await response.text();
            throw new Error(`OpenRouter API responded with status: ${response.status}, body: ${errorBody}`);
          }

          const responseData = await response.json();
          let batchResults: { item: string, match_id: string, confidence: number }[] = [];

          try {
            const content = responseData.choices[0].message.content;
            console.log(`Raw content from OpenRouter:`, content.substring(0, 100) + '...');

            // Parse the JSON content
            batchResults = JSON.parse(content);
            if (!Array.isArray(batchResults)) {
              // If we got an object with array inside it, try to extract it
              if (batchResults && typeof batchResults === 'object' && batchResults.results && Array.isArray(batchResults.results)) {
                batchResults = batchResults.results;
              } else {
                throw new Error('Response is not an array or does not contain an array');
              }
            }
          } catch (parseError) {
            console.error("Error parsing LLM response:", parseError);
            console.log("Raw response:", responseData.choices[0].message.content);
            // Fallback to empty results
            batchResults = [];
          }

          console.log(`Got ${batchResults.length} match results for batch ${i / batchSize + 1}`);
          if (batchResults.length > 0) {
            console.log('Sample result:', batchResults[0]);
          }

          // Filter batch results into matched and unmatched
          // Lower the confidence threshold for classics to 50% to be more generous with matching
          const confidenceThreshold = type === 'classic' ? 50 : 70;
          console.log(`Using confidence threshold of ${confidenceThreshold} for ${type}s`);
          
          const batchMatched = batchResults
            .filter(result => result.match_id !== "no_match" && result.confidence >= confidenceThreshold)
            .map(result => ({
              item: result.item,
              db_id: result.match_id,
              confidence: result.confidence
            }));

          const batchUnmatched = batchResults
            .filter(result => result.match_id === "no_match" || result.confidence < confidenceThreshold)
            .map(result => result.item);

          // Append batch results to overall results
          matched = [...matched, ...batchMatched];
          unmatched = [...unmatched, ...batchUnmatched];

          // Add any items that were in the batch but not in the result (this can happen if the LLM omits items)
          const processedItems = new Set(batchResults.map(r => r.item));
          const missingItems = itemsBatch.filter(item => !processedItems.has(item));
          if (missingItems.length > 0) {
            console.log(`${missingItems.length} items were not processed by LLM, adding to unmatched`);
            unmatched = [...unmatched, ...missingItems];
          }

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting validate-dna-entities function');
    const { analysisData, analysisId, assessment_id } = await req.json();
    
    // Enhanced validation to allow either analysisId, assessment_id, or direct data
    if (!analysisData && !analysisId && !assessment_id) {
      throw new Error('Either analysisData, analysisId, or assessment_id must be provided');
    }
    
    let dataToValidate: Record<string, any> = {};
    let actualAnalysisId: string | null = analysisId || null;
    let actualassessment_id: string | null = assessment_id || null;
    
    if (analysisId) {
      // Fetch the analysis data from the database using analysis ID
      console.log(`Fetching analysis data for ID: ${analysisId}`);
      const { data, error } = await supabase
        .from('dna_analysis_results')
        .select('*')
        .eq('id', analysisId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching analysis data:', error);
        throw error;
      }
      if (!data) {
        console.error(`No analysis found with id: ${analysisId}`);
        throw new Error(`No analysis found with id: ${analysisId}`);
      }
      
      dataToValidate = data;
      // If we have an analysis record but no assessment ID yet, get it from the record
      if (!actualassessment_id && data.assessment_id) {
        actualassessment_id = data.assessment_id;
      }
      
      console.log('Successfully fetched analysis data from database');
    } else if (assessment_id) {
      // Fetch the analysis data from the database using assessment ID
      console.log(`Fetching analysis data for assessment ID: ${assessment_id}`);
      const { data, error } = await supabase
        .from('dna_analysis_results')
        .select('*')
        .eq('assessment_id', assessment_id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching analysis data by assessment ID:', error);
        throw error;
      }
      
      if (!data) {
        console.log(`No analysis found for assessment id: ${assessment_id}. Creating a temporary record.`);
        
        // Create a temporary analysis record with the assessment_id
        const { data: newData, error: insertError } = await supabase
          .from('dna_analysis_results')
          .insert([
            { 
              assessment_id: assessment_id,
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating temporary analysis record:', insertError);
          throw new Error(`Failed to create temporary analysis record: ${insertError.message}`);
        }
        
        console.log(`Created temporary analysis record with ID: ${newData.id}`);
        dataToValidate = newData;
        actualAnalysisId = newData.id;
      } else {
        dataToValidate = data;
        actualAnalysisId = data.id;
        console.log('Successfully fetched analysis data from database');
      }
    } else if (analysisData) {
      // Use the provided analysis data directly
      console.log('Using provided analysis data');
      dataToValidate = analysisData;
      
      // If analysisData contains assessment_id, use it
      if (dataToValidate.assessment_id) {
        actualassessment_id = dataToValidate.assessment_id;
      }
      
      // If we have analysis data but no analysis ID, create a record
      if (!actualAnalysisId && actualassessment_id) {
        console.log(`Creating analysis record for provided data with assessment ID: ${actualassessment_id}`);
        
        const { data: newData, error: insertError } = await supabase
          .from('dna_analysis_results')
          .insert([
            { 
              assessment_id: actualassessment_id,
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating analysis record for provided data:', insertError);
          // Continue without creating a record - we'll still process the data
        } else {
          actualAnalysisId = newData.id;
          console.log(`Created analysis record with ID: ${actualAnalysisId}`);
        }
      }
    }
    
    console.log(`Validating entities with analysis ID: ${actualAnalysisId || 'none'}, assessment ID: ${actualassessment_id || 'none'}`);
    
    // Extract thinkers and classics from the analysis
    const thinkers = extractThinkersFromAnalysis(dataToValidate);
    const classics = extractClassicsFromAnalysis(dataToValidate);
    
    // Extract thinker-classic pairs for context
    const thinkerClassicPairs = extractThinkerClassicPairs(dataToValidate);
    console.log(`Extracted ${thinkerClassicPairs.length} thinker-classic pairs for context`);
    
    console.log(`Extracted ${thinkers.length} thinkers and ${classics.length} classics from analysis`);
    
    // Partial results holder to ensure we don't lose data on errors
    let thinkerResults = { matched: [], unmatched: thinkers, error: null };
    let classicResults = { matched: [], unmatched: classics, error: null };
    
    try {
      // Perform semantic matching for thinkers
      thinkerResults = await performSemanticMatching(thinkers, 'thinker', actualassessment_id, actualAnalysisId);
      console.log(`Thinker matching complete: ${thinkerResults.matched.length} matched, ${thinkerResults.unmatched.length} unmatched`);
    } catch (thinkerError) {
      console.error('Error in thinker matching:', thinkerError);
      thinkerResults.error = `Error: ${thinkerError.message}`;
    }
    
    try {
      // Perform semantic matching for classics with thinker context
      classicResults = await performSemanticMatching(classics, 'classic', actualassessment_id, actualAnalysisId, thinkerClassicPairs);
      console.log(`Classic matching complete: ${classicResults.matched.length} matched, ${classicResults.unmatched.length} unmatched`);
    } catch (classicError) {
      console.error('Error in classic matching:', classicError);
      classicResults.error = `Error: ${classicError.message}`;
    }
    
    // Always ensure we record matching results in the database, even if only partial results
    if (actualAnalysisId) {
      console.log(`Updating dna_analysis_results with validation summary for ID: ${actualAnalysisId}`);
      
      // Calculate match rates for summary
      const totalThinkers = thinkers.length;
      const totalClassics = classics.length;
      const matchedThinkers = thinkerResults.matched ? thinkerResults.matched.length : 0;
      const matchedClassics = classicResults.matched ? classicResults.matched.length : 0;
      const totalEntities = totalThinkers + totalClassics;
      const totalMatched = matchedThinkers + matchedClassics;
      
      const validationSummary = {
        timestamp: new Date().toISOString(),
        thinkers: {
          total: totalThinkers,
          matched: matchedThinkers,
          unmatched: thinkerResults.unmatched ? thinkerResults.unmatched.length : totalThinkers - matchedThinkers,
          match_rate: totalThinkers > 0 ? ((matchedThinkers / totalThinkers) * 100).toFixed(2) + '%' : '0%',
          has_errors: !!thinkerResults.error
        },
        classics: {
          total: totalClassics,
          matched: matchedClassics,
          unmatched: classicResults.unmatched ? classicResults.unmatched.length : totalClassics - matchedClassics,
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
      
      const { error: updateError } = await supabase
        .from('dna_analysis_results')
        .update({ validation_summary: validationSummary })
        .eq('id', actualAnalysisId);
        
      if (updateError) {
        console.error('Error updating validation summary:', updateError);
      } else {
        console.log('Successfully updated validation summary');
      }
      
      // Final storage attempt for unmatched entities with cleaner approach
      try {
        console.log("Final storage attempt for unmatched entities");
        const thinkerUnmatched = thinkerResults.unmatched || [];
        const classicUnmatched = classicResults.unmatched || [];
        
        // Only attempt storage if we have unmatched entities
        if (thinkerUnmatched.length > 0 || classicUnmatched.length > 0) {
          const storeResult = await storeUnmatchedEntities(
            actualassessment_id, 
            actualAnalysisId, 
            thinkerUnmatched, 
            classicUnmatched
          );
          
          console.log(`Final unmatched entity storage result: ${storeResult}`);
        }
      } catch (storageError) {
        console.error("Final storage attempt failed:", storageError);
      }
    } else if (actualassessment_id) {
      // If we only have assessment ID but no analysis ID yet, still store unmatched entities
      try {
        console.log(`Storing unmatched entities using only assessment ID: ${actualassessment_id}`);
        const thinkerUnmatched = thinkerResults.unmatched || [];
        const classicUnmatched = classicResults.unmatched || [];
        
        if (thinkerUnmatched.length > 0 || classicUnmatched.length > 0) {
          const storeResult = await storeUnmatchedEntities(
            actualassessment_id,
            null,
            thinkerUnmatched,
            classicUnmatched
          );
          
          console.log(`Assessment-only unmatched entity storage result: ${storeResult}`);
        }
      } catch (storageError) {
        console.error("Assessment-only storage attempt failed:", storageError);
      }
    }
    
    // Ensure we calculate match rates properly even if some parts failed
    const totalThinkers = thinkers.length;
    const totalClassics = classics.length;
    const matchedThinkers = thinkerResults.matched ? thinkerResults.matched.length : 0;
    const matchedClassics = classicResults.matched ? classicResults.matched.length : 0;
    const totalEntities = totalThinkers + totalClassics;
    const totalMatched = matchedThinkers + matchedClassics;
    
    // Generate validation report, preserving as much data as possible even if errors occurred
    const validationReport = {
      analysisId: actualAnalysisId,
      assessment_id: actualassessment_id,
      thinkers: {
        total: totalThinkers,
        matched: matchedThinkers,
        unmatched: thinkerResults.unmatched ? thinkerResults.unmatched.length : totalThinkers - matchedThinkers,
        matchDetails: thinkerResults.matched || [],
        unmatchedItems: thinkerResults.unmatched || [],
        error: thinkerResults.error
      },
      classics: {
        total: totalClassics,
        matched: matchedClassics,
        unmatched: classicResults.unmatched ? classicResults.unmatched.length : totalClassics - matchedClassics,
        matchDetails: classicResults.matched || [],
        unmatchedItems: classicResults.unmatched || [],
        error: classicResults.error
      },
      summary: {
        totalEntities: totalEntities,
        totalMatched: totalMatched,
        totalUnmatched: (totalEntities - totalMatched),
        matchRate: totalEntities > 0 ? 
          ((totalMatched / totalEntities) * 100).toFixed(2) + '%' : 
          '0%',
        hasErrors: !!(thinkerResults.error || classicResults.error)
      }
    };
    
    console.log('Validation complete:', JSON.stringify({
      totalEntities: totalEntities,
      totalMatched: totalMatched,
      matchRate: validationReport.summary.matchRate,
      hasErrors: validationReport.summary.hasErrors
    }));
    
    return new Response(JSON.stringify(validationReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
