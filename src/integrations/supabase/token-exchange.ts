
const EXCHANGE_URL = 'https://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/exchange';

export async function exchangeToken(outsetaToken: string): Promise<string> {
  console.log('Starting token exchange...');
  
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
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange token');
    }

    const { supabaseJwt } = await response.json();
    console.log('Token exchange successful');
    return supabaseJwt;
  } catch (error) {
    console.error('Error during token exchange:', error);
    throw error;
  }
}
