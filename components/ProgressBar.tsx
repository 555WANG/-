
import React from 'react';
import { EditableText } from './EditableText';

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  colorClass: string;
  suffix?: string;
  onCurrentSave?: (val: string) => void;
  onTargetSave?: (val: string) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  label, current, target, colorClass, suffix = '', 
  onCurrentSave, onTargetSave 
}) => {
  const percentage = Math.min(100, Math.max(0, (current / (target || 1)) * 100));
  
  return (
    <div className="flex flex-col gap-2 mb-2">
      <div className="flex justify-between text-[11px] text-slate-500 font-black">
        <span className="opacity-80 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-1 text-slate-700">
          {onCurrentSave ? (
            <EditableText value={current} type="number" onSave={onCurrentSave} className="font-black" />
          ) : (
            <span>{current}</span>
          )}
          <span className="opacity-30">/</span>
          {onTargetSave ? (
            <EditableText value={target} type="number" onSave={onTargetSave} className="font-black" />
          ) : (
            <span>{target}</span>
          )}
          <span className="ml-1 opacity-60">{suffix}</span>
          <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out shadow-sm ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
