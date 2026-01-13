'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface TextInputProps {
  placeholder?: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
}

export function TextInput({
  placeholder = '답변을 입력하세요...',
  onSubmit,
  disabled = false,
  multiline = false,
}: TextInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[52px] resize-none rounded-2xl border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-300 focus:ring-blue-200"
        rows={multiline ? 3 : 1}
      />
      <Button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="h-[52px] w-[52px] flex-shrink-0 rounded-2xl bg-blue-500 hover:bg-blue-600"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
