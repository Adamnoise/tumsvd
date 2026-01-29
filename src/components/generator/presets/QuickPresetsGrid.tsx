import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getSuperellipsePath } from '@/utils/math';

interface QuickPreset {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  exp: number;
  color: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'ios-icon',
    name: 'iOS Icon',
    description: 'Apple-style app icon',
    width: 180,
    height: 180,
    exp: 4.5,
    color: '#6366f1',
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Soft rounded rectangle',
    width: 200,
    height: 200,
    exp: 3,
    color: '#22c55e',
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Almost rectangular',
    width: 200,
    height: 200,
    exp: 8,
    color: '#f59e0b',
  },
  {
    id: 'pill',
    name: 'Pill',
    description: 'Capsule / pill shape',
    width: 280,
    height: 100,
    exp: 2,
    color: '#ec4899',
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Standard card ratio',
    width: 320,
    height: 400,
    exp: 4,
    color: '#8b5cf6',
  },
  {
    id: 'circle',
    name: 'Circle',
    description: 'Perfect ellipse',
    width: 200,
    height: 200,
    exp: 2,
    color: '#14b8a6',
  },
];

interface PresetCardProps {
  preset: QuickPreset;
  isSelected?: boolean;
  onSelect: (preset: QuickPreset) => void;
}

const PresetCard: React.FC<PresetCardProps> = ({ preset, isSelected, onSelect }) => {
  // Generate mini SVG path for preview
  const miniPath = useMemo(() => {
    const scale = 40 / Math.max(preset.width, preset.height);
    const w = preset.width * scale;
    const h = preset.height * scale;
    return getSuperellipsePath(w, h, preset.exp);
  }, [preset.width, preset.height, preset.exp]);

  const viewBoxSize = 50;
  const offsetX = (viewBoxSize - (40 * preset.width / Math.max(preset.width, preset.height))) / 2;
  const offsetY = (viewBoxSize - (40 * preset.height / Math.max(preset.width, preset.height))) / 2;

  return (
    <button
      onClick={() => onSelect(preset)}
      className={cn(
        'group relative p-3 rounded-xl border transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500 shadow-md'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      )}
      aria-label={`Select ${preset.name} preset`}
      aria-pressed={isSelected}
    >
      {/* Preview */}
      <div className="flex items-center justify-center h-14 mb-2">
        <svg 
          width="50" 
          height="50" 
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="drop-shadow-md transition-transform group-hover:scale-110"
        >
          <g transform={`translate(${offsetX}, ${offsetY})`}>
            <path d={miniPath} fill={preset.color} />
          </g>
        </svg>
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-xs font-medium text-zinc-900 dark:text-white">
          {preset.name}
        </p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          {preset.description}
        </p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
      )}
    </button>
  );
};

interface QuickPresetsGridProps {
  onSelectPreset: (preset: {
    width: number;
    height: number;
    exp: number;
    solidColor: string;
  }) => void;
  currentExp?: number;
}

export const QuickPresetsGrid: React.FC<QuickPresetsGridProps> = ({
  onSelectPreset,
  currentExp,
}) => {
  const handleSelect = (preset: QuickPreset) => {
    onSelectPreset({
      width: preset.width,
      height: preset.height,
      exp: preset.exp,
      solidColor: preset.color,
    });
  };

  // Find matching preset based on exp value
  const selectedPresetId = useMemo(() => {
    if (!currentExp) return null;
    const match = QUICK_PRESETS.find(p => Math.abs(p.exp - currentExp) < 0.1);
    return match?.id || null;
  }, [currentExp]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Quick Presets
        </h3>
        <span className="text-[10px] text-zinc-400">
          Click to apply
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {QUICK_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isSelected={selectedPresetId === preset.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
};
