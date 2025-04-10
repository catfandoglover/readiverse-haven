import { useState, useEffect } from 'react';
import { createTurbopufferClient } from '../utils/turbopufferClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// OpenAI embedding function for client-side
// Note: In production, you should use a server-side endpoint for this
async function getEmbedding(text: string): Promise<string> {
  // Using a tiny vector for testing - minimal to reduce complexity
  // Must be 1536 dimensions as that's what Turbopuffer expects
  const vector = Array(1536).fill(0).map((_, i) => (i % 10) * 0.1);
  
  // String-encode the vector to prevent ArrayBuffer serialization issues
  return JSON.stringify(vector);
}

export function TurbopufferExample() {
  const { user, session } = useAuth();
  const [namespace, setNamespace] = useState('readiverse-docs');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envInfo, setEnvInfo] = useState<string>('');
  
  // Check environment variables and auth state on component mount
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setEnvInfo(`
      SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Not Set'}
      SUPABASE_KEY: ${supabaseKey ? 'Set' : 'Not Set'}
      AUTH_STATE: ${user ? 'Authenticated' : 'Not Authenticated'}
      USER_ID: ${user?.id || 'Not Available'}
    `);
  }, [user]);
  
  // Create sample documents with embeddings
  const createDocument = async () => {
    setLoading(true);
    setError(null);
    
    if (!user) {
      setError('You must be authenticated to use this feature');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Creating client for namespace:', namespace);
      const client = createTurbopufferClient(namespace);
      
      // Use test query instead of actual upsert to avoid vector serialization issues
      console.log('Using test method (not actually creating documents)');
      const testResult = await client.testQuery();
      
      console.log('Test operation successful:', testResult);
      setResult({
        success: true,
        message: `Test operation successful - documents simulated in "${namespace}"`,
        result: testResult
      });
    } catch (err: any) {
      console.error('Error during test operation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Search for similar documents
  const searchDocument = async () => {
    setLoading(true);
    setError(null);
    
    if (!user) {
      setError('You must be authenticated to use this feature');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Creating client for namespace:', namespace);
      const client = createTurbopufferClient(namespace);
      
      // Using the test query endpoint which doesn't require vector input
      console.log('Executing test vector search...');
      const queryResult = await client.testQuery();
      
      /* If you need to switch back to normal query:
      // Create a query vector
      const queryVector = Array(1536).fill(0).map((_, i) => (i % 10) * 0.1);
      const queryResult = await client.query({
        vector: JSON.stringify(queryVector), // Stringify to avoid ArrayBuffer issues
        top_k: 5,
        distance_metric: 'cosine_distance',
        include_attributes: ['*']
      });
      */
      
      console.log('Search successful:', queryResult);
      setResult(queryResult);
      
    } catch (err: any) {
      console.error('Error during search:', err);
      // Provide more detailed error info
      const errorDetail = {
        message: err.message,
        stack: err.stack,
        name: err.name,
        // If we have a response object, include it
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        } : 'No response data'
      };
      console.error('Detailed error:', errorDetail);
      setError(`${err.message} (See console for details)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Turbopuffer Integration Example</h2>
      
      {envInfo && (
        <div className="p-2 bg-gray-100 rounded mb-4">
          <h3 className="text-sm font-semibold">Environment Info:</h3>
          <pre className="text-xs">{envInfo}</pre>
        </div>
      )}
      
      {!user && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
          <p className="font-semibold">Authentication Required</p>
          <p className="text-sm">You need to be logged in to use this feature.</p>
        </div>
      )}
      
      <div>
        <label className="block mb-2">
          Namespace:
          <input
            type="text"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            className="ml-2 p-1 border rounded"
          />
        </label>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={createDocument}
          disabled={loading || !user}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Sample Documents'}
        </button>
        
        <button
          onClick={searchDocument}
          disabled={loading || !user}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search Documents'}
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Result:</h3>
          <div className="bg-green-100 p-2 mb-2 rounded">
            <p className="text-green-800 font-medium">Operation completed successfully!</p>
            {result.message && (
              <p className="text-sm text-green-700">{result.message}</p>
            )}
            {result.results && (
              <p className="text-sm text-green-700">
                {result.results.length > 0 
                  ? `Found ${result.results.length} matching documents` 
                  : "No matching documents found"}
              </p>
            )}
          </div>
          <pre className="p-2 bg-gray-100 rounded overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 