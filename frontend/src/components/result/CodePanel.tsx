'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check, Code2 } from 'lucide-react';

interface CodePanelProps {
  htmlContent: string;
}

export function CodePanel({ htmlContent }: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      toast.success('코드가 클립보드에 복사되었습니다!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('복사에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">HTML 코드</h3>
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="h-8 rounded-full"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1.5 text-green-500" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1.5" />
              코드 복사
            </>
          )}
        </Button>
      </div>

      {/* 코드 영역 */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-900">
        <pre className="h-full overflow-auto p-4">
          <code className="text-sm text-gray-300 whitespace-pre-wrap break-all">
            {htmlContent}
          </code>
        </pre>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 rounded-xl bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Figma로 가져오기:</strong> 복사한 코드를 Figma에서{' '}
          <span className="font-medium">html.to.design</span> 플러그인을 사용해
          붙여넣으세요.
        </p>
      </div>
    </div>
  );
}
