import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* 로고 */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">상세페이지 메이커</span>
          </div>

          {/* 설명 */}
          <p className="max-w-md text-sm text-gray-500">
            AI가 만드는 전문적인 상세페이지.
            몇 가지 질문에 답하면 네이버 스마트스토어에 바로 사용할 수 있는
            상세페이지가 완성됩니다.
          </p>

          {/* 저작권 */}
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} 상세페이지 메이커. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
