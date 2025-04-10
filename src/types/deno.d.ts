// Type declarations for Deno modules
declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (request: Request) => Promise<Response> | Response): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.37.0' {
  export function createClient(url: string, key: string): any;
}

declare module 'npm:@turbopuffer/turbopuffer' {
  export class Turbopuffer {
    constructor(options: { apiKey: string; baseUrl: string });
    namespace(name: string): {
      upsert(params: any): Promise<any>;
      query(params: any): Promise<any>;
      delete(params: { ids: (string | number)[] }): Promise<any>;
    };
  }
}

// Deno global namespace
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
} 