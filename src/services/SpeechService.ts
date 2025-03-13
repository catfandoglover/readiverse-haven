import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { audioManager, audioQueue } from './AudioManager';

const pollyClient = new PollyClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  }
});

const getPollyPresignedUrl = async (command: SynthesizeSpeechCommand): Promise<string | undefined> => {
  try {
    const signedUrl = await getSignedUrl(pollyClient, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return undefined;
  }
};

interface SpeechService {
  synthesizeSpeech: (text: string, voiceId?: string) => Promise<string>;
}

const synthesizeSpeech: SpeechService['synthesizeSpeech'] = async (text: string, voiceId = 'Matthew'): Promise<string> => {
  try {
    const pollyParams = {
      Engine: 'neural',
      LanguageCode: 'en-US',
      OutputFormat: 'mp3' as const,
      SampleRate: '24000',
      Text: text,
      TextType: 'text' as const,
      VoiceId: voiceId as const
    };

    const command = new SynthesizeSpeechCommand(pollyParams);
    const presignedUrl = await getPollyPresignedUrl(command);
    
    if (!presignedUrl) {
      throw new Error('Failed to get presigned URL for speech synthesis');
    }

    audioQueue.add(() => {
      return audioManager.playFromUrl(presignedUrl);
    });

    return presignedUrl as string;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
};

const speechService = {
  synthesizeSpeech,
};

export default speechService;
