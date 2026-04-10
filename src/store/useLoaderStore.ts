import { create } from 'zustand';

interface LoaderState {
  isLoaded: boolean;
  isAnimationComplete: boolean;
  progress: number;
  setLoaded: (loaded: boolean) => void;
  setAnimationComplete: (complete: boolean) => void;
  setProgress: (progress: number) => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  isLoaded: false,
  isAnimationComplete: false,
  progress: 0,
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setAnimationComplete: (complete) => set({ isAnimationComplete: complete }),
  setProgress: (progress) => set({ progress }),
}));
