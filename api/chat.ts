import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get the message data from the request body
    const { messages, sessionId, userMessage, generation_config } = req.body;
    if (!messages) {
      return res.status(400).json({ error: 'Missing message data' });
    }

    // Set up the Gemini API URL
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    // Create request payload for Gemini
    const requestPayload = {
      contents: messages,
      generation_config: generation_config || {
        temperature: 0.7,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 1000,
      }
    };

    console.log('Sending request to Gemini API:', JSON.stringify(requestPayload, null, 2).substring(0, 500) + '...');

    // Make API request to Gemini
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      // Clone the response first so we can read it multiple times if needed
      const errorClone = response.clone();
      
      try {
        // Try to parse as JSON first
        const errorData = await errorClone.json();
        console.error(`Gemini API error (${response.status}):`, JSON.stringify(errorData));
        return res.status(response.status).json({ 
          error: `Gemini API returned ${response.status}`, 
          details: errorData 
        });
      } catch (parseError) {
        // If it's not valid JSON, get it as text
        const errorText = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: `Gemini API returned ${response.status}`, 
          details: errorText.substring(0, 500) // Limit the length
        });
      }
    }

    // Parse the response
    const responseData = await response.json();
    console.log('Received response from Gemini API:', JSON.stringify(responseData, null, 2).substring(0, 500) + '...');

    // Extract the response text
    if (responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts[0] && 
        responseData.candidates[0].content.parts[0].text) {
      
      const text = responseData.candidates[0].content.parts[0].text;
      return res.status(200).json({ text });
    } else {
      console.error('Failed to extract response from Gemini:', JSON.stringify(responseData));
      return res.status(500).json({ 
        error: 'Failed to extract response from Gemini',
        details: responseData
      });
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
