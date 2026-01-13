'use client';

import { useRouter } from 'next/navigation';
import type { TemplateResponse } from '@/lib/api/types';
import { useTemplate } from '@/hooks/useTemplates';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface TemplatePreviewDialogProps {
  template: TemplateResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatePreviewDialog({
  template,
  isOpen,
  onClose,
}: TemplatePreviewDialogProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const { data: templateDetail, isLoading } = useTemplate(
    isOpen && template ? template.id : null
  );

  const handleUseTemplate = () => {
    if (template) {
      // 템플릿 ID를 쿼리 파라미터로 전달
      router.push(`/create?templateId=${template.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{template?.name}</DialogTitle>
            <div className="flex items-center gap-2">
              {/* 뷰포트 전환 */}
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className={`h-8 px-3 ${
                    viewMode === 'desktop'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-transparent'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className={`h-8 px-3 ${
                    viewMode === 'mobile'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-transparent'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleUseTemplate}
                className="rounded-full bg-blue-500 px-5 hover:bg-blue-600"
              >
                <Check className="mr-1.5 h-4 w-4" />
                이 템플릿 사용하기
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 미리보기 영역 */}
        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : templateDetail?.html_template ? (
            <div
              className={`mx-auto h-full overflow-auto bg-white transition-all duration-300 ${
                viewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
              }`}
            >
              <iframe
                srcDoc={templateDetail.html_template}
                title="템플릿 미리보기"
                className="h-full w-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              미리보기를 불러올 수 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
