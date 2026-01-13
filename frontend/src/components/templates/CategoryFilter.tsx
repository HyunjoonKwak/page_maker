'use client';

import { Button } from '@/components/ui/button';

const categories = [
  { value: null, label: '전체' },
  { value: 'fashion', label: '패션/의류' },
  { value: 'beauty', label: '뷰티/화장품' },
  { value: 'food', label: '식품' },
  { value: 'electronics', label: '전자기기' },
  { value: 'home', label: '생활용품' },
  { value: 'other', label: '기타' },
];

interface CategoryFilterProps {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.value ?? 'all'}
          variant={selected === category.value ? 'default' : 'outline'}
          onClick={() => onChange(category.value)}
          className={`rounded-full px-5 ${
            selected === category.value
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
