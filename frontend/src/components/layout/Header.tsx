'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">상세페이지 메이커</span>
        </Link>

        {/* 네비게이션 */}
        {showNav && (
          <nav className="flex items-center gap-2">
            <Link href="/templates">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                템플릿
              </Button>
            </Link>
            <Link href="/create">
              <Button className="rounded-full bg-blue-500 px-5 hover:bg-blue-600">
                시작하기
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
