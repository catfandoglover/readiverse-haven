
const EXCHANGE_URL = 'https://myeyoafugkrkwcnfedlu.functions.supabase.co/exchange';

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
    // Log token format for debugging
    console.log('Sending token exchange request');
    
    const response = await fetch(EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaToken}`,
        'Content-Type': 'application/json'
      },
      // Ensure CORS is respected
      mode: 'cors',
      credentials: 'omit'
    });

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
