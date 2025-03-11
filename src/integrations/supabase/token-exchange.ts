
// This file handles token exchange between Outseta and Supabase
const EXCHANGE_URL = 'https://myeyoafugkrkwcnfedlu.functions.supabase.co/exchange';

export async function exchangeToken(outsetaToken: string): Promise<string> {
  console.log('Starting token exchange...', {
    url: EXCHANGE_URL,
    hasToken: !!outsetaToken,
    tokenPrefix: outsetaToken.substring(0, 10) + '...'
  });
  
  try {
    // Add a timestamp to prevent caching issues
    const url = `${EXCHANGE_URL}?_=${Date.now()}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      }
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      
      console.error('Token exchange failed:', {
        status: response.status,
        error: errorData,
        url: EXCHANGE_URL
      });
      throw new Error('Failed to exchange token');
    }

    const { supabaseJwt } = await response.json();
    console.log('Token exchange successful');
    return supabaseJwt;
  } catch (error) {
    console.error('Error during token exchange:', {
      error,
      url: EXCHANGE_URL
    });
    throw error;
  }
}
