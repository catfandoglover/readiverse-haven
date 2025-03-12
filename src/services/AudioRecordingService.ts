class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording: boolean = false;

  // Start recording audio
  async startRecording(): Promise<void> {
    try {
      // Request microphone access with optimal settings for speech recognition
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // 16kHz sample rate for better speech recognition
          channelCount: 1 // Mono audio for better speech recognition
        } 
      });
      
      // Determine the best audio format to use
      // Prefer audio/mp3 or audio/wav if available as they're more widely supported
      let mimeType = 'audio/webm';
      
      // Check for supported MIME types in order of preference
      const preferredTypes = [
        'audio/mp3',
        'audio/wav', 
        'audio/webm',
        'audio/ogg'
      ];
      
      for (const type of preferredTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      // Create media recorder with options
      const options = {
        mimeType,
        audioBitsPerSecond: 128000 // 128kbps for good quality
      };
      
      console.log('Creating MediaRecorder with options:', options);
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      
      this.audioChunks = [];
      
      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };
      
      // Start recording with small timeslices to get more frequent chunks
      this.mediaRecorder.start(100); // Get data every 100ms
      this.isRecording = true;
      console.log('Recording started with MIME type:', mimeType);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  // Stop recording and get the audio blob
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      // Set up event handler for when recording stops
      this.mediaRecorder.onstop = () => {
        // Create a single blob from all the chunks
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        this.isRecording = false;
        
        // Stop all tracks in the stream
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        console.log('Recording stopped, blob size:', audioBlob.size, 'bytes, type:', audioBlob.type);
        
        // Try to convert to a more compatible format if needed
        this._ensureCompatibleFormat(audioBlob)
          .then(processedBlob => {
            console.log('Processed audio blob:', processedBlob.size, 'bytes, type:', processedBlob.type);
            resolve(processedBlob);
          })
          .catch(error => {
            console.error('Error processing audio format:', error);
            // Fall back to the original blob
            resolve(audioBlob);
          });
      };

      // Stop recording
      this.mediaRecorder.stop();
    });
  }

  // Ensure the audio is in a compatible format
  private async _ensureCompatibleFormat(blob: Blob): Promise<Blob> {
    // For now, just return the original blob
    // In the future, we could add conversion logic here if needed
    return blob;
  }

  // Check if currently recording
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Cancel recording
  cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Stop all tracks in the stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      
      console.log('Recording cancelled');
    }
  }

  // Create an audio URL from a blob
  createAudioUrl(audioBlob: Blob): string {
    return URL.createObjectURL(audioBlob);
  }

  // Revoke an audio URL to free up memory
  revokeAudioUrl(audioUrl: string): void {
    URL.revokeObjectURL(audioUrl);
  }
}

// Create a singleton instance
export const audioRecordingService = new AudioRecordingService();
export default audioRecordingService;
