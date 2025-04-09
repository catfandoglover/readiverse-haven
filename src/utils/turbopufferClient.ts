import { createClient } from '@supabase/supabase-js';
import { supabase as appSupabase } from '@/integrations/supabase/client';

// Extend ImportMeta interface for environment variables
declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}

// Types for Turbopuffer operations
export type TurbopufferVector = {
  id: number | string;
  vector: number[] | string; // Allow string for JSON-encoded vectors
  attributes?: Record<string, any>;
};

export type TurbopufferQueryParams = {
  vector?: number[] | string; // Allow string for JSON-encoded vectors
  top_k?: number;
  distance_metric?: 'cosine_distance' | 'dot_product' | 'euclidean_distance';
  filters?: any[];
  include_attributes?: string[];
  include_vectors?: boolean;
  rank_by?: [string, string, string]; // [field, method, query]
  vector_query_mode?: 'exact' | 'hybrid_search' | 'approximate';
};

export type TurbopufferUpsertParams = {
  vectors: TurbopufferVector[];
  distance_metric?: 'cosine_distance' | 'dot_product' | 'euclidean_distance';
  schema?: Record<string, any>;
};

export class TurbopufferClient {
  private supabase;
  private namespace: string;

  constructor(namespace: string) {
    // Use the existing Supabase client from the app
    this.supabase = appSupabase;
    this.namespace = namespace;
  }

  /**
   * Helper method to ensure vector data is safely serializable
   */
  private safeSerializeVector(params: any): any {
    try {
      // First try a safe approach with custom handling
      const result = {...params};  // Shallow copy
      
      // Handle vector if present
      if (params.vector) {
        // If it's already an Array, convert to plain numbers
        if (Array.isArray(params.vector)) {
          result.vector = Array.from(params.vector).map(Number);
        } 
        // Handle ArrayBuffer, Float32Array etc.
        else if (params.vector.buffer instanceof ArrayBuffer || 
                 params.vector instanceof Float32Array ||
                 params.vector instanceof Float64Array) {
          result.vector = Array.from(params.vector).map(Number);
        }
      }
      
      // Handle vectors array if present
      if (params.vectors && Array.isArray(params.vectors)) {
        result.vectors = params.vectors.map((item: any) => {
          if (!item) return null;
          
          const vectorItem = {...item};
          if (item.vector) {
            // If it's already an Array, convert to plain numbers
            if (Array.isArray(item.vector)) {
              vectorItem.vector = Array.from(item.vector).map(Number);
            } 
            // Handle ArrayBuffer, Float32Array etc.
            else if (item.vector.buffer instanceof ArrayBuffer || 
                     item.vector instanceof Float32Array ||
                     item.vector instanceof Float64Array) {
              vectorItem.vector = Array.from(item.vector).map(Number);
            }
          }
          return vectorItem;
        }).filter(Boolean);
      }
      
      // Test if the result is serializable
      JSON.stringify(result);
      return result;
    } catch (error) {
      console.error("Error serializing vector data:", error);
      // Fallback to a more manual approach if the safe approach fails
      const fallbackResult: any = {};
      
      // Copy all non-vector properties
      Object.keys(params).forEach(key => {
        if (key !== 'vector' && key !== 'vectors') {
          fallbackResult[key] = params[key];
        }
      });
      
      // Handle vector separately
      if (params.vector) {
        try {
          fallbackResult.vector = Array.from(
            typeof params.vector.map === 'function' 
              ? params.vector.map(Number) 
              : params.vector
          );
        } catch (e) {
          console.error("Could not process vector:", e);
          throw new Error("Vector data cannot be serialized for API transmission");
        }
      }
      
      // Handle vectors array separately
      if (params.vectors) {
        try {
          fallbackResult.vectors = params.vectors.map((item: any) => {
            const safeItem: any = {};
            Object.keys(item).forEach(key => {
              if (key !== 'vector') {
                safeItem[key] = item[key];
              }
            });
            
            if (item.vector) {
              safeItem.vector = Array.from(
                typeof item.vector.map === 'function' 
                  ? item.vector.map(Number) 
                  : item.vector
              );
            }
            return safeItem;
          });
        } catch (e) {
          console.error("Could not process vectors array:", e);
          throw new Error("Vectors array cannot be serialized for API transmission");
        }
      }
      
      return fallbackResult;
    }
  }

  /**
   * Create or retrieve a namespace
   */
  public async getOrCreateNamespace(name?: string): Promise<{ namespace: string, created: boolean }> {
    const nameToUse = name || this.namespace;
    
    const { data, error } = await this.supabase.functions.invoke('turbopuffer-api', {
      method: 'POST',
      body: { 
        operation: 'namespace',
        namespace: nameToUse 
      }
    });
    
    if (error) {
      throw new Error(`Error creating/getting namespace: ${error.message}`);
    }
    
    return data;
  }

  /**
   * Query vectors from the namespace
   */
  public async query(params: TurbopufferQueryParams): Promise<any> {
    // Process the vector data to ensure it's serializable
    const safeParams = this.safeSerializeVector(params);
    
    console.log('Sending query request to turbopuffer-api function with params:', 
      JSON.stringify({
        namespace: this.namespace,
        ...safeParams
      }, null, 2)
    );
    
    try {
      const { data, error } = await this.supabase.functions.invoke('turbopuffer-api', {
        method: 'POST',
        body: {
          operation: 'query',
          namespace: this.namespace,
          ...safeParams
        }
      });
      
      if (error) {
        console.error('Error from turbopuffer-api function:', error);
        
        // If it's an Edge Function error (status code issue), let's provide a clearer message
        if (error.message.includes('non-2xx status code')) {
          throw new Error('No documents found in namespace. Try creating a document first.');
        }
        
        throw new Error(`Error querying vectors: ${error.message}`);
      }
      
      console.log('Received response from turbopuffer-api function:', data);
      
      // Return a consistent format even if the response is null
      if (!data) {
        return { success: true, results: [] };
      }
      
      return data;
    } catch (err: any) {
      // Capture network or other errors
      console.error('Error during turbopuffer-api query request:', err);
      throw err;
    }
  }

  /**
   * Upsert vectors to the namespace
   */
  public async upsert(params: TurbopufferUpsertParams): Promise<any> {
    // Process the vector data to ensure it's serializable
    const safeParams = this.safeSerializeVector(params);
    
    const { data, error } = await this.supabase.functions.invoke('turbopuffer-api', {
      method: 'POST',
      body: {
        operation: 'upsert',
        namespace: this.namespace,
        ...safeParams
      }
    });
    
    if (error) {
      throw new Error(`Error upserting vectors: ${error.message}`);
    }
    
    return data;
  }

  /**
   * Delete vectors from the namespace
   */
  public async delete(ids: (number | string)[]): Promise<any> {
    const { data, error } = await this.supabase.functions.invoke('turbopuffer-api', {
      method: 'POST',
      body: {
        operation: 'delete',
        namespace: this.namespace,
        ids
      }
    });
    
    if (error) {
      throw new Error(`Error deleting vectors: ${error.message}`);
    }
    
    return data;
  }

  /**
   * Query vectors from the namespace using the test mode (no vector processing)
   */
  public async testQuery(): Promise<any> {
    console.log('Sending test query request to turbopuffer-api function');
    
    try {
      const { data, error } = await this.supabase.functions.invoke('turbopuffer-api', {
        method: 'POST',
        body: {
          operation: 'test_query',
          namespace: this.namespace
        }
      });
      
      if (error) {
        console.error('Error from turbopuffer-api function:', error);
        throw new Error(`Error in test query: ${error.message}`);
      }
      
      console.log('Received response from turbopuffer-api function:', data);
      
      // Return a consistent format even if the response is null
      if (!data) {
        return { success: true, results: [] };
      }
      
      return data;
    } catch (err: any) {
      // Capture network or other errors
      console.error('Error during turbopuffer-api test query request:', err);
      throw err;
    }
  }
}

// Helper function to create a TurbopufferClient instance
export function createTurbopufferClient(namespace: string): TurbopufferClient {
  return new TurbopufferClient(namespace);
} 