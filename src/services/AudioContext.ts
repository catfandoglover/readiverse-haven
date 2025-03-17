
// AudioContext.ts - A service to manage global audio playback state
import { create } from 'zustand';

interface AudioState {
  currentlyPlaying: HTMLAudioElement | null;
  setCurrentlyPlaying: (audio: HTMLAudioElement | null) => void;
  stopCurrentlyPlaying: () => void;
}

// Create a store to manage the currently playing audio
const useAudioStore = create<AudioState>((set) => ({
  currentlyPlaying: null,
  setCurrentlyPlaying: (audio) => {
    set((state) => {
      // Stop the currently playing audio if there is one
      if (state.currentlyPlaying && state.currentlyPlaying !== audio) {
        state.currentlyPlaying.pause();
      }
      return { currentlyPlaying: audio };
    });
  },
  stopCurrentlyPlaying: () => {
    set((state) => {
      if (state.currentlyPlaying) {
        state.currentlyPlaying.pause();
      }
      return { currentlyPlaying: null };
    });
  }
}));

// Helper function to create an AudioContext
export const createAudioContext = (): AudioContext => {
  return new (window.AudioContext || window.webkitAudioContext)();
};

// Helper function to play audio with global management
export const playAudio = (audio: HTMLAudioElement): Promise<void> => {
  const { currentlyPlaying, setCurrentlyPlaying } = useAudioStore.getState();
  
  // Stop any currently playing audio
  if (currentlyPlaying && currentlyPlaying !== audio) {
    currentlyPlaying.pause();
  }
  
  // Set this audio as the currently playing one
  setCurrentlyPlaying(audio);
  
  // Play the audio
  return audio.play();
};

// Helper function to stop all audio
export const stopAllAudio = (): void => {
  useAudioStore.getState().stopCurrentlyPlaying();
};

export default useAudioStore;
