'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

interface PreviewPanelProps {
  htmlContent: string;
}

export function PreviewPanel({ htmlContent }: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="flex flex-col h-full">
      {/* 뷰포트 전환 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">미리보기</h3>
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
            <Monitor className="h-4 w-4 mr-1.5" />
            데스크톱
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
            <Smartphone className="h-4 w-4 mr-1.5" />
            모바일
          </Button>
        </div>
      </div>

      {/* 미리보기 프레임 */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div
          className={`mx-auto h-full overflow-auto bg-gray-50 transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
          }`}
        >
          <iframe
            srcDoc={htmlContent}
            title="상세페이지 미리보기"
            className="h-full w-full border-0"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
