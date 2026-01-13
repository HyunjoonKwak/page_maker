'use client';

import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/store/templateStore';
import { useTemplates } from '@/hooks/useTemplates';
import { CategoryFilter } from './CategoryFilter';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { Loader2, LayoutTemplate } from 'lucide-react';

export function TemplateGallery() {
  const router = useRouter();
  const {
    selectedCategory,
    selectedTemplate,
    isPreviewOpen,
    setCategory,
    openPreview,
    closePreview,
  } = useTemplateStore();

  const { data: templates, isLoading, error } = useTemplates(selectedCategory);

  const handleSelect = (templateId: number) => {
    router.push(`/create?templateId=${templateId}`);
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">템플릿 갤러리</h1>
        <p className="text-gray-600">
          원하는 템플릿을 선택하고 시작하세요
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex justify-center">
        <CategoryFilter selected={selectedCategory} onChange={setCategory} />
      </div>

      {/* 템플릿 그리드 */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="flex min-h-[300px] items-center justify-center text-gray-500">
          템플릿을 불러오는 데 실패했습니다.
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => openPreview(template)}
              onSelect={() => handleSelect(template.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <LayoutTemplate className="mb-4 h-16 w-16 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">
            아직 템플릿이 없습니다
          </p>
          <p className="text-gray-500">
            곧 다양한 템플릿이 추가될 예정이에요
          </p>
        </div>
      )}

      {/* 미리보기 다이얼로그 */}
      <TemplatePreviewDialog
        template={selectedTemplate}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </div>
  );
}
