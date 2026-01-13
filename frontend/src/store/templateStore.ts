import { create } from 'zustand';
import type { TemplateResponse } from '@/lib/api/types';

interface TemplateState {
  // 상태
  templates: TemplateResponse[];
  selectedCategory: string | null;
  selectedTemplate: TemplateResponse | null;
  isPreviewOpen: boolean;

  // 액션
  setTemplates: (templates: TemplateResponse[]) => void;
  setCategory: (category: string | null) => void;
  selectTemplate: (template: TemplateResponse | null) => void;
  openPreview: (template: TemplateResponse) => void;
  closePreview: () => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  selectedCategory: null,
  selectedTemplate: null,
  isPreviewOpen: false,

  setTemplates: (templates) => set({ templates }),
  setCategory: (category) => set({ selectedCategory: category }),
  selectTemplate: (template) => set({ selectedTemplate: template }),
  openPreview: (template) =>
    set({ selectedTemplate: template, isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false }),
}));
