'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white px-6 py-24 lg:py-32">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-100 opacity-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* 배지 */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          <Sparkles className="h-4 w-4" />
          <span>AI 기반 상세페이지 자동 생성</span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 lg:text-6xl">
          몇 가지 질문에 답하면
          <br />
          <span className="text-blue-500">상세페이지가 완성됩니다</span>
        </h1>

        {/* 서브 타이틀 */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 lg:text-xl">
          AI가 당신의 상품을 이해하고, 구매를 유도하는 전문적인 상세페이지를
          자동으로 만들어 드립니다. Figma로 바로 가져갈 수 있어요.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/create">
            <Button
              size="lg"
              className="h-14 rounded-full bg-blue-500 px-8 text-lg font-semibold hover:bg-blue-600"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/templates">
            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-full px-8 text-lg font-semibold"
            >
              템플릿 둘러보기
            </Button>
          </Link>
        </div>

        {/* 신뢰 지표 */}
        <p className="mt-8 text-sm text-gray-500">
          가입 없이 바로 시작 가능 · 무료 · 1분 만에 완성
        </p>
      </div>
    </section>
  );
}
