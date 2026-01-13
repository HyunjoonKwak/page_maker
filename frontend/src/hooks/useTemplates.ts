import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { TemplateResponse, TemplateCreate } from '@/lib/api/types';

// 템플릿 목록 조회
export function useTemplates(category?: string | null) {
  return useQuery({
    queryKey: ['templates', category],
    queryFn: () => {
      const url = category
        ? `/api/templates?category=${category}`
        : '/api/templates';
      return apiClient.get<TemplateResponse[]>(url);
    },
  });
}

// 템플릿 상세 조회
export function useTemplate(templateId: number | null) {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: () =>
      apiClient.get<TemplateResponse & { html_template: string }>(
        `/api/templates/${templateId}`
      ),
    enabled: !!templateId,
  });
}

// 템플릿 생성
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TemplateCreate) =>
      apiClient.post<TemplateResponse>('/api/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// 템플릿 삭제
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: number) =>
      apiClient.delete<{ success: boolean }>(`/api/templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
