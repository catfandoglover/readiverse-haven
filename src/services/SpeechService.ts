import { supabase } from "@/integrations/supabase/client";

interface SpeechResponse {
  audioUrl: string;
}

const synthesizeSpeech = async (text: string): Promise<string> => {
  try {
    const response = await fetch('/api/synthesize-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Speech synthesis failed: ${response.statusText}`);
    }

    const data: SpeechResponse = await response.json();
    return data.audioUrl;
  } catch (error) {
    console.error('Error in speech synthesis:', error);
    
    // Fallback to pre-recorded audio if available
    try {
      const { data, error: supabaseError } = await supabase
        .from('fallback_audio')
        .select('url')
        .limit(1)
        .single();
      
      if (data && !supabaseError) {
        return data.url.toString();
      }
    } catch (fallbackError) {
      console.error('Error fetching fallback audio:', fallbackError);
    }
    
    throw error;
  }
};

export default {
  synthesizeSpeech
};
