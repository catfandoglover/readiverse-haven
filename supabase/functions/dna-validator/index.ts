// supabase/functions/dna-validator/index.ts
// NOTE: This function has JWT verification disabled via the supabase.json config file

// --- Imports ---
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

// --- Secrets / Environment Variables (Loaded at module level) ---
const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// --- Initialize Supabase Client (using Service Role Key) ---
let supabaseAdmin: SupabaseClient;
try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("Supabase URL or Service Role Key environment variables are not set.");
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
    console.log("Supabase admin client initialized at module level.");
} catch (error) {
    console.error("Failed to initialize Supabase admin client:", error);
    // If Supabase fails to initialize, we might not be able to log errors there later
    // Consider how to handle this critical failure - perhaps the function should not serve requests.
}

// Basic check if keys were loaded - helps debugging deployment issues
if (!openrouterApiKey) console.warn("OPENROUTER_API_KEY secret not found!");


// --- Interfaces ---
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
    // ... Add ALL other potential thinker/classic fields from your schema ...
    // Ensure these match your actual dna_analysis_results table columns
    most_kindred_spirit?: string
    most_challenging_voice?: string
    most_kindred_spirit_classic?: string
    most_challenging_voice_classic?: string
    politics_kindred_spirit_1?: string
    politics_challenging_voice_1?: string
    politics_kindred_spirit_1_classic?: string
    politics_challenging_voice_1_classic?: string
     // Add all 6 domains, 5 levels each for kindred/challenging + classics
    ethics_kindred_spirit_1?: string; ethics_kindred_spirit_2?: string; ethics_kindred_spirit_3?: string; ethics_kindred_spirit_4?: string; ethics_kindred_spirit_5?: string;
    ethics_challenging_voice_1?: string; ethics_challenging_voice_2?: string; ethics_challenging_voice_3?: string; ethics_challenging_voice_4?: string; ethics_challenging_voice_5?: string;
    epistemology_kindred_spirit_1?: string; epistemology_kindred_spirit_2?: string; epistemology_kindred_spirit_3?: string; epistemology_kindred_spirit_4?: string; epistemology_kindred_spirit_5?: string;
    epistemology_challenging_voice_1?: string; epistemology_challenging_voice_2?: string; epistemology_challenging_voice_3?: string; epistemology_challenging_voice_4?: string; epistemology_challenging_voice_5?: string;
    ontology_kindred_spirit_1?: string; ontology_kindred_spirit_2?: string; ontology_kindred_spirit_3?: string; ontology_kindred_spirit_4?: string; ontology_kindred_spirit_5?: string;
    ontology_challenging_voice_1?: string; ontology_challenging_voice_2?: string; ontology_challenging_voice_3?: string; ontology_challenging_voice_4?: string; ontology_challenging_voice_5?: string;
    theology_kindred_spirit_1?: string; theology_kindred_spirit_2?: string; theology_kindred_spirit_3?: string; theology_kindred_spirit_4?: string; theology_kindred_spirit_5?: string;
    theology_challenging_voice_1?: string; theology_challenging_voice_2?: string; theology_challenging_voice_3?: string; theology_challenging_voice_4?: string; theology_challenging_voice_5?: string;
    aesthetics_kindred_spirit_1?: string; aesthetics_kindred_spirit_2?: string; aesthetics_kindred_spirit_3?: string; aesthetics_kindred_spirit_4?: string; aesthetics_kindred_spirit_5?: string;
    aesthetics_challenging_voice_1?: string; aesthetics_challenging_voice_2?: string; aesthetics_challenging_voice_3?: string; aesthetics_challenging_voice_4?: string; aesthetics_challenging_voice_5?: string;
    // Classic versions
    politics_kindred_spirit_2_classic?: string; politics_challenging_voice_2_classic?: string;
    ethics_kindred_spirit_1_classic?: string; ethics_kindred_spirit_2_classic?: string; ethics_kindred_spirit_3_classic?: string; ethics_kindred_spirit_4_classic?: string; ethics_kindred_spirit_5_classic?: string;
    ethics_challenging_voice_1_classic?: string; ethics_challenging_voice_2_classic?: string; ethics_challenging_voice_3_classic?: string; ethics_challenging_voice_4_classic?: string; ethics_challenging_voice_5_classic?: string;
    epistemology_kindred_spirit_1_classic?: string; epistemology_kindred_spirit_2_classic?: string; epistemology_kindred_spirit_3_classic?: string; epistemology_kindred_spirit_4_classic?: string; epistemology_kindred_spirit_5_classic?: string;
    epistemology_challenging_voice_1_classic?: string; epistemology_challenging_voice_2_classic?: string; epistemology_challenging_voice_3_classic?: string; epistemology_challenging_voice_4_classic?: string; epistemology_challenging_voice_5_classic?: string;
    ontology_kindred_spirit_1_classic?: string; ontology_kindred_spirit_2_classic?: string; ontology_kindred_spirit_3_classic?: string; ontology_kindred_spirit_4_classic?: string; ontology_kindred_spirit_5_classic?: string;
    ontology_challenging_voice_1_classic?: string; ontology_challenging_voice_2_classic?: string; ontology_challenging_voice_3_classic?: string; ontology_challenging_voice_4_classic?: string; ontology_challenging_voice_5_classic?: string;
    theology_kindred_spirit_1_classic?: string; theology_kindred_spirit_2_classic?: string; theology_kindred_spirit_3_classic?: string; theology_kindred_spirit_4_classic?: string; theology_kindred_spirit_5_classic?: string;
    theology_challenging_voice_1_classic?: string; theology_challenging_voice_2_classic?: string; theology_challenging_voice_3_classic?: string; theology_challenging_voice_4_classic?: string; theology_challenging_voice_5_classic?: string;
    aesthetics_kindred_spirit_1_classic?: string; aesthetics_kindred_spirit_2_classic?: string; aesthetics_kindred_spirit_3_classic?: string; aesthetics_kindred_spirit_4_classic?: string; aesthetics_kindred_spirit_5_classic?: string;
    aesthetics_challenging_voice_1_classic?: string; aesthetics_challenging_voice_2_classic?: string; aesthetics_challenging_voice_3_classic?: string; aesthetics_challenging_voice_4_classic?: string; aesthetics_challenging_voice_5_classic?: string;
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

interface MatchAttemptResult {
    match: Icon | Book | null;
    originalName: string;
    originalColumn: string;
}


// --- Constants ---
const LLM_MATCH_BATCH_SIZE = 500
const SUPABASE_WRITE_BATCH_SIZE = 50 // Increased batch size for potential performance improvement

// --- Module-Level Reference Data Cache (Idea 4) ---
let iconsList: Icon[] = [];
let booksList: Book[] = [];
// Maps for fast exact lookups (Idea 1)
let iconsMap = new Map<string, Icon>(); // Key: lowercase name
let booksMap = new Map<string, Book>(); // Key: cleaned lowercase name
let referenceDataLoaded = false;
let referenceDataLoadingPromise: Promise<void> | null = null;


// --- Helper Functions ---

function cleanBookTitle(title: string): string {
    if (!title) return title
    // Removes year in parentheses like (1984) or (430 BC) or (Penguin Classics, 2003)
    const pattern = /\s+\([\d\s\wBCE.-]+(?:\s*ed\.?)?(?:,\s*\d{4})?\)$/i;
    return title.replace(pattern, '').trim()
}

// Fetches all data with pagination (internal use)
async function fetchAllSupabaseDataInternal<T>(client: SupabaseClient, tableName: string, selectQuery = '*'): Promise<T[]> {
    const allData: T[] = []
    const pageSize = 1000
    let offset = 0
    let hasMoreData = true
    // console.log(`Fetching all data from ${tableName}...`) // Keep logging minimal unless debugging

    while (hasMoreData) {
        try {
            const { data, error } = await client
                .from(tableName)
                .select(selectQuery) // Count not strictly needed here
                .range(offset, offset + pageSize - 1)

            if (error) {
                console.error(`Supabase error fetching ${tableName}:`, error)
                throw new Error(`Supabase error fetching ${tableName}: ${error.message}`)
            }

            if (data && data.length > 0) {
                allData.push(...data as T[])
                // console.log(`Fetched ${data.length} rows from ${tableName}. Total: ${allData.length}`)
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
            throw e // Rethrow to be caught by loader
        }
    }
    // console.log(`Finished fetching from ${tableName}. Total rows: ${allData.length}`)
    return allData
}

// Internal fetchers for loading data into module cache
async function fetchIconsInternal(): Promise<Icon[]> {
    if (!supabaseAdmin) throw new Error("Supabase client not initialized");
    console.log("Fetching icons from Supabase for cache...");
    try {
        const icons = await fetchAllSupabaseDataInternal<Icon>(supabaseAdmin, 'icons', 'id::text, name')
        console.log(`Fetched ${icons.length} icons into cache.`);
        return icons
    } catch (error) {
        console.error("Error fetching icons for cache:", error)
        return [] // Return empty on error
    }
}

async function fetchBooksInternal(): Promise<Book[]> {
    if (!supabaseAdmin) throw new Error("Supabase client not initialized");
    console.log("Fetching books from Supabase for cache...");
    try {
        // Fetch raw books with 'title' column
        const rawBooks = await fetchAllSupabaseDataInternal<{ id: string; title: string }>(supabaseAdmin, 'books', 'id::text, title')
        // Map 'title' to 'name' for consistency
        const books: Book[] = rawBooks.map(b => ({ id: b.id, name: b.title }))
        console.log(`Fetched ${books.length} books into cache.`);
        return books
    } catch (error) {
        console.error("Error fetching books for cache:", error)
        return [] // Return empty on error
    }
}

// Function to load reference data if not already loaded (Idea 4)
async function loadReferenceDataIfNeeded(): Promise<void> {
    if (referenceDataLoaded) {
        // console.log("Reference data already loaded in this instance.");
        return;
    }

    // Prevent concurrent loading attempts within the same instance
    if (referenceDataLoadingPromise) {
        console.log("Reference data loading already in progress, awaiting completion...");
        return referenceDataLoadingPromise;
    }

    console.log("Reference data not loaded, initiating fetch...");
    const loadingPromise = (async () => {
        try {
            console.time("loadReferenceData");
            const [fetchedIcons, fetchedBooks] = await Promise.all([
                fetchIconsInternal(),
                fetchBooksInternal()
            ]);

            iconsList = fetchedIcons;
            booksList = fetchedBooks;

            // Populate maps for fast exact matching (Idea 1)
            iconsMap.clear();
            iconsList.forEach(icon => {
                if (icon.name) {
                    iconsMap.set(icon.name.toLowerCase(), icon);
                }
            });

            booksMap.clear();
            booksList.forEach(book => {
                if (book.name) {
                    // Use cleaned title for map key
                    const cleanedName = cleanBookTitle(book.name);
                    if (cleanedName) {
                         booksMap.set(cleanedName.toLowerCase(), book);
                    } else {
                        // Handle cases where cleaning might result in empty string?
                         console.warn(`Book with ID ${book.id} resulted in empty name after cleaning: '${book.name}'`);
                    }
                }
            });

            referenceDataLoaded = true;
            console.log(`Reference data loaded successfully: ${iconsList.length} icons (map: ${iconsMap.size}), ${booksList.length} books (map: ${booksMap.size})`);
            console.timeEnd("loadReferenceData");
        } catch (error) {
            console.error("Failed to load reference data:", error);
            // Reset state so next invocation might try again
            referenceDataLoaded = false;
            iconsList = [];
            booksList = [];
            iconsMap.clear();
            booksMap.clear();
            throw error; // Re-throw to indicate failure
        } finally {
            referenceDataLoadingPromise = null; // Clear the promise regardless of outcome
        }
    })();

    referenceDataLoadingPromise = loadingPromise;
    return loadingPromise;
}


// --- Matching Logic Functions ---

// Optimized exact match using Map (Idea 1)
function findExactMatch(name: string, itemMap: Map<string, Icon | Book>, entityType: 'icons' | 'books'): Icon | Book | null {
    if (!name) return null;

    let searchNameCleanedLower: string;
    if (entityType === 'books') {
        searchNameCleanedLower = cleanBookTitle(name).toLowerCase();
    } else {
        searchNameCleanedLower = name.toLowerCase();
    }

    if (!searchNameCleanedLower) return null; // Handle empty names after cleaning

    const match = itemMap.get(searchNameCleanedLower);
    return match || null; // Return the found item or null
}

// LLM matching function (remains largely the same, uses module-level key)
async function findBestMatchLLM(name: string, itemBatch: (Icon | Book)[], entityType: 'icons' | 'books'): Promise<string> {
    if (!openrouterApiKey) {
        console.error("OpenRouter API Key was not loaded. Cannot make API call.");
        return "ERROR";
    }

    let potentialMatches: string[];
    let cleanedNameForPrompt: string;
    let entityDescription: string;

    // Prepare names for the prompt (clean books)
    if (entityType === "books") {
        potentialMatches = itemBatch.map(item => cleanBookTitle(item.name)).filter(Boolean);
        cleanedNameForPrompt = cleanBookTitle(name);
        entityDescription = "classic texts";
    } else { // icons
        potentialMatches = itemBatch.map(item => item.name).filter(Boolean);
        cleanedNameForPrompt = name;
        entityDescription = "thinkers";
    }

    if (potentialMatches.length === 0) {
        // console.warn(`No valid potential matches in batch for '${name}'.`); // Reduce noise
        return "NO MATCH";
    }

    // Filter out potentially empty strings after cleaning
    potentialMatches = potentialMatches.filter(p => p.trim().length > 0);
    if (potentialMatches.length === 0) {
        return "NO MATCH";
    }

    const promptText = `
Given the input name "${cleanedNameForPrompt}", find the best exact or very close semantic match from the following list of known ${entityDescription}.
Respond ONLY with the name from the list that is the best match.
If no name in the list is a confident match for the input name, respond ONLY with the exact text "NO MATCH".

List of known ${entityDescription}:
${potentialMatches.join(', ')}
`;

    const headers = {
        "Authorization": `Bearer ${openrouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://alexandria.org", // Optional: Adjust if needed
        "X-Title": "Alexandria DNA Validator Edge" // Optional: Adjust if needed
    };

    const payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [{ "role": "user", "content": promptText }],
        // "temperature": 0.3, // Lower temperature for more deterministic matching
        // "max_tokens": 100, // Limit response length
    };

    try {
        // console.log(`Calling OpenRouter for '${cleanedNameForPrompt}' (type: ${entityType})...`); // Reduce noise
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const result = await response.json();
            const match = result?.choices?.[0]?.message?.content?.trim();

            if (!match) {
                // console.warn(`Empty response content from OpenRouter for '${cleanedNameForPrompt}'. Response:`, result); // Reduce noise
                return "NO MATCH";
            }

            // console.log(`OpenRouter potential match for '${cleanedNameForPrompt}': '${match}'`) // Reduce noise

            if (match === "NO MATCH") {
                return "NO MATCH";
            // Check if the LLM response exactly matches one of the *cleaned* potential names (case-insensitive)
            } else if (potentialMatches.some(p => p.toLowerCase() === match.toLowerCase())) {
                 // Return the matched name exactly as it was in the potentialMatches list
                 const matchedPotential = potentialMatches.find(p => p.toLowerCase() === match.toLowerCase()) || match;
                 return matchedPotential;
            } else {
                // console.warn(`OpenRouter returned '${match}' which is not in the provided list or 'NO MATCH'. Treating as no match.`); // Reduce noise
                return "NO MATCH";
            }
        } else {
            const errorBody = await response.text();
            console.error(`OpenRouter API error: ${response.status} - ${errorBody.substring(0, 500)}...`); // Log truncated error body
             if (response.status === 401) console.error("***** OpenRouter Authentication Error (401) *****");
             else if (response.status === 429) console.error("***** OpenRouter Rate Limit Error (429) *****");
             else if (response.status >= 500) console.error(`***** OpenRouter Server Error (${response.status}) *****`);
            return "ERROR";
        }
    } catch (error) {
        console.error(`Network/fetch error calling OpenRouter for '${cleanedNameForPrompt}':`, error);
        return "ERROR";
    }
}

async function processNameWithBatchedItemsLLM(
    name: string,
    itemList: (Icon | Book)[], // Full list passed here
    batchSize: number,
    entityType: 'icons' | 'books'
): Promise<Icon | Book | null> {
    // console.log(`LLM Matching '${name}' (${entityType}) against ${itemList.length} items...`); // Reduce noise
    for (let i = 0; i < itemList.length; i += batchSize) {
        const itemBatch = itemList.slice(i, i + batchSize);
        // console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(itemList.length / batchSize)} (size: ${itemBatch.length})`) // Verbose logging

        const bestMatchNameFromLLM = await findBestMatchLLM(name, itemBatch, entityType);

        if (bestMatchNameFromLLM === "ERROR") {
            console.error(`LLM API error occurred while processing '${name}'. Stopping LLM search for this item.`);
            return null; // Don't continue searching if LLM errored
        }

        if (bestMatchNameFromLLM !== "NO MATCH") {
            // Find the original item in the batch whose *cleaned* name matches the LLM response
             const matchedItem = itemBatch.find(item => {
                const itemNameOriginal = item.name || '';
                const itemNameForCompare = entityType === "books" ? cleanBookTitle(itemNameOriginal) : itemNameOriginal;
                // Case-insensitive comparison with the cleaned name from the batch
                return itemNameForCompare.toLowerCase() === bestMatchNameFromLLM.toLowerCase();
            });


            if (matchedItem) {
                console.log(`LLM Match found for '${name}': '${matchedItem.name}' (ID: ${matchedItem.id}).`);
                return matchedItem;
            } else {
                 // This *shouldn't* happen if findBestMatchLLM logic is correct, but log if it does
                 console.warn(`LLM returned '${bestMatchNameFromLLM}', but couldn't find corresponding item in batch whose cleaned name matched. Input: '${name}'.`);
            }
        }
        // If "NO MATCH", continue to the next batch
    }
    // console.log(`No LLM match found for '${name}' after checking all batches.`); // Reduce noise
    return null;
}

// Function to check previous matches (remains the same logic, uses module client)
async function findPreviousMatch(name: string, entityType: 'icons' | 'books'): Promise<{ matched_id: string, matched_name: string } | null> {
    if (!name || !supabaseAdmin) return null;
    const searchName = name.trim().toLowerCase();
    if (!searchName) return null;

    // console.log(`Checking for previous matches for '${searchName}' (${entityType})...`); // Reduce noise

    try {
        const { data, error } = await supabaseAdmin
            .from('dna_analysis_results_matched') // Ensure this table name is correct
            .select('matched_id, matched_name')
            .eq('type', entityType)
            .ilike('dna_analysis_name', searchName) // Match against the original name stored
            .limit(1);

        if (error) {
            console.error(`Error checking previous matches for '${searchName}':`, error);
            return null;
        }

        if (data && data.length > 0) {
            // console.log(`Found previous match for '${searchName}': '${data[0].matched_name}' (ID: ${data[0].matched_id})`); // Reduce noise
            return data[0];
        }

        return null;
    } catch (error) {
        console.error(`Exception checking previous matches for '${searchName}':`, error);
        return null;
    }
}

// Main matching function for a single item
async function findItemMatch(
    itemName: string,
    itemList: (Icon | Book)[], // Full list for LLM/previous ID lookup
    itemMap: Map<string, Icon | Book>, // Map for exact match
    batchSize: number,
    entityType: 'icons' | 'books'
): Promise<Icon | Book | null> {
    if (!itemName || !itemName.trim()) {
        // console.log("Skipping empty item name.") // Reduce noise
        return null;
    }
    const nameToSearch = itemName.trim();

    // 1. Try exact matching using the Map (Idea 1)
    const exactMatch = findExactMatch(nameToSearch, itemMap, entityType);
    if (exactMatch) {
        // console.log(`Found exact match for '${nameToSearch}' (${entityType}): '${exactMatch.name}'`); // Reduce noise
        return exactMatch;
    }

    // 2. Check previous matches in the database
    const previousMatch = await findPreviousMatch(nameToSearch, entityType);
    if (previousMatch) {
        // Find the corresponding item in our *current full itemList* using the matched_id
        // This ensures we return the item object from the current cache
        const itemFromPreviousMatch = itemList.find(item => item.id === previousMatch.matched_id);
        if (itemFromPreviousMatch) {
            // console.log(`Using previous match for '${nameToSearch}' (${entityType}): '${itemFromPreviousMatch.name}'`); // Reduce noise
            return itemFromPreviousMatch;
        } else {
            // This could happen if the previously matched item was deleted from the icons/books table
            console.warn(`Found previous match ID ${previousMatch.matched_id} for '${nameToSearch}', but item not in current reference list. Continuing to LLM...`);
        }
    }

    // 3. Use LLM for matching if other methods failed
    // console.log(`No exact or previous match for '${nameToSearch}' (${entityType}). Trying LLM...`); // Reduce noise
    const llmMatch = await processNameWithBatchedItemsLLM(nameToSearch, itemList, batchSize, entityType);
    // LLM function already logs success/failure
    return llmMatch; // Return the LLM match result (which could be null)
}


// Extracts names, remains the same logic
function extractNamesFromDnaResult(dnaResult: DnaAnalysisResult): {
    icons: { names: string[], columns: string[] },
    books: { names: string[], columns: string[] }
} {
     const extracted = {
        icons: { names: [] as string[], columns: [] as string[] },
        books: { names: [] as string[], columns: [] as string[] }
    };
    const processedNames = { icons: new Set<string>(), books: new Set<string>() };

    // Define all potential fields (ensure these match your DnaAnalysisResult interface/schema)
    const domains = ['politics', 'ethics', 'epistemology', 'ontology', 'theology', 'aesthetics'];
    const levels = [1, 2, 3, 4, 5];
    const voiceTypes = ['kindred_spirit', 'challenging_voice'];

    const baseIconFields = ['most_kindred_spirit', 'most_challenging_voice'];
    domains.forEach(dom => {
        voiceTypes.forEach(vt => {
            levels.forEach(lvl => {
                baseIconFields.push(`${dom}_${vt}_${lvl}`);
            });
        });
    });

    const allPotentialIconFields = baseIconFields;
    const allPotentialBookFields = baseIconFields.map(f => `${f}_classic`);

    // Process icon fields
    for (const fieldName of allPotentialIconFields) {
        const value = dnaResult[fieldName];
        if (value && typeof value === 'string') {
            const name = value.trim();
            if (name && !processedNames.icons.has(name.toLowerCase())) {
                extracted.icons.names.push(name);
                extracted.icons.columns.push(fieldName);
                processedNames.icons.add(name.toLowerCase());
            }
        }
    }

    // Process book fields
    for (const fieldName of allPotentialBookFields) {
         const value = dnaResult[fieldName];
         if (value && typeof value === 'string') {
             const name = value.trim();
             // Use cleaned book title for uniqueness check
             const cleanedNameLower = cleanBookTitle(name).toLowerCase();
             if (name && cleanedNameLower && !processedNames.books.has(cleanedNameLower)) {
                 extracted.books.names.push(name); // Store original name
                 extracted.books.columns.push(fieldName);
                 processedNames.books.add(cleanedNameLower); // Track uniqueness by cleaned name
             }
         }
    }

    console.log(`Extracted ${extracted.icons.names.length} unique icon names and ${extracted.books.names.length} unique book titles.`);
    return extracted;
}

// Writes results, remains the same logic, uses module client
async function writeResultsToSupabase<T>(tableName: string, results: T[], batchSize: number): Promise<void> {
     if (!results || results.length === 0) {
        return;
    }
    if (!supabaseAdmin) {
        console.error(`Cannot write to ${tableName}, Supabase client not initialized.`);
        return;
    }
    console.log(`Writing ${results.length} results to Supabase table '${tableName}'...`);

    for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        // console.log(`Writing batch ${Math.floor(i / batchSize) + 1} (${batch.length} rows) to ${tableName}...`); // Reduce noise

        try {
            const { error } = await supabaseAdmin.from(tableName).insert(batch);

            if (error) {
                console.error(`Error inserting batch into ${tableName}:`, error);
                 if (error.message.includes("permission denied") || error.code === '42501') {
                     console.error(`***** Supabase Write Permission Error on ${tableName} *****`);
                 }
                 // Optional: Implement retry logic for transient errors?
            } else {
                // console.log(`Successfully inserted batch of ${batch.length} rows into ${tableName}.`); // Reduce noise
            }
        } catch (e) {
            console.error(`Exception during Supabase insert to ${tableName}:`, e);
        }
    }
     console.log(`Finished writing ${results.length} results to ${tableName}.`);
}


// --- Main Server Logic ---

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

     if (!supabaseAdmin) {
        console.error("FATAL: Supabase client failed to initialize. Cannot process request.");
        return new Response(JSON.stringify({ error: "Server configuration error." }), {
            status: 500, // Internal Server Error
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log("--- DNA Validator Edge Function Invoked ---");

    let dnaResult: DnaAnalysisResult | null = null;
    let assessmentId: string | null = null;

    try {
        const payload = await req.json();
        if (payload.type === 'INSERT' && payload.table === 'dna_analysis_results' && payload.record && payload.record.id) {
            dnaResult = payload.record as DnaAnalysisResult;
            assessmentId = dnaResult.assessment_id; // Extract ID here
            console.log(`Processing new DNA result ID: ${assessmentId}`);
        } else {
            console.warn("Received payload doesn't match expected INSERT event:", payload);
            return new Response(JSON.stringify({ error: "Invalid payload structure or event type." }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error("Error parsing request body:", error);
        return new Response(JSON.stringify({ error: "Failed to parse request body." }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // We absolutely need dnaResult and assessmentId to proceed
    if (!dnaResult || !assessmentId) {
         console.error("No valid DNA result data or ID found in payload.");
         return new Response(JSON.stringify({ error: "Missing DNA result data or ID in payload." }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Acknowledge receipt immediately
    const response = new Response(JSON.stringify({
        message: "DNA validation request received. Processing in background.",
        assessmentId: assessmentId
    }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    // Don't await this - let it run in the background
    processValidationInBackground(dnaResult, assessmentId);

    return response;
});

// Background processing wrapper
async function processValidationInBackground(dnaResult: DnaAnalysisResult, assessmentId: string): Promise<void> {
    // Note: Edge function execution time limits still apply (default ~15-60s depending on plan/region)
    const timeoutMs = 55000; // Set slightly below typical 60s limit
    let timeoutId: number | undefined;

    const timeoutPromise = new Promise<void>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`Processing timeout exceeded (${timeoutMs}ms) for assessment ${assessmentId}`));
        }, timeoutMs);
    });

    try {
        console.log(`Starting background processing for assessmentId: ${assessmentId}`);
        await Promise.race([
            processValidationCore(dnaResult, assessmentId),
            timeoutPromise
        ]);
        console.log(`Background processing completed successfully for assessmentId: ${assessmentId}`);
    } catch (error) {
        console.error(`Critical error or timeout in background processing for assessment ${assessmentId}:`, error);
        // Attempt to log the error to a dedicated table
        if (supabaseAdmin) {
             try {
                await supabaseAdmin.from('dna_validation_errors').insert({ // Ensure this table exists
                    assessment_id: assessmentId,
                    error_message: error instanceof Error ? error.message : String(error),
                    error_stack: error instanceof Error ? error.stack : undefined,
                    created_at: new Date().toISOString()
                });
            } catch (logError) {
                console.error(`Failed to log error to database for assessment ${assessmentId}:`, logError);
            }
        }
    } finally {
       clearTimeout(timeoutId); // Clean up the timer
    }
}

// Core validation logic
async function processValidationCore(dnaResult: DnaAnalysisResult, assessmentId: string): Promise<void> {
    // 1. Ensure Reference Data is Loaded (Uses module cache - Idea 4)
    try {
        await loadReferenceDataIfNeeded();
    } catch (loadError) {
        console.error(`Failed to load reference data for assessment ${assessmentId}, cannot proceed.`);
        // Error is logged within loadReferenceDataIfNeeded, re-throw to report critical failure
        throw new Error(`Reference data loading failed: ${loadError.message}`);
    }

    if (iconsList.length === 0 && booksList.length === 0) {
         console.warn(`No icon or book reference data available for assessment ${assessmentId}. Cannot perform matching.`);
         // Don't throw, just exit gracefully as there's nothing to match against.
         return;
    }

    // 2. Extract Names from the input DNA result
    const { icons: extractedIcons, books: extractedBooks } = extractNamesFromDnaResult(dnaResult);

    const matchedResults: MatchResult[] = [];
    const unmatchedResults: UnmatchResult[] = [];

    // 3. Process Icons in Parallel (Idea 2)
    console.time(`processIconsParallel_${assessmentId}`);
    if (iconsList.length > 0 && extractedIcons.names.length > 0) {
        console.log(`\n-- Validating ${extractedIcons.names.length} Icons in Parallel --`);
        const iconMatchPromises = extractedIcons.names.map((name, index) =>
            findItemMatch(
                name,
                iconsList, // Pass full list for LLM/previous check
                iconsMap,  // Pass map for exact check
                LLM_MATCH_BATCH_SIZE,
                'icons'
            ).then(match => ({ // Wrap result to keep track of original name/column
                 match: match,
                 originalName: name,
                 originalColumn: extractedIcons.columns[index]
            }))
            // Add basic catch block per promise to prevent Promise.all from rejecting early
            .catch(error => {
                 console.error(`Error processing icon '${name}':`, error);
                 return { match: null, originalName: name, originalColumn: extractedIcons.columns[index] };
            })
        );

        // Wait for all icon matching attempts to settle
        const iconProcessingResults = await Promise.all(iconMatchPromises);

        // Process results after all promises complete
        iconProcessingResults.forEach(result => {
            if (result.match) {
                matchedResults.push({
                    assessment_id: assessmentId, type: 'icons', dna_analysis_column: result.originalColumn,
                    dna_analysis_name: result.originalName, matched_name: result.match.name, matched_id: result.match.id,
                });
            } else {
                 if (result.originalName.trim()) { // Only add non-empty names to unmatched
                    unmatchedResults.push({
                        assessment_id: assessmentId, type: 'icons', dna_analysis_column: result.originalColumn,
                        dna_analysis_name: result.originalName,
                    });
                 }
            }
        });
    } else {
         console.log("Skipping icon validation (no icons loaded or none extracted).");
    }
     console.timeEnd(`processIconsParallel_${assessmentId}`);

    // 4. Process Books in Parallel (Idea 2)
    console.time(`processBooksParallel_${assessmentId}`);
    if (booksList.length > 0 && extractedBooks.names.length > 0) {
        console.log(`\n-- Validating ${extractedBooks.names.length} Books in Parallel --`);
        const bookMatchPromises = extractedBooks.names.map((name, index) =>
             findItemMatch(
                name,
                booksList, // Pass full list
                booksMap,  // Pass map
                LLM_MATCH_BATCH_SIZE,
                'books'
             ).then(match => ({
                 match: match,
                 originalName: name,
                 originalColumn: extractedBooks.columns[index]
            }))
            .catch(error => {
                 console.error(`Error processing book '${name}':`, error);
                 return { match: null, originalName: name, originalColumn: extractedBooks.columns[index] };
            })
        );

        const bookProcessingResults = await Promise.all(bookMatchPromises);

        bookProcessingResults.forEach(result => {
             if (result.match) {
                 matchedResults.push({
                     assessment_id: assessmentId, type: 'books', dna_analysis_column: result.originalColumn,
                     dna_analysis_name: result.originalName, matched_name: result.match.name, matched_id: result.match.id,
                 });
             } else {
                 if (result.originalName.trim()) { // Only add non-empty names to unmatched
                    unmatchedResults.push({
                        assessment_id: assessmentId, type: 'books', dna_analysis_column: result.originalColumn,
                        dna_analysis_name: result.originalName,
                    });
                 }
             }
         });
    } else {
         console.log("Skipping book validation (no books loaded or none extracted).");
    }
    console.timeEnd(`processBooksParallel_${assessmentId}`);

    // 5. Write Results
    console.time(`writeResults_${assessmentId}`);
    console.log("\n--- Writing Results ---");
    // Run writes sequentially to potentially avoid overwhelming DB connection pool, though parallel could be slightly faster
    await writeResultsToSupabase('dna_analysis_results_matched', matchedResults, SUPABASE_WRITE_BATCH_SIZE);
    await writeResultsToSupabase('dna_analysis_results_unmatched', unmatchedResults, SUPABASE_WRITE_BATCH_SIZE);
    // Alternatively, use Promise.all for parallel writes if DB handles it well:
    // await Promise.all([
    //      writeResultsToSupabase('dna_analysis_results_matched', matchedResults, SUPABASE_WRITE_BATCH_SIZE),
    //      writeResultsToSupabase('dna_analysis_results_unmatched', unmatchedResults, SUPABASE_WRITE_BATCH_SIZE)
    // ]);
    console.timeEnd(`writeResults_${assessmentId}`);

    console.log(`--- Processing Complete for Assessment ID: ${assessmentId} ---`);
    console.log(`Matches Found: ${matchedResults.length}`);
    console.log(`Unmatched Items: ${unmatchedResults.length}`);
}

/*
Reminder:
1. Ensure you have a _shared/cors.ts file.
2. Ensure the table `dna_validation_errors` exists in Supabase if you want error logging:
   CREATE TABLE public.dna_validation_errors (
       id bigint generated by default as identity primary key,
       assessment_id uuid references public.dna_analysis_results(id) on delete cascade,
       error_message text,
       error_stack text,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ALTER TABLE public.dna_validation_errors ENABLE ROW LEVEL SECURITY;
   -- Add appropriate RLS policies or ensure service role key bypasses RLS.
3. Ensure your `dna_analysis_results` table schema matches the fields used in `extractNamesFromDnaResult`.
4. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY.
5. Configure the Database Webhook on the `dna_analysis_results` table for INSERT events, pointing to this function.
*/
