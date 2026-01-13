'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/lib/api/types';
import { Bot, User } from 'lucide-react';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          {/* 아바타 */}
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
              message.role === 'assistant'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {message.role === 'assistant' ? (
              <Bot className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>

          {/* 메시지 버블 */}
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'assistant'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-500 text-white'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
