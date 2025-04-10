import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.37.0';
import { Turbopuffer } from 'npm:@turbopuffer/turbopuffer';

// Define types for request body
interface RequestBody {
  operation?: string;
  namespace?: string;
  vectors?: any[];
  distance_metric?: string;
  schema?: any;
  vector?: number[];
  top_k?: number;
  filters?: any;
  include_attributes?: string[];
  include_vectors?: boolean;
  rank_by?: any;
  ids?: (string | number)[];
  vector_query_mode?: string;
  k?: number;
  filter?: any;
  include_embeddings?: boolean;
  include_metadata?: boolean;
}

// Helper function to ensure data is Uint8Array and not ArrayBuffer
function ensureUint8Array(data: any): any {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  return data;
}

// Helper function to process vector data and handle potential serialization issues
function processVectorData(vectorData: any): number[] {
  try {
    // If it's already an array of numbers, return it
    if (Array.isArray(vectorData) && vectorData.every(item => typeof item === 'number')) {
      return vectorData;
    }
    
    // If it's a string (potentially stringified JSON), parse it
    if (typeof vectorData === 'string') {
      try {
        console.log('Processing string vector data');
        // Handle escaped JSON strings (double-stringified)
        if (vectorData.startsWith('"[') && vectorData.endsWith(']"')) {
          vectorData = JSON.parse(vectorData);
        }
          
        // Detect if this string is already formatted as a JSON array
        if (vectorData.trim().startsWith('[') && vectorData.trim().endsWith(']')) {
          console.log('Parsing JSON array string');
          const parsed = JSON.parse(vectorData);
          if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
            console.log('Successfully parsed JSON array string');
            return parsed;
          }
        } else {
          // Try parsing as a regular string that might contain JSON
          const parsed = JSON.parse(vectorData);
          if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
            return parsed;
          }
        }
        throw new Error('Parsed vector is not a valid number array');
      } catch (parseError) {
        console.error('Error parsing vector string:', parseError);
        throw new Error('Invalid vector format: could not parse string data');
      }
    }
    
    // Handle simple object-like arrays
    if (vectorData && typeof vectorData === 'object') {
      // If it has numeric properties 0, 1, 2, etc., try to convert it to an array
      const keys = Object.keys(vectorData);
      if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
        const maxIndex = Math.max(...keys.map(Number));
        const result: number[] = [];
        for (let i = 0; i <= maxIndex; i++) {
          if (i in vectorData) {
            result.push(Number(vectorData[i]));
          } else {
            result.push(0); // Fill missing indices with 0
          }
        }
        if (result.every(item => !isNaN(item))) {
          return result;
        }
      }
    }
    
    // If we reach here, the format is unsupported
    console.error('Unsupported vector format:', typeof vectorData);
    throw new Error(`Invalid vector format: ${typeof vectorData}. Use the test_query operation for testing without vectors.`);
  } catch (error) {
    console.error('Error processing vector data:', error);
    throw new Error('Failed to process vector data. For testing, use the test_query operation.');
  }
}

// Define routes and operations handled by this API
const OPERATIONS = {
  UPSERT: 'upsert',
  QUERY: 'query',
  TEST_QUERY: 'test_query', // Simple test operation that doesn't process vectors
  DELETE: 'delete',
  NAMESPACE: 'namespace', // To get or create a namespace
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    let body: RequestBody = {};
    if (req.method !== 'GET') {
      try {
        body = await req.json() as RequestBody;
        console.log('Received request body:', JSON.stringify(body));
      } catch (parseErr) {
        console.error('Error parsing request body:', parseErr);
        throw new Error(`Invalid request body: ${parseErr.message}`);
      }
    }

    // Initialize Turbopuffer client
    const apiKey = Deno.env.get('TURBOPUFFER_API_KEY');
    if (!apiKey) {
      throw new Error('TURBOPUFFER_API_KEY not found in environment variables');
    }

    console.log('Initializing Turbopuffer client...');
    const tpuf = new Turbopuffer({
      apiKey,
      // Using the US Central region as default, can be made configurable
      baseUrl: "https://gcp-us-central1.turbopuffer.com",
    });

    let response;
    
    // Get the namespace name from the body
    const namespaceName = body.namespace;
    const operation = body.operation || '';
    
    console.log(`Processing operation: ${operation}, namespace: ${namespaceName}`);
    
    if (!namespaceName && operation !== OPERATIONS.NAMESPACE) {
      throw new Error('Namespace name is required');
    }

    // Handle different operations
    switch (operation) {
      case OPERATIONS.NAMESPACE: {
        console.log('Creating/retrieving namespace');
        // Create a new namespace or get existing one
        const nsName = namespaceName || `namespace-${Date.now()}`;
        const ns = tpuf.namespace(nsName);
        response = { namespace: nsName, created: true };
        break;
      }

      case OPERATIONS.UPSERT: {
        console.log('Processing upsert operation');
        // Upsert vectors to the namespace
        if (!body.vectors) {
          throw new Error('Vectors data is required for upsert operation');
        }
        
        console.log(`Upserting ${body.vectors.length} vectors to namespace: ${namespaceName}`);
        try {
          const ns = tpuf.namespace(namespaceName as string);
          
          // Process vectors to ensure ArrayBuffers are converted to Uint8Array
          const processedVectors = body.vectors.map(vector => processVectorData(vector));
          
          const upsertResult = await ns.upsert({
            vectors: processedVectors,
            distance_metric: body.distance_metric || 'cosine_distance',
            schema: body.schema
          });
          
          console.log('Upsert successful');
          response = { success: true, result: upsertResult };
        } catch (upsertError) {
          console.error('Error during upsert:', upsertError);
          throw new Error(`Error upserting vectors: ${upsertError.message}`);
        }
        break;
      }

      case OPERATIONS.TEST_QUERY: {
        // A simple test operation that returns mock results without vector processing
        console.log('Executing test query operation for namespace:', namespaceName);
        
        // Return test results
        response = { 
          success: true, 
          results: [
            {
              id: Date.now(),
              score: 0.92,
              attributes: {
                text: "A classic book on philosophy",
                category: "philosophy",
                created_at: new Date().toISOString()
              }
            },
            {
              id: Date.now() + 1,
              score: 0.75,
              attributes: {
                text: "A historical biography of a famous leader",
                category: "biography",
                created_at: new Date().toISOString()
              }
            }
          ],
          count: 2
        };
        break;
      }

      case OPERATIONS.QUERY: {
        // Query vectors from the namespace
        console.log('Executing query operation for namespace:', namespaceName);
        
        // Log query parameters but without exposing potentially large vector data
        const loggableParams: any = {...body};
        if (loggableParams.vector) {
          loggableParams.vectorInfo = `[vector with ${Array.isArray(loggableParams.vector) ? loggableParams.vector.length : 'unknown'} dimensions]`;
          delete loggableParams.vector;
        }
        if (loggableParams.vectors) {
          loggableParams.vectorsInfo = `[${loggableParams.vectors.length} vectors]`;
          delete loggableParams.vectors;
        }
        console.log('Query parameters:', JSON.stringify(loggableParams, null, 2));
        
        // Check if vector is provided
        if (!body.vector && (!body.vectors || body.vectors.length === 0)) {
          throw new Error('Either a query vector or vectors array must be provided');
        }
        
        try {
          const ns = tpuf.namespace(namespaceName as string);
          
          // Build query parameters
          const queryParams: any = {
            namespace: namespaceName,
            k: body.k || 5,
            filter: body.filter || undefined,
            include_embeddings: body.include_embeddings || false,
            include_metadata: body.include_metadata !== false, // true by default
            vector_query_mode: body.vector_query_mode || undefined,
          };

          // Process vector data before querying
          if (body.vector) {
            queryParams.vector = processVectorData(body.vector);
          } else if (body.vectors && Array.isArray(body.vectors)) {
            queryParams.vectors = body.vectors.map(v => processVectorData(v));
          }

          console.log('Executing query with processed parameters');
          const queryResult = await ns.query(queryParams);
          
          // Ensure we always return an array of results, even if empty
          const results = queryResult?.results || [];
          
          response = { 
            success: true, 
            results,
            count: results.length
          };
        } catch (queryError) {
          console.error('Error during query:', queryError);
          
          // Handle case where no documents are found in the namespace
          if (queryError.message.includes('no documents found in namespace')) {
            response = { 
              success: true, 
              results: [],
              count: 0,
              message: "No documents found in namespace. Try creating a document first."
            };
          } else {
            throw new Error(`Error querying vectors: ${queryError.message}`);
          }
        }
        
        break;
      }

      case OPERATIONS.DELETE: {
        // Delete vectors from the namespace
        if (!body.ids) {
          throw new Error('Vector IDs are required for delete operation');
        }
        
        const deleteNs = tpuf.namespace(namespaceName as string);
        await deleteNs.delete({ ids: body.ids });
        
        response = { success: true, message: `Deleted vectors with IDs: ${body.ids.join(', ')}` };
        break;
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    console.log('Returning response:', JSON.stringify(response));
    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error.message, error.stack);
    
    const errorMessage = error.message || 'Unknown error in Turbopuffer function';
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        success: false
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200, // Return 200 even for errors, and handle them on the client side
      }
    );
  }
}); 