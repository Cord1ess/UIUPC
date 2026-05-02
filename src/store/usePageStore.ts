import { create } from 'zustand';

interface PageState {
  visitedPaths: Set<string>;
  markAsVisited: (path: string) => void;
  hasVisited: (path: string) => boolean;
}

export const usePageStore = create<PageState>((set, get) => ({
  visitedPaths: new Set(),
  markAsVisited: (path: string) => {
    const { visitedPaths } = get();
    if (!visitedPaths.has(path)) {
      const newVisited = new Set(visitedPaths);
      newVisited.add(path);
      set({ visitedPaths: newVisited });
    }
  },
  hasVisited: (path: string) => {
    return get().visitedPaths.has(path);
  },
}));
