const SUPABASE_FUNCTIONS_URL = 'https://myeyoafugkrkwcnfedlu.functions.supabase.co';

export async function exchangeToken(outsetaJwt: string): Promise<string> {
  try {
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/exchange`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaJwt}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const { supabaseJwt } = await response.json();
    return supabaseJwt;
  } catch (error) {
    console.error('Failed to exchange token:', error);
    throw error;
  }
}