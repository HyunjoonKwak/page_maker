'use client';

import type { TemplateResponse } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  fashion: '패션/의류',
  beauty: '뷰티/화장품',
  food: '식품',
  electronics: '전자기기',
  home: '생활용품',
  other: '기타',
};

interface TemplateCardProps {
  template: TemplateResponse;
  onPreview: () => void;
  onSelect: () => void;
}

export function TemplateCard({
  template,
  onPreview,
  onSelect,
}: TemplateCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all hover:border-blue-200 hover:shadow-lg">
      {/* 썸네일 영역 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* 플레이스홀더 패턴 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-3 p-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-white/80 shadow-sm" />
            <div className="mx-auto h-3 w-24 rounded-full bg-white/60" />
            <div className="mx-auto h-2 w-20 rounded-full bg-white/40" />
          </div>
        </div>

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            onClick={onPreview}
            variant="secondary"
            size="sm"
            className="h-10 rounded-full bg-white px-4 text-gray-900 hover:bg-gray-100"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            미리보기
          </Button>
          <Button
            onClick={onSelect}
            size="sm"
            className="h-10 rounded-full bg-blue-500 px-4 hover:bg-blue-600"
          >
            <Check className="mr-1.5 h-4 w-4" />
            사용하기
          </Button>
        </div>

        {/* 기본 템플릿 뱃지 */}
        {template.is_default && (
          <Badge className="absolute left-3 top-3 rounded-full bg-blue-500 text-white">
            기본
          </Badge>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500">
          {categoryLabels[template.category] || template.category}
        </p>
        {template.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        )}
      </div>
    </div>
  );
}
