import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  SessionCreate,
  SessionResponse,
  QuestionResponse,
  AnswerRequest,
} from '@/lib/api/types';

// 세션 생성
export function useCreateSession() {
  return useMutation({
    mutationFn: (data?: SessionCreate) =>
      apiClient.post<SessionResponse>('/api/interview/sessions', data || {}),
  });
}

// 세션 조회
export function useSession(sessionId: number | null) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () =>
      apiClient.get<SessionResponse>(`/api/interview/sessions/${sessionId}`),
    enabled: !!sessionId,
  });
}

// 다음 질문 조회
export function useNextQuestion(sessionId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['nextQuestion', sessionId],
    queryFn: () =>
      apiClient.get<QuestionResponse>(
        `/api/interview/sessions/${sessionId}/next-question`
      ),
    enabled: !!sessionId && enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// 답변 제출
export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({
      sessionId,
      fieldName,
      value,
    }: {
      sessionId: number;
      fieldName: string;
      value: unknown;
    }) =>
      apiClient.post<{ success: boolean; field_name: string }>(
        `/api/interview/sessions/${sessionId}/answer`,
        {
          session_id: sessionId,
          field_name: fieldName,
          value,
        } as AnswerRequest
      ),
  });
}

// 참고 페이지 분석
export function useAnalyzeReference() {
  return useMutation({
    mutationFn: (url: string) =>
      apiClient.post<{
        layout_pattern: string;
        color_scheme: Record<string, string>;
        sections: string[];
        highlights: string[];
        tone_and_manner: string;
      }>('/api/analyze/reference', { url }),
  });
}
