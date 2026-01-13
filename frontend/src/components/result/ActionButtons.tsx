'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, RefreshCw, Copy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ActionButtonsProps {
  htmlContent: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function ActionButtons({
  htmlContent,
  onRegenerate,
  isRegenerating = false,
}: ActionButtonsProps) {
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      toast.success('코드가 클립보드에 복사되었습니다!');
    } catch (error) {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'detail-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML 파일이 다운로드되었습니다!');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 메인 액션 */}
      <Button
        onClick={handleCopyCode}
        className="h-12 rounded-full bg-blue-500 px-6 hover:bg-blue-600"
      >
        <Copy className="h-4 w-4 mr-2" />
        코드 복사
      </Button>

      <Button
        onClick={handleDownloadHtml}
        variant="outline"
        className="h-12 rounded-full px-6"
      >
        <Download className="h-4 w-4 mr-2" />
        HTML 다운로드
      </Button>

      {/* 보조 액션 */}
      {onRegenerate && (
        <Button
          onClick={onRegenerate}
          variant="outline"
          disabled={isRegenerating}
          className="h-12 rounded-full px-6"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`}
          />
          {isRegenerating ? '생성 중...' : '다시 생성'}
        </Button>
      )}

      {/* 돌아가기 */}
      <Link href="/create">
        <Button variant="ghost" className="h-12 rounded-full px-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          새로 만들기
        </Button>
      </Link>
    </div>
  );
}
