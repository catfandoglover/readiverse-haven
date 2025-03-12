import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if the API key is configured
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const hasApiKey = !!apiKey;
    
    // Return a sanitized response (don't expose the actual key)
    return res.status(200).json({
      environment: process.env.NODE_ENV || 'unknown',
      hasGeminiApiKey: hasApiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 3) + '...' : 'not-set'
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 
