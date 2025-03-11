
// This file handles token exchange between Outseta and Supabase
const EXCHANGE_URL = 'https://myeyoafugkrkwcnfedlu.functions.supabase.co/exchange';

export async function exchangeToken(outsetaToken: string): Promise<string> {
  console.log('Starting token exchange...', {
    url: EXCHANGE_URL,
    hasToken: !!outsetaToken,
    tokenLength: outsetaToken ? outsetaToken.length : 0
  });
  
  if (!outsetaToken || outsetaToken.trim() === '') {
    console.error('Empty or invalid token provided to exchange function');
    throw new Error('Invalid authentication token');
  }
  
  try {
    const response = await fetch(EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for CORS requests
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { message: errorText };
      }
      
      console.error('Token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: EXCHANGE_URL
      });
      throw new Error(`Failed to exchange token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.supabaseJwt) {
      console.error('Token exchange response missing JWT:', data);
      throw new Error('Invalid token exchange response: missing JWT');
    }
    
    console.log('Token exchange successful');
    return data.supabaseJwt;
  } catch (error) {
    console.error('Error during token exchange:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      url: EXCHANGE_URL
    });
    throw error;
  }
}
