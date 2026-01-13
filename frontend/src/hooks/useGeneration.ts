import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { GenerateRequest, GenerateResponse, OutputFormat } from '@/lib/api/types';

// 상세페이지 생성
export function useGenerateDetailPage() {
  return useMutation({
    mutationFn: ({
      sessionId,
      templateId,
      outputFormat = 'html',
    }: {
      sessionId: number;
      templateId?: number;
      outputFormat?: OutputFormat;
    }) =>
      apiClient.post<GenerateResponse>('/api/generate/detail-page', {
        session_id: sessionId,
        template_id: templateId,
        output_format: outputFormat,
      } as GenerateRequest),
  });
}

// 배경 이미지 생성
export function useGenerateBackground() {
  return useMutation({
    mutationFn: (params: {
      category: string;
      mood: string;
      color_scheme?: string;
      custom_prompt?: string;
    }) => apiClient.post<{ image_url: string }>('/api/generate/background-image', params),
  });
}
