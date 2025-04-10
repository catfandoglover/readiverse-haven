// Type declarations for Supabase modules
declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    functions: {
      invoke(
        functionName: string,
        options?: {
          method?: string;
          headers?: Record<string, string>;
          body?: any;
        }
      ): Promise<{
        data: any;
        error: any;
      }>;
    };
  }

  export function createClient(url: string, key: string): SupabaseClient;
} 