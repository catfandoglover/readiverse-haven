class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  
  // Play an audio URL and stop any currently playing audio
  playAudio(audioUrl: string, expectedText?: string): void {
    // Skip if the URL is empty or invalid
    if (!audioUrl) return;
    
    console.log('AudioManager: Playing audio', { 
      audioUrl, 
      expectedText 
    });
    
    // Stop any currently playing audio
    this.stopCurrentAudio();
    
    // Check if we already have this audio element
    let audio = this.audioElements.get(audioUrl);
    
    if (!audio) {
      // Create a new audio element if we don't have it
      audio = new Audio(audioUrl);
      this.audioElements.set(audioUrl, audio);
      
      // Add event listener to clear reference when audio ends
      audio.addEventListener('ended', () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
      });
    } else {
      // Reset the audio if we're reusing it
      audio.currentTime = 0;
    }
    
    this.currentAudio = audio;
    
    // Play the audio
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      this.currentAudio = null;
    });
  }
  
  // Stop the currently playing audio
  stopCurrentAudio(): void {
    if (this.currentAudio) {
      console.log('AudioManager: Stopping current audio');
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
  
  // Stop all audio elements on the page (more aggressive approach)
  stopAllAudio(): void {
    console.log('AudioManager: Stopping all audio');
    
    // First stop our tracked audio
    this.stopCurrentAudio();
    
    // Then stop all our tracked audio elements
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Then find and stop any other audio elements that might be playing
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
  
  // Clean up resources
  cleanup(): void {
    this.stopAllAudio();
    this.audioElements.clear();
  }
}

// Create a singleton instance
export const audioManager = new AudioManager();
export default audioManager; 
