
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

// Fields that need validation (hardcoded for now)
const KINDRED_SPIRIT_FIELDS = [
  'ethics', 'epistemology', 'politics', 'theology', 'ontology', 'aesthetics'
].flatMap(category => 
  Array.from({ length: 5 }, (_, i) => `${category}_kindred_spirit_${i + 1}`)
);

const CHALLENGING_VOICE_FIELDS = [
  'ethics', 'epistemology', 'politics', 'theology', 'ontology', 'aesthetics'
].flatMap(category => 
  Array.from({ length: 5 }, (_, i) => `${category}_challenging_voice_${i + 1}`)
);

const CLASSIC_TEXT_FIELDS = [
  'ethics', 'epistemology', 'politics', 'theology', 'ontology', 'aesthetics'
].flatMap(category => [
  ...Array.from({ length: 5 }, (_, i) => `${category}_kindred_spirit_${i + 1}_classic`),
  ...Array.from({ length: 5 }, (_, i) => `${category}_challenging_voice_${i + 1}_classic`)
]);

// Function to fetch all icons from the database
async function fetchAllIcons() {
  const { data, error } = await supabase
    .from('icons')
    .select('id, name');

  if (error) {
    console.error('Error fetching icons:', error);
    return [];
  }

  return data || [];
}

// Function to fetch all books from the database
async function fetchAllBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('id, title');

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return data || [];
}

// Function to create a validation prompt for the LLM
function createValidationPrompt(entity, type, possibleMatches) {
  const matchesText = possibleMatches
    .map(match => type === 'thinker' ? match.name : match.title)
    .join(', ');
  
  return `I need you to match a ${type} name against a list of known ${type}s. 
  
Input: "${entity}"
  
Potential matches: ${matchesText}
  
Find the BEST MATCH from the list. Only return ONE match exactly as it appears in the list. If there's no good match, return "NO_MATCH". 

Output should be just the name/title exactly as it appears in the list or "NO_MATCH". No explanation, just the name.`;
}

// Function to validate an entity using Gemini 2.0 Flash
async function validateEntity(entity, type, possibleMatches) {
  if (!entity || typeof entity !== 'string' || entity.trim() === '') {
    console.log(`Empty or invalid ${type} name, skipping validation`);
    return { originalValue: entity, matchedValue: entity, confidence: 0, matched: false };
  }

  try {
    const prompt = createValidationPrompt(entity, type, possibleMatches);
    
    console.log(`Validating ${type}: "${entity}" against ${possibleMatches.length} possible matches`);
    
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
        temperature: 0.1 // Lower temperature for more consistent results
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data);
      return { originalValue: entity, matchedValue: entity, confidence: 0, matched: false };
    }

    const matchedEntity = data.choices[0].message.content.trim();
    
    if (matchedEntity === "NO_MATCH") {
      console.log(`No match found for ${type}: "${entity}"`);
      return { originalValue: entity, matchedValue: entity, confidence: 0, matched: false };
    }

    // Find the match with the exact name
    const match = possibleMatches.find(m => 
      (type === 'thinker' ? m.name === matchedEntity : m.title === matchedEntity)
    );

    if (match) {
      console.log(`Matched ${type} "${entity}" to "${matchedEntity}" with high confidence`);
      return {
        originalValue: entity,
        matchedValue: type === 'thinker' ? match.name : match.title,
        matchedId: match.id,
        confidence: 1, // High confidence since the LLM made a definitive match
        matched: true
      };
    } else {
      console.log(`LLM returned "${matchedEntity}" but no exact match found in database`);
      return { originalValue: entity, matchedValue: entity, confidence: 0, matched: false };
    }
  } catch (error) {
    console.error(`Error validating ${type}:`, error);
    return { originalValue: entity, matchedValue: entity, confidence: 0, matched: false };
  }
}

// Main function to validate all entities in analysis results
async function validateAnalysisEntities(analysisResults) {
  console.log('Starting validation of analysis entities...');
  
  // Fetch all icons and books for validation
  const [icons, books] = await Promise.all([
    fetchAllIcons(),
    fetchAllBooks()
  ]);
  
  console.log(`Loaded ${icons.length} icons and ${books.length} books for validation`);

  // To track unmatched entities that need attention
  const unmatchedEntities = {
    thinkers: [],
    classics: []
  };

  // Helper function to validate and update a specific field
  const validateField = async (field, value, type, possibleMatches) => {
    if (!value) return value;
    
    const result = await validateEntity(value, type, possibleMatches);
    
    if (!result.matched) {
      unmatchedEntities[type === 'thinker' ? 'thinkers' : 'classics'].push({
        field,
        value,
        suggestedMatches: possibleMatches
          .slice(0, 3)
          .map(m => type === 'thinker' ? m.name : m.title)
      });
      return value; // Keep original if no match
    }
    
    return result.matchedValue;
  };

  // Process kindred spirit and challenging voice fields (thinkers)
  for (const field of [...KINDRED_SPIRIT_FIELDS, ...CHALLENGING_VOICE_FIELDS]) {
    if (analysisResults[field]) {
      analysisResults[field] = await validateField(field, analysisResults[field], 'thinker', icons);
    }
  }

  // Process classic text fields
  for (const field of CLASSIC_TEXT_FIELDS) {
    if (analysisResults[field]) {
      analysisResults[field] = await validateField(field, analysisResults[field], 'book', books);
    }
  }

  return {
    validatedResults: analysisResults,
    unmatchedEntities,
    stats: {
      totalFieldsProcessed: [...KINDRED_SPIRIT_FIELDS, ...CHALLENGING_VOICE_FIELDS, ...CLASSIC_TEXT_FIELDS].length,
      unmatchedThinkers: unmatchedEntities.thinkers.length,
      unmatchedClassics: unmatchedEntities.classics.length
    }
  };
}

// Function to notify about unmatched entities
async function notifyUnmatchedEntities(unmatchedEntities, analysisId) {
  if (unmatchedEntities.thinkers.length === 0 && unmatchedEntities.classics.length === 0) {
    return;
  }

  try {
    // Store the unmatched entities in a new table for review
    const { data, error } = await supabase
      .from('dna_unmatched_entities')
      .insert({
        analysis_id: analysisId,
        unmatched_thinkers: unmatchedEntities.thinkers,
        unmatched_classics: unmatchedEntities.classics,
        status: 'pending'
      });

    if (error) {
      console.error('Error storing unmatched entities:', error);
      return;
    }

    console.log(`Stored ${unmatchedEntities.thinkers.length} unmatched thinkers and ${unmatchedEntities.classics.length} unmatched classics for review`);
    
    // Here you would add code to send notifications (email, webhook, etc.)
    // For now, we'll just log it
    console.log('Notification would be sent for unmatched entities');
    
  } catch (error) {
    console.error('Error in notifyUnmatchedEntities:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { analysisResults, analysisId } = await req.json();
      
      if (!analysisResults) {
        throw new Error('Missing required field: analysisResults');
      }

      console.log(`Processing validation for analysis ${analysisId || 'unknown'}...`);
      
      const { validatedResults, unmatchedEntities, stats } = await validateAnalysisEntities(analysisResults);
      
      if (analysisId) {
        await notifyUnmatchedEntities(unmatchedEntities, analysisId);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          validatedResults,
          stats,
          unmatchedEntitiesCount: unmatchedEntities.thinkers.length + unmatchedEntities.classics.length
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
