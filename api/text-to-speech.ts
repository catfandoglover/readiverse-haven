import { VercelRequest, VercelResponse } from '@vercel/node';
import { PollyClient, SynthesizeSpeechCommand, Engine } from '@aws-sdk/client-polly';
import { Readable } from 'stream';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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

    console.log('Text-to-speech request received:', { 
      textLength: text.length, 
      voiceId, 
      outputFormat 
    });

    // Get AWS credentials from environment variables
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      console.error('AWS credentials not configured');
      return res.status(500).json({ error: 'AWS credentials not configured' });
    }

    console.log('AWS credentials found, region:', region);

    // Initialize Polly client
    const polly = new PollyClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    // Create the parameters for synthesizeSpeech
    const speechParams = {
      OutputFormat: outputFormat,
      SampleRate: sampleRate,
      Text: text,
      TextType: textType,
      VoiceId: voiceId,
      Engine: 'neural' as Engine
    };

    console.log('Requesting speech synthesis with params:', {
      OutputFormat: outputFormat,
      SampleRate: sampleRate,
      TextLength: text.length,
      TextType: textType,
      VoiceId: voiceId,
      Engine: 'neural'
    });

    // Use SynthesizeSpeechCommand directly
    try {
      const command = new SynthesizeSpeechCommand(speechParams);
      const response = await polly.send(command);
      
      if (!response.AudioStream) {
        throw new Error('No audio stream returned from Polly');
      }
      
      // Convert AudioStream to buffer
      const audioStream = response.AudioStream;
      const chunks: Buffer[] = [];
      
      // Handle the stream as a Node.js readable stream
      const stream = audioStream as unknown as Readable;
      
      // Collect chunks
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      
      // Combine chunks into a single buffer
      const buffer = Buffer.concat(chunks);
      
      // Convert to base64
      const base64Audio = buffer.toString('base64');
      
      // Create a data URL
      const audioUrl = `data:audio/${outputFormat};base64,${base64Audio}`;
      
      console.log('Successfully generated speech data');
      
      // Return the audio data URL
      return res.status(200).json({ audioUrl });
    } catch (awsError) {
      console.error('AWS Polly error:', awsError instanceof Error ? awsError.message : String(awsError));
      return res.status(500).json({ 
        error: 'Failed to generate speech', 
        details: awsError instanceof Error ? awsError.message : String(awsError)
      });
    }
  } catch (error) {
    console.error('Error synthesizing speech:', error instanceof Error ? error.message : String(error));
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
