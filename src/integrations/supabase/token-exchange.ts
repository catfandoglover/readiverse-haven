
// URL for the token exchange function
const EXCHANGE_URL = 'https://myeyoafugkrkwcnfedlu.functions.supabase.co/exchange';

/**
 * Exchanges an Outseta token for a Supabase JWT
 * This function sends the Outseta token to a Supabase Edge Function,
 * which verifies it and returns a new Supabase-compatible JWT.
 */
export async function exchangeToken(outsetaToken: string): Promise<string> {
  console.log('Starting token exchange...', {
    url: EXCHANGE_URL,
    hasToken: !!outsetaToken,
    tokenLength: outsetaToken?.length || 0
  });
  
  if (!outsetaToken) {
    console.error('Empty token provided to exchange function');
    throw new Error('No Outseta token available');
  }
  
  try {
    // Try two different methods to pass the token:
    // 1. First attempt: Send as Bearer token in Authorization header
    console.log('Sending token exchange request with Authorization header');
    
    let response = await fetch(EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaToken}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
    });

    // If first attempt fails, try the second method
    if (!response.ok && response.status === 401) {
      console.log('Authorization header approach failed, trying with request body');
      
      // 2. Second attempt: Send token in request body
      response = await fetch(EXCHANGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: outsetaToken }),
        mode: 'cors',
        credentials: 'omit'
      });
    }

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      let errorMessage = 'Failed to exchange token';
      try {
        const errorData = await response.json();
        console.error('Token exchange failed:', {
          status: response.status,
          error: errorData,
          url: EXCHANGE_URL
        });
        errorMessage = errorData?.details || errorData?.error || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', await response.text());
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.supabaseJwt) {
      console.error('Missing supabaseJwt in response:', data);
      throw new Error('Invalid response: missing supabaseJwt');
    }

    console.log('Token exchange successful');
    return data.supabaseJwt;
  } catch (error) {
    console.error('Error during token exchange:', {
      error,
      url: EXCHANGE_URL
    });
    throw error;
  }
}
