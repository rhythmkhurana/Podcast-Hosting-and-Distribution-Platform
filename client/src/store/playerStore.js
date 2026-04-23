import { create } from 'zustand';

const usePlayerStore = create((set) => ({
  currentEpisode: null,
  podcast: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  queue: [],
  volume: 1,
  speed: 1,
  audioContextState: null, // For visualizer

  setEpisode: (episode, podcast) => set({ 
    currentEpisode: episode, 
    podcast, 
    isPlaying: true 
  }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => set({ volume }),
  setSpeed: (speed) => set({ speed }),
  
  addToQueue: (episode) => set((state) => ({ queue: [...state.queue, episode] })),
  clearQueue: () => set({ queue: [] }),
  
  clearPlayer: () => set({ 
    currentEpisode: null, 
    podcast: null, 
    isPlaying: false, 
    currentTime: 0, 
    duration: 0 
  }),

  playNext: () => set((state) => {
    if (state.queue.length > 0) {
      const nextEpisode = state.queue[0];
      const newQueue = state.queue.slice(1);
      return { currentEpisode: nextEpisode, queue: newQueue, isPlaying: true, currentTime: 0 };
    }
    return state;
  }),
}));

export default usePlayerStore;
