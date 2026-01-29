import React, { memo, useCallback, useState } from 'react';
import { RotateCw, Link2, Link2Off, Move, Maximize2 } from 'lucide-react';
import { Transform, AnchorPoint } from '@/types/layers';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TransformControlsProps {
  transform: Transform;
  onChange: (updates: Partial<Transform>) => void;
  disabled?: boolean;
}

const ANCHOR_POINTS: AnchorPoint[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['center-left', 'center', 'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

export const TransformControls = memo<TransformControlsProps>(({
  transform,
  onChange,
  disabled = false,
}) => {
  const [linkScale, setLinkScale] = useState(true);

  const handleScaleXChange = useCallback((value: number) => {
    if (linkScale) {
      onChange({ scaleX: value, scaleY: value });
    } else {
      onChange({ scaleX: value });
    }
  }, [linkScale, onChange]);

  const handleScaleYChange = useCallback((value: number) => {
    if (linkScale) {
      onChange({ scaleX: value, scaleY: value });
    } else {
      onChange({ scaleY: value });
    }
  }, [linkScale, onChange]);

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ [axis]: numValue });
    }
  }, [onChange]);

  const handleRotationChange = useCallback((value: number) => {
    // Normalize rotation to 0-360
    const normalizedValue = ((value % 360) + 360) % 360;
    onChange({ rotation: normalizedValue });
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Move className="w-3.5 h-3.5 text-muted-foreground" />
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Transform
        </h4>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">X</span>
              <span className="text-[10px] text-muted-foreground/60">px</span>
            </div>
            <input
              type="number"
              value={transform.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              disabled={disabled}
              className={cn(
                "w-full h-8 text-xs bg-muted/50 border border-border rounded-md px-2.5 outline-none",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "transition-all duration-150",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-label="X position"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Y</span>
              <span className="text-[10px] text-muted-foreground/60">px</span>
            </div>
            <input
              type="number"
              value={transform.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              disabled={disabled}
              className={cn(
                "w-full h-8 text-xs bg-muted/50 border border-border rounded-md px-2.5 outline-none",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "transition-all duration-150",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Y position"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Rotation</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={Math.round(transform.rotation)}
              onChange={(e) => handleRotationChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              className={cn(
                "w-12 h-6 text-[10px] bg-muted/50 border border-border rounded px-1.5 text-center outline-none",
                "focus:ring-1 focus:ring-primary/30",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              min={0}
              max={360}
            />
            <span className="text-[10px] text-muted-foreground">°</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
          <Slider
            value={[transform.rotation]}
            onValueChange={([value]) => handleRotationChange(value)}
            min={0}
            max={360}
            step={1}
            disabled={disabled}
            className="flex-1"
          />
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3 text-muted-foreground/70" />
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Scale</label>
          </div>
          <button
            onClick={() => setLinkScale(!linkScale)}
            disabled={disabled}
            className={cn(
              "p-1.5 rounded-md transition-all duration-150",
              linkScale 
                ? "text-primary bg-primary/10 hover:bg-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={linkScale ? "Unlink scale axes" : "Link scale axes"}
            aria-pressed={linkScale}
          >
            {linkScale ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium">X</span>
              <span className="text-[10px] text-primary font-medium tabular-nums">
                {transform.scaleX.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[transform.scaleX]}
              onValueChange={([value]) => handleScaleXChange(value)}
              min={0.1}
              max={3}
              step={0.1}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium">Y</span>
              <span className="text-[10px] text-primary font-medium tabular-nums">
                {transform.scaleY.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[transform.scaleY]}
              onValueChange={([value]) => handleScaleYChange(value)}
              min={0.1}
              max={3}
              step={0.1}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Anchor Point Grid */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Anchor Point</label>
        <div className="flex justify-center">
          <div className="inline-grid grid-cols-3 gap-1.5 p-2 bg-muted/30 rounded-lg border border-border/50">
            {ANCHOR_POINTS.map((row) => (
              row.map((anchor) => (
                <button
                  key={anchor}
                  onClick={() => onChange({ anchor })}
                  disabled={disabled}
                  className={cn(
                    "w-6 h-6 rounded-md transition-all duration-150 flex items-center justify-center",
                    "border border-transparent",
                    transform.anchor === anchor
                      ? "bg-primary shadow-sm border-primary/50"
                      : "bg-muted/80 hover:bg-muted-foreground/20 hover:border-border",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  aria-label={`Set anchor to ${anchor.replace('-', ' ')}`}
                  aria-pressed={transform.anchor === anchor}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    transform.anchor === anchor 
                      ? "bg-primary-foreground" 
                      : "bg-muted-foreground/40"
                  )} />
                </button>
              ))
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TransformControls.displayName = 'TransformControls';
