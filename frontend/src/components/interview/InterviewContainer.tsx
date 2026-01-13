'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProgressBar } from './ProgressBar';
import { ChatHistory } from './ChatHistory';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { ImageUpload } from './ImageUpload';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import type { ChatMessage, QuestionResponse } from '@/lib/api/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function InterviewContainer() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'in_progress' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const totalSteps = 8;

  // 메시지 추가
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
    }]);
  }, []);

  // 다음 질문 가져오기
  const fetchNextQuestion = useCallback(async (sid: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/interview/sessions/${sid}/next-question`);
      const data: QuestionResponse = await res.json();

      if (data.input_type === 'complete') {
        setStatus('completed');
        addMessage({
          role: 'assistant',
          content: '모든 질문이 완료되었습니다! 이제 상세페이지를 생성할 수 있습니다.',
        });
        return;
      }

      setCurrentQuestion(data);
      addMessage({
        role: 'assistant',
        content: data.question,
        fieldName: data.field_name,
        inputType: data.input_type,
        options: data.options,
      });
    } catch (error) {
      console.error('질문 로딩 실패:', error);
      toast.error('질문을 불러오는데 실패했습니다.');
    }
  }, [addMessage]);

  // 세션 생성 및 첫 질문 로드
  useEffect(() => {
    if (status !== 'idle') return;

    const initSession = async () => {
      setStatus('loading');
      try {
        const res = await fetch(`${API_BASE}/api/interview/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        setSessionId(data.id);
        setStatus('in_progress');
        await fetchNextQuestion(data.id);
      } catch (error) {
        console.error('세션 생성 실패:', error);
        toast.error('세션 생성에 실패했습니다.');
        setStatus('error');
      }
    };

    initSession();
  }, [status, fetchNextQuestion]);

  // 답변 제출
  const handleAnswer = async (value: string | string[] | File[]) => {
    if (!sessionId || !currentQuestion) return;

    let processedValue = value;
    let displayValue = '';

    if (value === 'skip') {
      processedValue = '';
      displayValue = '건너뛰기';
    } else if (Array.isArray(value) && value[0] instanceof File) {
      const fileNames = (value as File[]).map((f) => f.name);
      processedValue = fileNames.join(', ');
      displayValue = processedValue as string;
      toast.info('이미지가 선택되었습니다.');
    } else {
      displayValue = Array.isArray(processedValue) ? processedValue.join(', ') : String(processedValue);
    }

    // 사용자 메시지 추가
    addMessage({
      role: 'user',
      content: displayValue,
    });

    setProgress(prev => prev + 1);
    setCurrentQuestion(null);
    setMultiSelectValues([]);
    setIsLoading(true);

    try {
      await fetch(`${API_BASE}/api/interview/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_name: currentQuestion.field_name,
          value: processedValue,
        }),
      });
      await fetchNextQuestion(sessionId);
    } catch (error) {
      console.error('답변 제출 실패:', error);
      toast.error('답변 제출에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 상세페이지 생성으로 이동
  const handleGenerate = () => {
    if (sessionId) {
      router.push(`/create/${sessionId}/result`);
    }
  };

  // 다시 시작
  const handleReset = () => {
    setSessionId(null);
    setMessages([]);
    setCurrentQuestion(null);
    setStatus('idle');
    setProgress(0);
  };

  // 로딩 중
  if (status === 'loading') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-500" />
          <p className="text-gray-600">AI를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* 헤더 */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">상세페이지 만들기</h1>
        <p className="text-gray-600">AI가 질문을 드릴게요. 편하게 답변해주세요.</p>
      </div>

      {/* 진행률 */}
      <div className="mb-8">
        <ProgressBar current={progress} total={totalSteps} />
      </div>

      {/* 채팅 영역 */}
      <div className="mb-6 rounded-3xl bg-gray-50 p-6">
        <div className="max-h-[400px] overflow-y-auto">
          <ChatHistory messages={messages} />
        </div>

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI가 생각하고 있어요...</span>
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      {status === 'in_progress' && currentQuestion && (
        <div className="space-y-4">
          {currentQuestion.input_type === 'text' && (
            <TextInput
              onSubmit={handleAnswer}
              disabled={isLoading}
              placeholder="답변을 입력하세요..."
            />
          )}

          {currentQuestion.input_type === 'select' && currentQuestion.options && (
            <SelectInput
              options={currentQuestion.options}
              onSelect={handleAnswer}
              disabled={isLoading}
            />
          )}

          {currentQuestion.input_type === 'multiselect' && currentQuestion.options && (
            <SelectInput
              options={currentQuestion.options}
              onSelect={handleAnswer}
              disabled={isLoading}
              multiSelect
              selectedValues={multiSelectValues}
              onMultiSelect={setMultiSelectValues}
            />
          )}

          {currentQuestion.input_type === 'image_upload' && (
            <ImageUpload onUpload={handleAnswer} disabled={isLoading} />
          )}
        </div>
      )}

      {/* 완료 상태 */}
      {status === 'completed' && (
        <div className="space-y-4">
          <Button
            onClick={handleGenerate}
            className="w-full h-14 rounded-full bg-blue-500 text-lg font-semibold hover:bg-blue-600"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            상세페이지 생성하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full rounded-full">
            처음부터 다시 하기
          </Button>
        </div>
      )}
    </div>
  );
}
