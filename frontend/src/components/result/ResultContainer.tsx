'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useGenerationStore } from '@/store/generationStore';
import { useGenerateDetailPage } from '@/hooks/useGeneration';
import { PreviewPanel } from './PreviewPanel';
import { CodePanel } from './CodePanel';
import { ActionButtons } from './ActionButtons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, Code2, Sparkles } from 'lucide-react';

interface ResultContainerProps {
  sessionId: number;
}

export function ResultContainer({ sessionId }: ResultContainerProps) {
  const { htmlContent, status, setHtmlContent, setStatus, setError } =
    useGenerationStore();

  const generateMutation = useGenerateDetailPage();

  // 초기 생성
  useEffect(() => {
    if (status === 'idle' && !htmlContent) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = () => {
    setStatus('generating');

    generateMutation.mutate(
      { sessionId, outputFormat: 'html' },
      {
        onSuccess: (data) => {
          if (data.html_content) {
            setHtmlContent(data.html_content);
            setStatus('completed');
            toast.success('상세페이지가 생성되었습니다!');
          } else {
            setError('HTML 콘텐츠가 비어있습니다.');
            setStatus('error');
          }
        },
        onError: (error) => {
          setError(error.message);
          setStatus('error');
          toast.error('생성에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  // 로딩 상태
  if (status === 'generating' || status === 'idle') {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-200 opacity-75" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-500">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            상세페이지를 생성하고 있어요
          </h2>
          <p className="text-gray-600">
            AI가 입력하신 정보를 바탕으로 멋진 상세페이지를 만들고 있습니다...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-blue-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>잠시만 기다려주세요</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (status === 'error') {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <span className="text-4xl">😢</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            생성에 실패했어요
          </h2>
          <p className="mb-6 text-gray-600">
            문제가 발생했습니다. 다시 시도해주세요.
          </p>
          <button
            onClick={handleGenerate}
            className="rounded-full bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  // 결과 표시
  if (!htmlContent) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
          <Sparkles className="h-4 w-4" />
          생성 완료
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          상세페이지가 완성되었어요!
        </h1>
        <p className="text-gray-600">
          미리보기를 확인하고 코드를 복사해서 사용하세요
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-center">
        <ActionButtons
          htmlContent={htmlContent}
          onRegenerate={handleGenerate}
          isRegenerating={generateMutation.isPending}
        />
      </div>

      {/* 탭 콘텐츠 */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mx-auto grid w-full max-w-xs grid-cols-2 rounded-full bg-gray-100 p-1">
          <TabsTrigger
            value="preview"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Code2 className="mr-2 h-4 w-4" />
            코드
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6">
          <div className="h-[600px] rounded-3xl bg-gray-50 p-6">
            <PreviewPanel htmlContent={htmlContent} />
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <div className="h-[600px] rounded-3xl bg-gray-50 p-6">
            <CodePanel htmlContent={htmlContent} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
