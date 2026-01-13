'use client';

import { use } from 'react';
import { ResultContainer } from '@/components/result/ResultContainer';

interface ResultPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ResultPage({ params }: ResultPageProps) {
  const { sessionId } = use(params);
  const sessionIdNum = parseInt(sessionId, 10);

  if (isNaN(sessionIdNum)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">잘못된 세션입니다</h1>
          <p className="mt-2 text-gray-600">유효하지 않은 세션 ID입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <ResultContainer sessionId={sessionIdNum} />
      </div>
    </div>
  );
}
