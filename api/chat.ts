import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the message data from the request body
    const { messages, sessionId, userMessage, generation_config } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'Missing message data' });
    }

    // Get the API key from environment variables (will be set in Vercel dashboard)
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
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

    // Make API request to Gemini
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return res.status(response.status).json({ 
        error: `Gemini API returned ${response.status}`, 
        details: errorData 
      });
    }

    const responseData = await response.json();

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
      return res.status(500).json({ error: 'Failed to extract response from Gemini' });
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
