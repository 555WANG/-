
import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string | number;
  onSave: (newValue: string) => void;
  className?: string;
  type?: 'text' | 'number' | 'date';
}

export const EditableText: React.FC<EditableTextProps> = ({ value, onSave, className, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== 'date') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    setCurrentValue(value?.toString() || "");
  }, [value]);

  const commit = () => {
    setIsEditing(false);
    // 只有当值真的改变时才调用 onSave
    if (currentValue !== value?.toString()) {
      onSave(currentValue);
    }
  };

  const handleBlur = () => {
    commit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commit();
    } else if (e.key === 'Escape') {
      setCurrentValue(value?.toString() || "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        className={`bg-blue-50 border border-blue-500 rounded px-1 outline-none text-slate-900 font-bold ${className}`}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-blue-100/50 hover:text-blue-700 rounded-md px-1 transition-all duration-200 border-b border-transparent hover:border-blue-200 ${className}`}
      title="双击进行修改"
    >
      {(value === 0 || value) ? value : (type === 'date' ? '未选择日期' : '点击输入')}
    </span>
  );
};
