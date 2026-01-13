import { create } from 'zustand';

interface GenerationState {
  // 상태
  generationId: number | null;
  htmlContent: string | null;
  imageUrl: string | null;
  status: 'idle' | 'generating' | 'completed' | 'error';
  error: string | null;

  // 액션
  setGenerationId: (id: number) => void;
  setHtmlContent: (content: string) => void;
  setImageUrl: (url: string) => void;
  setStatus: (status: GenerationState['status']) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  generationId: null,
  htmlContent: null,
  imageUrl: null,
  status: 'idle' as const,
  error: null,
};

export const useGenerationStore = create<GenerationState>((set) => ({
  ...initialState,

  setGenerationId: (id) => set({ generationId: id }),
  setHtmlContent: (content) => set({ htmlContent: content }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
