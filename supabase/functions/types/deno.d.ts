// Type declarations for Deno modules

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler?: (request: Request) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: ServeInit
  ): void;
}

declare module "npm:jose@4.14.4" {
  export interface JWTPayload {
    [key: string]: any;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
  }

  export interface JWTVerifyResult {
    payload: JWTPayload;
    protectedHeader: { [key: string]: any };
  }

  export class SignJWT {
    constructor(payload: JWTPayload);
    setProtectedHeader(header: { [key: string]: any }): this;
    setIssuer(issuer: string): this;
    setIssuedAt(issuedAt?: number): this;
    setExpirationTime(exp: number | string): this;
    sign(key: Uint8Array): Promise<string>;
  }

  export function createRemoteJWKSet(url: URL): (protectedHeader: { [key: string]: any }) => Promise<any>;
  export function jwtVerify(jwt: string, key: any): Promise<JWTVerifyResult>;
} 
