// supabase/functions/dna-validator/index.ts

// --- Imports ---
// Using slightly newer std version, adjust if needed
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'; // Updated std version
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'; // Match example version or use latest
import { corsHeaders } from '../_shared/cors.ts'; // Assuming this file exists as in example

// --- Secrets / Environment Variables (Loaded at module level) ---
const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
// IMPORTANT: Use the Service Role Key for functions that need to bypass RLS or have broad write access
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// --- Initialize Supabase Client (using Service Role Key) ---
// Use non-null assertion (!) assuming secrets are set in the environment
// RLS is bypassed when using the service_role key.
const supabaseAdmin: SupabaseClient = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
        // Required settings for backend/server-side usage
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

console.log("Supabase admin client initialized at module level.");
// Basic check if keys were loaded - helps debugging deployment issues
if (!openrouterApiKey) console.warn("OPENROUTER_API_KEY secret not found!");
if (!supabaseUrl) console.warn("SUPABASE_URL secret not found!");
if (!supabaseServiceRoleKey) console.warn("SUPABASE_SERVICE_ROLE_KEY secret not found!");


// --- Interfaces (Keep these as they are good practice) ---
interface Icon {
  id: string // UUID as string
  name: string
}

interface Book {
  id: string // UUID as string
  name: string // Using 'name' consistently, mapped from 'title'
}

interface DnaAnalysisResult {
  id: string // UUID as string
  created_at: string
  user_id?: string
  archetype?: string
  most_kindred_spirit?: string
  most_challenging_voice?: string
  most_kindred_spirit_classic?: string
  most_challenging_voice_classic?: string
  // Add ALL other potential thinker/classic fields here...
  // Example:
  politics_kindred_spirit_1?: string
  politics_challenging_voice_1?: string
  politics_kindred_spirit_1_classic?: string
  politics_challenging_voice_1_classic?: string
  // ... (ensure all fields match your schema)
  [key: string]: any // Allow arbitrary properties
}

interface MatchResult {
  assessment_id: string
  type: 'icons' | 'books'
  dna_analysis_column: string
  dna_analysis_name: string
  matched_name: string
  matched_id: string
}

interface UnmatchResult {
  assessment_id: string
  type: 'icons' | 'books'
  dna_analysis_column: string
  dna_analysis_name: string
}

// --- Constants ---
const LLM_MATCH_BATCH_SIZE = 500
const SUPABASE_WRITE_BATCH_SIZE = 20

// --- Helper Functions (Keep these as they are the core logic) ---

// async function fetchAllSupabaseData<T>(supabaseClient: SupabaseClient, tableName: string, selectQuery = '*'): Promise<T[]> {
// Modified slightly to accept the already initialized client
async function fetchAllSupabaseData<T>(client: SupabaseClient, tableName: string, selectQuery = '*'): Promise<T[]> {
    const allData: T[] = []
    const pageSize = 1000
    let offset = 0
    let hasMoreData = true
    console.log(`Fetching all data from ${tableName}...`)

    while (hasMoreData) {
        try {
            // Use the passed client instance
            const { data, error, count } = await client
                .from(tableName)
                .select(selectQuery, { count: 'exact' })
                .range(offset, offset + pageSize - 1)

            if (error) {
                console.error(`Supabase error fetching ${tableName}:`, error)
                throw new Error(`Supabase error fetching ${tableName}: ${error.message}`)
            }

            if (data && data.length > 0) {
                allData.push(...data as T[])
                console.log(`Fetched ${data.length} rows from ${tableName}. Total: ${allData.length}`)
                if (data.length < pageSize) {
                    hasMoreData = false
                } else {
                    offset += pageSize
                }
            } else {
                hasMoreData = false
            }
        } catch (e) {
            console.error(`Exception during fetch from ${tableName}:`, e)
            throw e
        }
    }
    console.log(`Finished fetching from ${tableName}. Total rows: ${allData.length}`)
    return allData
}

// Modified to use the global supabaseAdmin client
async function fetchIcons(): Promise<Icon[]> {
    console.log("Fetching icons from Supabase...")
    try {
        const icons = await fetchAllSupabaseData<Icon>(supabaseAdmin, 'icons', 'id::text, name')
        console.log(`Successfully fetched ${icons.length} icons.`)
        return icons
    } catch (error) {
        console.error("Error fetching icons:", error)
        return []
    }
}

// Modified to use the global supabaseAdmin client
async function fetchBooks(): Promise<Book[]> {
    console.log("Fetching books from Supabase...")
    try {
        const rawBooks = await fetchAllSupabaseData<{ id: string; title: string }>(supabaseAdmin, 'books', 'id::text, title')
        const books: Book[] = rawBooks.map(b => ({ id: b.id, name: b.title }))
        console.log(`Successfully fetched ${books.length} books.`)
        return books
    } catch (error) {
        console.error("Error fetching books:", error)
        return []
    }
}


function cleanBookTitle(title: string): string {
    if (!title) return title
    const pattern = /\s+\(\d{3,4}(?:[\s\w.-]+)?\)$/
    return title.replace(pattern, '').trim()
}

function findExactMatch(name: string, itemList: (Icon | Book)[], entityType: 'icons' | 'books'): Icon | Book | null {
    if (!name) return null
    const searchNameCleaned = entityType === 'books' ? cleanBookTitle(name) : name
    const searchNameLower = searchNameCleaned.toLowerCase()

    for (const item of itemList) {
        const itemNameOriginal = item.name || ''
        const itemNameForCompare = entityType === 'books' ? cleanBookTitle(itemNameOriginal) : itemNameOriginal
        if (itemNameForCompare && itemNameForCompare.toLowerCase() === searchNameLower) {
            return item
        }
    }
    return null
}

// Uses the global openrouterApiKey
async function findBestMatchLLM(name: string, itemBatch: (Icon | Book)[], entityType: 'icons' | 'books'): Promise<string> {
    // Check if the key was loaded at module level
    if (!openrouterApiKey) {
        console.error("OpenRouter API Key was not loaded. Cannot make API call.")
        return "ERROR" // Or throw, depending on desired behavior
    }

    let potentialMatches: string[]
    let cleanedNameForPrompt: string
    let entityDescription: string

    if (entityType === "books") {
        potentialMatches = itemBatch.map(item => cleanBookTitle(item.name)).filter(Boolean)
        cleanedNameForPrompt = cleanBookTitle(name)
        entityDescription = "classic texts"
    } else { // icons
        potentialMatches = itemBatch.map(item => item.name).filter(Boolean)
        cleanedNameForPrompt = name
        entityDescription = "thinkers"
    }

    if (potentialMatches.length === 0) {
        console.warn(`No valid potential matches in batch for '${name}'.`)
        return "NO MATCH"
    }

    const promptText = `
Given the input name "${cleanedNameForPrompt}", find the best exact or very close semantic match from the following list of known ${entityDescription}.
Respond ONLY with the name from the list that is the best match.
If no name in the list is a confident match for the input name, respond ONLY with the exact text "NO MATCH".

List of known ${entityDescription}:
${potentialMatches.join(', ')}
`

    const headers = {
        // Use the top-level variable
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        // Match headers from your example if needed
        "HTTP-Referer": "https://alexandria.org", // Or your specific referer
        "X-Title": "Alexandria DNA Validator Edge" // Or your specific title
    }

    const payload = {
        // "model": "google/gemini-flash-1.5",
        "model": "mistralai/mistral-7b-instruct", // Or match your example's model if preferred
        "messages": [
            { "role": "user", "content": promptText }
        ],
        // Add other parameters like temperature or max_tokens if needed
        // "temperature": 0.5,
        // "max_tokens": 150,
    }

    try {
        console.log(`Calling OpenRouter for '${cleanedNameForPrompt}' (type: ${entityType})...`)
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        })

        if (response.ok) {
            const result = await response.json()
            // Use optional chaining for safer access
            const match = result?.choices?.[0]?.message?.content?.trim()

            if (!match) {
                console.warn(`Empty response content from OpenRouter for '${cleanedNameForPrompt}'. Response:`, result)
                return "NO MATCH"
            }

            console.log(`OpenRouter potential match for '${cleanedNameForPrompt}': '${match}'`)

            if (match === "NO MATCH") {
                return "NO MATCH"
            } else if (potentialMatches.some(p => p.toLowerCase() === match.toLowerCase())) {
                 const matchedPotential = potentialMatches.find(p => p.toLowerCase() === match.toLowerCase()) || match;
                 return matchedPotential
            } else {
                console.warn(`OpenRouter returned '${match}' which is not in the provided list (${potentialMatches.length} items) or 'NO MATCH'. Treating as no match.`)
                return "NO MATCH"
            }
        } else {
            const errorBody = await response.text()
            console.error(`OpenRouter API error: ${response.status} - ${errorBody}`)
            // Log specific errors like in your example
            if (response.status === 401) {
                 console.error("***** OpenRouter Authentication Error (401): Check your OPENROUTER_API_KEY secret. *****")
            } else if (response.status === 429) {
                 console.error("***** OpenRouter Rate Limit Error (429): Too many requests. *****")
            }
             else if (response.status === 502 || response.status === 503) {
                 console.error(`***** OpenRouter Provider Error (${response.status}): Issue with the underlying model provider. Might be temporary. *****`)
             }
            return "ERROR"
        }
    } catch (error) {
        console.error(`Error calling OpenRouter API for '${cleanedNameForPrompt}':`, error)
        return "ERROR"
    }
}

// --- processNameWithBatchedItems, findItemMatch remain the same logic ---
// ... (they internally call findBestMatchLLM which now uses the global key)
async function processNameWithBatchedItems(
    name: string,
    itemList: (Icon | Book)[],
    batchSize: number,
    entityType: 'icons' | 'books'
): Promise<Icon | Book | null> {
    console.log(`LLM Matching '${name}' (${entityType}) against ${itemList.length} items...`)
    for (let i = 0; i < itemList.length; i += batchSize) {
        const itemBatch = itemList.slice(i, i + batchSize)
        // console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(itemList.length / batchSize)} (size: ${itemBatch.length})`) // Verbose logging

        const bestMatchNameFromLLM = await findBestMatchLLM(name, itemBatch, entityType) // Uses global key indirectly

        if (bestMatchNameFromLLM === "ERROR") {
            console.error(`LLM API error occurred while processing '${name}'. Stopping LLM search for this item.`)
            return null
        }

        if (bestMatchNameFromLLM !== "NO MATCH") {
            const matchedItem = itemBatch.find(item => {
                const itemNameOriginal = item.name || '';
                const itemNameForCompare = entityType === "books" ? cleanBookTitle(itemNameOriginal) : itemNameOriginal;
                return itemNameForCompare.toLowerCase() === bestMatchNameFromLLM.toLowerCase();
            });

            if (matchedItem) {
                console.log(`LLM Match found for '${name}': '${matchedItem.name}' (ID: ${matchedItem.id}).`)
                return matchedItem
            } else {
                 console.warn(`LLM returned '${bestMatchNameFromLLM}', but couldn't find corresponding item in batch. Continuing search.`);
            }
        }
    }
    console.log(`No LLM match found for '${name}' after checking all batches.`)
    return null
}

async function findItemMatch(
    itemName: string,
    itemList: (Icon | Book)[],
    batchSize: number,
    entityType: 'icons' | 'books'
): Promise<Icon | Book | null> {
    if (!itemName || !itemName.trim()) {
        console.log("Skipping empty item name.")
        return null
    }
    const nameToSearch = itemName.trim()

    const exactMatch = findExactMatch(nameToSearch, itemList, entityType)
    if (exactMatch) {
        console.log(`Found exact match for '${nameToSearch}' (${entityType}): '${exactMatch.name}' (ID: ${exactMatch.id})`)
        return exactMatch
    }

    console.log(`No exact match for '${nameToSearch}' (${entityType}). Trying LLM...`)
    const llmMatch = await processNameWithBatchedItems(nameToSearch, itemList, batchSize, entityType) // Uses global key indirectly
    if (llmMatch) {
         console.log(`Found LLM match for '${nameToSearch}' (${entityType}): '${llmMatch.name}' (ID: ${llmMatch.id})`)
        return llmMatch
    }

    console.log(`No exact or LLM match found for '${nameToSearch}' (${entityType}).`)
    return null
}


// --- extractNamesFromDnaResult remains the same logic ---
function extractNamesFromDnaResult(dnaResult: DnaAnalysisResult): {
    icons: { names: string[], columns: string[] },
    books: { names: string[], columns: string[] }
} {
    const extracted = {
        icons: { names: [] as string[], columns: [] as string[] },
        books: { names: [] as string[], columns: [] as string[] }
    }
    const processedNames = { icons: new Set<string>(), books: new Set<string>() }

    // TESTING ONLY: For testing, only check a small subset of fields instead of all 120+ fields
    const testingOnly = true; // Set to false to check all fields in production

    // IMPORTANT: Ensure these field names exactly match your table schema
    let iconFields = [
        'most_kindred_spirit', 'most_challenging_voice',
        // Dynamically generate field names for all domains/levels
        ...['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'].flatMap(dom =>
            Array.from({ length: 5 }, (_, i) => `${dom}_kindred_spirit_${i + 1}`)
        ),
        ...['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'].flatMap(dom =>
            Array.from({ length: 5 }, (_, i) => `${dom}_challenging_voice_${i + 1}`)
        ),
    ]
    
    // For testing, only check a few key fields
    if (testingOnly) {
        iconFields = ['most_kindred_spirit', 'most_challenging_voice', 'politics_kindred_spirit_1', 'ethics_challenging_voice_1'];
        console.log("TESTING MODE: Only checking a limited set of fields for validation");
    }
    
    // Generate book field names by adding '_classic' suffix to icon fields
    let bookFields: string[] = [];
    
    // In testing mode, explicitly check for the same limited set of book fields
    if (testingOnly) {
        const testBookFields = iconFields.map(f => f + '_classic');
        bookFields = testBookFields.filter(field => dnaResult.hasOwnProperty(field));
    } else {
        // Normal operation: assumes book fields consistently end with '_classic' based on icon fields
        bookFields = iconFields.map(f => dnaResult.hasOwnProperty(f + '_classic') ? f + '_classic' : null).filter(Boolean) as string[];
    }

    // Process icon fields
    for (const fieldName of iconFields) {
        const value = dnaResult[fieldName]
        if (value && typeof value === 'string') {
            const name = value.trim()
            if (name && !processedNames.icons.has(name.toLowerCase())) {
                extracted.icons.names.push(name)
                extracted.icons.columns.push(fieldName)
                processedNames.icons.add(name.toLowerCase())
            }
        }
    }

    // Process book fields
    for (const fieldName of bookFields) {
         const value = dnaResult[fieldName]; // Already checked for existence when creating bookFields list
         if (value && typeof value === 'string') {
             const name = value.trim();
             if (name && !processedNames.books.has(name.toLowerCase())) {
                 extracted.books.names.push(name);
                 extracted.books.columns.push(fieldName);
                 processedNames.books.add(name.toLowerCase());
             }
         }
    }

    console.log(`Extracted ${extracted.icons.names.length} unique icon names and ${extracted.books.names.length} unique book titles.`)
    return extracted
}

// Modified to use the global supabaseAdmin client
async function writeResultsToSupabase<T>(tableName: string, results: T[], batchSize: number): Promise<void> {
     if (!results || results.length === 0) {
        return;
    }
    console.log(`Writing ${results.length} results to Supabase table '${tableName}'...`);

    for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        console.log(`Writing batch ${Math.floor(i / batchSize) + 1} (${batch.length} rows) to ${tableName}...`);

        try {
            // Use the global client
            const { error } = await supabaseAdmin.from(tableName).insert(batch);

            if (error) {
                console.error(`Error inserting batch into ${tableName}:`, error);
                 if (error.message.includes("permission denied") || error.code === '42501') {
                     console.error(`***** Supabase Write Permission Error on ${tableName}: Check SERVICE_ROLE_KEY and RLS policies. *****`);
                 }
                 // Consider if you should throw here or just log
            } else {
                console.log(`Successfully inserted batch of ${batch.length} rows into ${tableName}.`);
            }
        } catch (e) {
            console.error(`Exception during Supabase insert to ${tableName}:`, e);
        }
    }
}


// --- Main Server Logic ---

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        // Use corsHeaders from top level
        return new Response('ok', { headers: corsHeaders })
    }

    console.log("--- DNA Validator Edge Function Invoked ---")

    // 1. Get the new row data from the request body
    let dnaResult: DnaAnalysisResult | null = null
    try {
        const payload = await req.json()
        // Check structure for Database Webhook payload
        if (payload.type === 'INSERT' && payload.table === 'dna_analysis_results' && payload.record) {
             dnaResult = payload.record as DnaAnalysisResult
             console.log(`Processing new DNA result ID: ${dnaResult?.id}`)
        } else {
            console.warn("Received payload doesn't match expected INSERT event for dna_analysis_results:", payload)
            return new Response(JSON.stringify({ error: "Invalid payload structure or event type." }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
    } catch (error) {
        console.error("Error parsing request body:", error)
        return new Response(JSON.stringify({ error: "Failed to parse request body." }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    if (!dnaResult || !dnaResult.id) {
         console.error("No valid DNA result data found in payload.")
         return new Response(JSON.stringify({ error: "Missing DNA result data in payload." }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const assessmentId = dnaResult.id
    
    // Return 200 immediately to acknowledge receipt
    const response = new Response(JSON.stringify({
        message: "DNA validation request received. Processing in background.",
        assessmentId: assessmentId
    }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
    // Process asynchronously
    processValidationInBackground(dnaResult, assessmentId);
    
    return response;
})

// New function to process validation in background
async function processValidationInBackground(dnaResult: DnaAnalysisResult, assessmentId: string): Promise<void> {
    try {
        // 2. Fetch Reference Data (Uses global client)
        console.time("fetchReferenceData"); // Start timer
        const [icons, books] = await Promise.all([
            fetchIcons(),
            fetchBooks()
        ])
        console.timeEnd("fetchReferenceData"); // End timer

        if (icons.length === 0 && books.length === 0) {
             console.warn("No icon or book data available. Cannot perform matching.")
             return;
        }

        // 3. Extract Names
        const { icons: extractedIcons, books: extractedBooks } = extractNamesFromDnaResult(dnaResult)

        const matchedResults: MatchResult[] = []
        const unmatchedResults: UnmatchResult[] = []

        // 4. Process Icons (Uses global client indirectly via findItemMatch)
        console.time("processIcons");
        if (icons.length > 0 && extractedIcons.names.length > 0) {
            console.log(`\n-- Validating ${extractedIcons.names.length} Icons --`)
            for (let i = 0; i < extractedIcons.names.length; i++) {
                const name = extractedIcons.names[i]
                const column = extractedIcons.columns[i]
                console.log(` -> Validating Icon: '${name}' (from column: ${column})`)
                // Uses findItemMatch -> processNameWithBatchedItems -> findBestMatchLLM -> global openrouterApiKey
                const match = await findItemMatch(name, icons, LLM_MATCH_BATCH_SIZE, 'icons')
                if (match) {
                    matchedResults.push({
                        assessment_id: assessmentId, type: 'icons', dna_analysis_column: column,
                        dna_analysis_name: name, matched_name: match.name, matched_id: match.id,
                    })
                } else {
                    unmatchedResults.push({
                        assessment_id: assessmentId, type: 'icons', dna_analysis_column: column,
                        dna_analysis_name: name,
                    })
                }
            }
        } else {
             console.log("Skipping icon validation (no icons loaded or none extracted).")
        }
         console.timeEnd("processIcons");

        // 5. Process Books (Uses global client indirectly via findItemMatch)
        console.time("processBooks");
        if (books.length > 0 && extractedBooks.names.length > 0) {
             console.log(`\n-- Validating ${extractedBooks.names.length} Books --`)
            for (let i = 0; i < extractedBooks.names.length; i++) {
                const name = extractedBooks.names[i]
                const column = extractedBooks.columns[i]
                console.log(` -> Validating Book: '${name}' (from column: ${column})`)
                 // Uses findItemMatch -> processNameWithBatchedItems -> findBestMatchLLM -> global openrouterApiKey
                const match = await findItemMatch(name, books, LLM_MATCH_BATCH_SIZE, 'books')
                if (match) {
                    matchedResults.push({
                        assessment_id: assessmentId, type: 'books', dna_analysis_column: column,
                        dna_analysis_name: name, matched_name: match.name, matched_id: match.id,
                    })
                } else {
                    unmatchedResults.push({
                        assessment_id: assessmentId, type: 'books', dna_analysis_column: column,
                        dna_analysis_name: name,
                    })
                }
            }
        } else {
            console.log("Skipping book validation (no books loaded or none extracted).")
        }
        console.timeEnd("processBooks");

        // 6. Write Results (Uses global client)
        console.time("writeResults");
        console.log("\n--- Writing Results ---")
        await Promise.all([
             writeResultsToSupabase('dna_analysis_results_matched', matchedResults, SUPABASE_WRITE_BATCH_SIZE),
             writeResultsToSupabase('dna_analysis_results_unmatched', unmatchedResults, SUPABASE_WRITE_BATCH_SIZE)
        ])
        console.timeEnd("writeResults");

        console.log(`--- Processing Complete for Assessment ID: ${assessmentId} ---`)
        console.log(`Matches Found: ${matchedResults.length}`)
        console.log(`Unmatched Items: ${unmatchedResults.length}`)

    } catch (error) {
        console.error(`Unhandled error during DNA validation for assessment ${assessmentId}:`, error)
    }
}

/*a
Reminder: Ensure you have a _shared/cors.ts file like this in the parent directory:
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or restrict to your frontend domain
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
*/
