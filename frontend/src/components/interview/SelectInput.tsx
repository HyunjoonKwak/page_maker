'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface SelectInputProps {
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  multiSelect?: boolean;
  selectedValues?: string[];
  onMultiSelect?: (values: string[]) => void;
}

export function SelectInput({
  options,
  onSelect,
  disabled = false,
  multiSelect = false,
  selectedValues = [],
  onMultiSelect,
}: SelectInputProps) {
  const handleClick = (option: string) => {
    if (disabled) return;

    if (multiSelect && onMultiSelect) {
      const isSelected = selectedValues.includes(option);
      const newValues = isSelected
        ? selectedValues.filter((v) => v !== option)
        : [...selectedValues, option];
      onMultiSelect(newValues);
    } else {
      onSelect(option);
    }
  };

  const handleConfirm = () => {
    if (multiSelect && onMultiSelect && selectedValues.length > 0) {
      onSelect(selectedValues.join(', '));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <Button
              key={option}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => handleClick(option)}
              disabled={disabled}
              className={`rounded-full px-5 py-2 text-sm transition-all ${
                isSelected
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {isSelected && <Check className="mr-1.5 h-4 w-4" />}
              {option}
            </Button>
          );
        })}
      </div>

      {multiSelect && selectedValues.length > 0 && (
        <Button
          onClick={handleConfirm}
          className="w-full rounded-full bg-blue-500 hover:bg-blue-600"
        >
          선택 완료 ({selectedValues.length}개)
        </Button>
      )}
    </div>
  );
}
