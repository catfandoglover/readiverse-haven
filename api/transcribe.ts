import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the audio data from the request body
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audio data' });
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
      contents: [
        {
          parts: [
            {
              text: "Please transcribe this audio recording accurately:"
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: audioBase64
              }
            }
          ]
        }
      ],
      generation_config: {
        temperature: 0.2,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 1024,
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

    // Extract the transcription text
    if (responseData.candidates && 
        responseData.candidates[0] && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts[0] && 
        responseData.candidates[0].content.parts[0].text) {
      
      const transcription = responseData.candidates[0].content.parts[0].text;
      
      // Clean up the transcription
      let cleanedTranscription = cleanTranscription(transcription);
      
      // If empty after cleaning, return a default message
      if (!cleanedTranscription.trim()) {
        cleanedTranscription = "I couldn't transcribe your message clearly";
      }
      
      return res.status(200).json({ transcription: cleanedTranscription });
    } else {
      return res.status(500).json({ error: 'Failed to extract transcription from Gemini response' });
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Helper function to clean up the transcription text
function cleanTranscription(text: string): string {
  // Remove any "Transcription:" prefix
  let cleaned = text.replace(/^(transcription:|transcript:)/i, '').trim();
  
  // Remove surrounding quotes if present
  cleaned = cleaned.replace(/^["'](.*)["']$/s, '$1');
  
  // Remove any markdown formatting
  cleaned = cleaned.replace(/```.*?```/gs, '').trim();
  
  return cleaned;
}
