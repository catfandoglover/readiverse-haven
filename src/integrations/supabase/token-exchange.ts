
const SUPABASE_FUNCTIONS_URL = 'https://myeyoafugkrkwcnfedlu.functions.supabase.co';

export async function exchangeToken(outsetaJwt: string): Promise<string> {
  try {
    console.log('Starting token exchange...');
    
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/exchange`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaJwt}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error('Token exchange failed');
    }

    const { supabaseJwt } = await response.json();
    console.log('Token exchange successful');
    return supabaseJwt;
  } catch (error) {
    console.error('Failed to exchange token:', error);
    throw error;
  }
}
