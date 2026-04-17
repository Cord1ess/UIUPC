import { create } from "zustand";

export interface StudioImage {
  id: string;
  file: File;
  originalUrl: string; // The original uploaded file
  workingUrl: string;  // The current state of the image (after applied edits)
  originalSize: number;
  status: "idle" | "processing" | "done" | "error";
  edits: {
    crop?: any;
    editorial?: {
      exposure: number;
      brightness: number;
      contrast: number;
      saturation: number;
      blur?: number;
      temperature: number;
      sharpen: number;
      vignette: number;
      vibrance: number;
    };
    metadata?: {
      stripExif: boolean;
      overrides: Record<string, string>;
    };
    transformer?: {
      resizer: {
        mode: "none" | "dimensions" | "weight";
        width?: number;
        height?: number;
        percentage?: number;
        targetWeight?: number;
      };
      watermark: {
        enabled: boolean;
        type: "text" | "image";
        text?: string;
        imageUri?: string;
        opacity: number;
        position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
        tiled?: boolean;
      };
    };
  };
  history: Array<{
    id: string;
    toolId: string;
    label: string;
    editsSnapshot: string;   // JSON string of the state snapshot
    workingUrlSnapshot: string; // The URL at that state
    timestamp: number;
  }>;
}

interface StudioState {
  images: StudioImage[];
  activeImageId: string | null;
  activeToolId: string;
  retouchMode: "background" | "inpaint";
  brushSize: number;
  maxImages: number;
  uiKey: number;
  
  // Actions
  restartUi: () => void;
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearStudio: () => void;
  setActiveImage: (id: string) => void;
  setActiveTool: (id: string) => void;
  setRetouchMode: (mode: "background" | "inpaint") => void;
  setBrushSize: (size: number) => void;
  updateImageResult: (id: string, updates: Partial<StudioImage>) => void;
  updateImageEdits: (id: string, edits: Partial<StudioImage["edits"]>) => void;
  applyProcessedImage: (id: string, newBlob: Blob, toolId: string, label: string) => void;
  revertToHistory: (imageId: string, historyId: string) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  images: [],
  activeImageId: null,
  activeToolId: "optimizer",
  retouchMode: "background",
  brushSize: 24,
  maxImages: 20,
  uiKey: 0,

  restartUi: () => set((state) => ({ uiKey: state.uiKey + 1, activeToolId: "optimizer", retouchMode: "background" })),

  setRetouchMode: (mode) => set({ retouchMode: mode }),
  setBrushSize: (size) => set({ brushSize: size }),

  addImages: async (files) => {
    const currentImages = get().images;
    if (currentImages.length >= 20) return;

    const filesToProcess = files.slice(0, 20 - currentImages.length);
    const newImages: StudioImage[] = [];

    for (const file of filesToProcess) {
      let url = URL.createObjectURL(file);
      const ext = file.name.split('.').pop()?.toLowerCase();
      const rawExtensions = ['cr2', 'nef', 'arw', 'dng', 'orf', 'raf', 'rw2', 'pef', 'srw', '3fr'];
      const isRaw = rawExtensions.includes(ext || '');
      const isTiff = ext === 'tif' || ext === 'tiff';

      if (isRaw || isTiff) {
        try {
          const ExifReader = (await import("exifreader")).default;
          const tags = await ExifReader.load(file);
          if (tags['Thumbnail'] && tags['Thumbnail'].image) {
            const thumbnailBlob = new Blob([tags['Thumbnail'].image], { type: 'image/jpeg' });
            url = URL.createObjectURL(thumbnailBlob);
          } else if (isTiff) {
            // Fallback to UTIF for TIFF if no thumbnail
            const UTIF = (await import("utif")).default;
            const buffer = await file.arrayBuffer();
            const ifds = UTIF.decode(buffer);
            UTIF.decodeImage(buffer, ifds[0]);
            const tgba = UTIF.toRGBA8(ifds[0]);
            const canvas = document.createElement('canvas');
            canvas.width = ifds[0].width;
            canvas.height = ifds[0].height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imgData = ctx.createImageData(ifds[0].width, ifds[0].height);
              imgData.data.set(tgba);
              ctx.putImageData(imgData, 0, 0);
              const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
              url = URL.createObjectURL(blob);
            }
          }
        } catch (e) {
          console.error("Error processing RAW/TIFF:", e);
        }
      }

      newImages.push({
        id: Math.random().toString(36).substring(7),
        file,
        originalUrl: URL.createObjectURL(file), // Keep a URL to the original binary
        workingUrl: url,
        originalSize: file.size,
        status: "idle",
        edits: {
          editorial: { 
            exposure: 0, brightness: 0, contrast: 0, saturation: 100, 
            sharpen: 0, sepia: 0, invert: 0, hueRotate: 0, blur: 0,
            temperature: 0, vignette: 0, vibrance: 0
          },
          metadata: { stripExif: false, overrides: {} },
          transformer: {
            resizer: { mode: "none" },
            watermark: { enabled: false, type: "text", opacity: 0.5, position: "bottom-right", tiled: false }
          }
        },
        history: [{
          id: 'init',
          toolId: 'import',
          label: 'Original Image',
          editsSnapshot: JSON.stringify({
            editorial: { 
              exposure: 0, brightness: 0, contrast: 0, saturation: 100, 
              sharpen: 0, sepia: 0, invert: 0, hueRotate: 0, blur: 0,
              temperature: 0, vignette: 0, vibrance: 0
            },
            metadata: { stripExif: false, overrides: {} },
            transformer: {
              resizer: { mode: "none" },
              watermark: { 
                enabled: false, 
                type: "text", 
                opacity: 1, 
                position: "bottom-right", 
                tiled: false,
                scale: 0.06,
                inset: 0.02
              }
            }
          }),
          workingUrlSnapshot: url,
          timestamp: Date.now()
        }],
      });
    }

    set({ 
      images: [...currentImages, ...newImages],
      activeImageId: get().activeImageId || newImages[0]?.id || null 
    });
  },

  removeImage: (id) => {
    const images = get().images.filter((img) => img.id !== id);
    const activeImageId = get().activeImageId === id 
      ? images[0]?.id || null 
      : get().activeImageId;
    
    // Clean up memory
    const removedImg = get().images.find(img => img.id === id);
    if (removedImg) {
      URL.revokeObjectURL(removedImg.originalUrl);
      if (removedImg.workingUrl !== removedImg.originalUrl) {
         URL.revokeObjectURL(removedImg.workingUrl);
      }
      removedImg.history.forEach(h => {
        if (h.workingUrlSnapshot !== removedImg.originalUrl) {
          URL.revokeObjectURL(h.workingUrlSnapshot);
        }
      });
    }

    set({ images, activeImageId });
  },

  clearStudio: () => {
    get().images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      img.history.forEach(h => URL.revokeObjectURL(h.workingUrlSnapshot));
    });
    set({ images: [], activeImageId: null });
  },

  setActiveImage: (id) => set({ activeImageId: id }),
  
  setActiveTool: (id) => set({ activeToolId: id }),

  updateImageResult: (id, updates) => set((state) => ({
    images: state.images.map((img) => 
      img.id === id ? { ...img, ...updates } : img
    ),
  })),

  updateImageEdits: (id, edits) => set((state) => ({
    images: state.images.map((img) => 
      img.id === id ? { ...img, edits: { ...img.edits, ...edits } } : img
    ),
  })),

  applyProcessedImage: (id, newBlob, toolId, label) => set((state) => ({
    images: state.images.map((img) => {
      if (img.id === id) {
        const newUrl = URL.createObjectURL(newBlob);
        const historyItem = {
          id: Math.random().toString(36).substring(7),
          toolId,
          label,
          editsSnapshot: JSON.stringify(img.edits),
          workingUrlSnapshot: newUrl,
          timestamp: Date.now()
        };
        
        let newHistory = [...img.history, historyItem];
        
        // Strict memory capping at 15 history states per image
        if (newHistory.length > 15) {
           const dropped = newHistory.slice(0, newHistory.length - 15);
           dropped.forEach(h => {
              if (h.workingUrlSnapshot !== img.originalUrl) {
                 URL.revokeObjectURL(h.workingUrlSnapshot);
              }
           });
           newHistory = newHistory.slice(-15);
        }

        return { 
          ...img, 
          workingUrl: newUrl,
          history: newHistory 
        };
      }
      return img;
    })
  })),

  revertToHistory: (imageId, historyId) => set((state) => ({
    images: state.images.map((img) => {
      if (img.id === imageId) {
        const targetIndex = img.history.findIndex(h => h.id === historyId);
        const historyItem = img.history[targetIndex];
        
        if (historyItem) {
          const removedHistory = img.history.slice(targetIndex + 1);
          // Sweep and physically revoke orphaned objects
          removedHistory.forEach(h => {
             if (h.workingUrlSnapshot !== img.originalUrl) {
                URL.revokeObjectURL(h.workingUrlSnapshot);
             }
          });
          
          const newHistory = img.history.slice(0, targetIndex + 1);
          return { 
            ...img, 
            edits: JSON.parse(historyItem.editsSnapshot),
            workingUrl: historyItem.workingUrlSnapshot,
            history: newHistory
          };
        }
      }
      return img;
    })
  })),
}));
