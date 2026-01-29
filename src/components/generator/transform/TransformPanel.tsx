import React, { useState, useCallback } from 'react';
import { Move, RotateCcw, Maximize2, Link, Unlink } from 'lucide-react';
import { AnchorGrid } from './AnchorGrid';
import { AnchorPoint, Transform } from '@/types/layers';
import { cn } from '@/lib/utils';

interface TransformPanelProps {
  transform: Transform;
  onChange: (updates: Partial<Transform>) => void;
  onReset?: () => void;
}

interface TransformInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const TransformInput: React.FC<TransformInputProps> = ({
  label,
  value,
  onChange,
  min = -9999,
  max = 9999,
  step = 1,
  unit = '',
}) => {
  const [localValue, setLocalValue] = useState(value.toString());

  React.useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    } else {
      setLocalValue(value.toString());
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-1.5 flex items-center gap-2 group focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
      <span className="text-[10px] text-zinc-400 font-medium min-w-[1.25rem]">
        {label}
      </span>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        min={min}
        max={max}
        step={step}
        className="w-full bg-transparent text-xs text-right text-zinc-800 dark:text-zinc-200 focus:outline-none font-mono"
        aria-label={`${label} value`}
      />
      {unit && (
        <span className="text-[10px] text-zinc-400">{unit}</span>
      )}
    </div>
  );
};

export const TransformPanel: React.FC<TransformPanelProps> = ({
  transform,
  onChange,
  onReset,
}) => {
  const [scaleLocked, setScaleLocked] = useState(true);

  const handleScaleXChange = useCallback((scaleX: number) => {
    if (scaleLocked) {
      onChange({ scaleX, scaleY: scaleX });
    } else {
      onChange({ scaleX });
    }
  }, [scaleLocked, onChange]);

  const handleScaleYChange = useCallback((scaleY: number) => {
    if (scaleLocked) {
      onChange({ scaleX: scaleY, scaleY });
    } else {
      onChange({ scaleY });
    }
  }, [scaleLocked, onChange]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Position Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Position
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TransformInput
            label="X"
            value={transform.x}
            onChange={(x) => onChange({ x })}
            unit="px"
          />
          <TransformInput
            label="Y"
            value={transform.y}
            onChange={(y) => onChange({ y })}
            unit="px"
          />
        </div>
      </div>

      {/* Rotation Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Rotation
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={transform.rotation}
              onChange={(e) => onChange({ rotation: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              aria-label="Rotation angle"
            />
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-2 py-1 w-16">
              <input
                type="number"
                min={0}
                max={360}
                value={transform.rotation}
                onChange={(e) => onChange({ rotation: Number(e.target.value) })}
                className="w-full bg-transparent text-xs text-right text-zinc-800 dark:text-zinc-200 focus:outline-none font-mono"
                aria-label="Rotation degrees"
              />
            </div>
            <span className="text-[10px] text-zinc-400">°</span>
          </div>
        </div>
      </div>

      {/* Scale Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Scale
            </h3>
          </div>
          <button
            onClick={() => setScaleLocked(!scaleLocked)}
            className={cn(
              'p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
              scaleLocked
                ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
            aria-label={scaleLocked ? 'Unlock scale axes' : 'Lock scale axes'}
            aria-pressed={scaleLocked}
          >
            {scaleLocked ? (
              <Link className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Unlink className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500">X</span>
            <div className="relative h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.01}
                value={transform.scaleX}
                onChange={(e) => handleScaleXChange(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                aria-label="Scale X"
              />
              <div
                className="absolute top-0 h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${((transform.scaleX - 0.1) / 2.9) * 100}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="text-[10px] text-center text-zinc-500 font-mono">
              {transform.scaleX.toFixed(2)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500">Y</span>
            <div className="relative h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.01}
                value={transform.scaleY}
                onChange={(e) => handleScaleYChange(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                aria-label="Scale Y"
              />
              <div
                className="absolute top-0 h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${((transform.scaleY - 0.1) / 2.9) * 100}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="text-[10px] text-center text-zinc-500 font-mono">
              {transform.scaleY.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Anchor Point */}
      <AnchorGrid
        value={transform.anchor}
        onChange={(anchor) => onChange({ anchor })}
      />

      {/* Reset Button */}
      {onReset && (
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Reset transform to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Reset Transform
        </button>
      )}
    </div>
  );
};
