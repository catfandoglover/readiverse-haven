
const EXCHANGE_URL = 'https://myeyoafugkrkwcnfedlu.functions.supabase.co/exchange';

export async function exchangeToken(outsetaToken: string): Promise<string> {
  console.log('Starting token exchange...', {
    url: EXCHANGE_URL,
    hasToken: !!outsetaToken
  });
  
  try {
    const response = await fetch(EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Token exchange failed:', {
        status: response.status,
        error,
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
