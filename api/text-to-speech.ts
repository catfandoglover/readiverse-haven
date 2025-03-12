import { VercelRequest, VercelResponse } from '@vercel/node';
import { PollyClient, SynthesizeSpeechCommandInput } from '@aws-sdk/client-polly';
import { getSynthesizeSpeechUrl } from '@aws-sdk/polly-request-presigner';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get text and voice options from the request body
    const { 
      text, 
      voiceId = 'Arthur', 
      outputFormat = 'mp3', 
      sampleRate = '16000',
      textType = 'text'
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text to synthesize' });
    }

    // Get AWS credentials from environment variables (will be set in Vercel dashboard)
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      return res.status(500).json({ error: 'AWS credentials not configured' });
    }

    // Initialize Polly client
    const polly = new PollyClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    // Create the parameters for synthesizeSpeech
    const speechParams: SynthesizeSpeechCommandInput = {
      OutputFormat: outputFormat,
      SampleRate: sampleRate,
      Text: text,
      TextType: textType,
      VoiceId: voiceId,
      Engine: 'neural'
    };

    // Get presigned URL for the speech
    const url = await getSynthesizeSpeechUrl({
      client: polly,
      params: speechParams
    });

    // Return the audio URL
    return res.status(200).json({ audioUrl: url });
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
