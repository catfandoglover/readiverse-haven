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
    const tokenParts = outsetaToken.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Token does not appear to be in standard JWT format (expected 3 parts):', {
        partsCount: tokenParts.length
      });
    } else {
      console.log('Token format appears valid (has 3 parts)');
    }
    
    console.log('Sending token exchange request');
    
    const response = await fetch(EXCHANGE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outsetaToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    const responseText = await response.text();
    
    // Try to parse the response as JSON
    let responseJson;
    try {
      responseJson = JSON.parse(responseText);
      console.log('Response parsed as JSON');
    } catch (e) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      console.error('Token exchange failed:', {
        status: response.status,
        error: responseJson,
        url: EXCHANGE_URL
      });
      
      throw new Error(`Failed to exchange token: ${responseJson?.details || responseJson?.error || response.statusText}`);
    }

    if (!responseJson.supabaseJwt) {
      console.error('Missing supabaseJwt in response:', responseJson);
      throw new Error('Invalid response: missing supabaseJwt');
    }

    console.log('Token exchange successful');
    return responseJson.supabaseJwt;
  } catch (error) {
    console.error('Error during token exchange:', {
      error,
      url: EXCHANGE_URL
    });
    throw error;
  }
}
