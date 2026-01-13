import { create } from 'zustand';
import type { ChatMessage, QuestionResponse } from '@/lib/api/types';

interface InterviewState {
  // 상태
  sessionId: number | null;
  messages: ChatMessage[];
  currentQuestion: QuestionResponse | null;
  context: Record<string, unknown>;
  status: 'idle' | 'loading' | 'in_progress' | 'completed' | 'error';
  progress: number;
  totalSteps: number;
  error: string | null;

  // 액션
  setSessionId: (id: number) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setCurrentQuestion: (question: QuestionResponse | null) => void;
  updateContext: (key: string, value: unknown) => void;
  setStatus: (status: InterviewState['status']) => void;
  setProgress: (current: number, total?: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  messages: [],
  currentQuestion: null,
  context: {},
  status: 'idle' as const,
  progress: 0,
  totalSteps: 8,
  error: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,

  setSessionId: (id) => set({ sessionId: id }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date(),
        },
      ],
    })),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  updateContext: (key, value) =>
    set((state) => ({
      context: { ...state.context, [key]: value },
    })),

  setStatus: (status) => set({ status }),

  setProgress: (current, total) =>
    set((state) => ({
      progress: current,
      totalSteps: total ?? state.totalSteps,
    })),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
