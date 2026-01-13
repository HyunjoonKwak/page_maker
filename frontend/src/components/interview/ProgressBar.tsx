'use client';

import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">진행률</span>
        <span className="text-gray-500">
          {current} / {total} 완료
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
