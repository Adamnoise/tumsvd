import React from 'react';
import { cn } from '@/lib/utils';
import { AnchorPoint } from '@/types/layers';

interface AnchorGridProps {
  value: AnchorPoint;
  onChange: (anchor: AnchorPoint) => void;
}

const ANCHOR_POSITIONS: { anchor: AnchorPoint; row: number; col: number }[] = [
  { anchor: 'top-left', row: 0, col: 0 },
  { anchor: 'top-center', row: 0, col: 1 },
  { anchor: 'top-right', row: 0, col: 2 },
  { anchor: 'center-left', row: 1, col: 0 },
  { anchor: 'center', row: 1, col: 1 },
  { anchor: 'center-right', row: 1, col: 2 },
  { anchor: 'bottom-left', row: 2, col: 0 },
  { anchor: 'bottom-center', row: 2, col: 1 },
  { anchor: 'bottom-right', row: 2, col: 2 },
];

const ANCHOR_LABELS: Record<AnchorPoint, string> = {
  'top-left': 'Top Left',
  'top-center': 'Top Center',
  'top-right': 'Top Right',
  'center-left': 'Center Left',
  'center': 'Center',
  'center-right': 'Center Right',
  'bottom-left': 'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
};

export const AnchorGrid: React.FC<AnchorGridProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-zinc-500 dark:text-zinc-400">
        Anchor Point
      </label>
      <div 
        className="bg-zinc-100 dark:bg-zinc-900/50 p-1.5 rounded-lg w-max border border-zinc-200 dark:border-zinc-800"
        role="radiogroup"
        aria-label="Anchor point selection"
      >
        <div className="grid grid-cols-3 gap-1">
          {ANCHOR_POSITIONS.map(({ anchor }) => {
            const isSelected = value === anchor;
            return (
              <button
                key={anchor}
                onClick={() => onChange(anchor)}
                role="radio"
                aria-checked={isSelected}
                aria-label={ANCHOR_LABELS[anchor]}
                className={cn(
                  'w-5 h-5 rounded-sm flex items-center justify-center transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
                  isSelected
                    ? 'bg-white dark:bg-zinc-100 shadow-sm'
                    : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                )}
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    isSelected
                      ? 'bg-indigo-500'
                      : 'bg-zinc-400 dark:bg-zinc-500'
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
