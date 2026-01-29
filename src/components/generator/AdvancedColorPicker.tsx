import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import { ChromePicker } from 'react-color';
import { Eye, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  onOklchChange?: (hue: number, chroma: number, lightness: number) => void;
  className?: string;
  label?: string;
}

/**
 * Convert RGB hex to OKLCH approximation
 * (Using simplified conversion - full OKLCH conversion would require more complex math)
 */
function hexToOklch(hex: string): { h: number; c: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Convert RGB to HSL first
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  // Convert HSL to OKLCH approximation
  // Note: This is a simplified conversion
  return {
    h: Math.round(h),
    c: Math.round(s * 0.4 * 100) / 100,
    l: Math.round(l * 100),
  };
}

/**
 * Parse color from various formats
 */
function parseColor(colorString: string): { hex: string; rgb: string } {
  // If it's already hex
  if (colorString.startsWith('#')) {
    return { hex: colorString, rgb: hexToRgb(colorString) };
  }

  // If it's rgb
  if (colorString.startsWith('rgb')) {
    return { hex: rgbToHex(colorString), rgb: colorString };
  }

  // Default to hex
  return { hex: colorString, rgb: hexToRgb(colorString) };
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  const [r, g, b] = match.slice(0, 3).map((x) => parseInt(x).toString(16).padStart(2, '0'));
  return `#${r}${g}${b}`.toUpperCase();
}

export const AdvancedColorPicker = forwardRef<HTMLDivElement, AdvancedColorPickerProps>(
  ({ color, onColorChange, onOklchChange, className, label = 'Color' }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayColor, setDisplayColor] = useState(color);

    useEffect(() => {
      setDisplayColor(color);
    }, [color]);

    const handleColorChange = useCallback(
      (newColor: any) => {
        const hex = newColor.hex || (newColor.rgb ? rgbToHex(newColor.rgb) : color);
        setDisplayColor(hex);
        onColorChange(hex);

        // Also notify OKLCH change if callback provided
        if (onOklchChange) {
          const { h, c, l } = hexToOklch(hex);
          onOklchChange(h, c, l);
        }
      },
      [color, onColorChange, onOklchChange]
    );

    const { hex } = parseColor(displayColor);

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Label */}
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </label>
        </div>

        {/* Color picker trigger and display */}
        <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border/50">
          {/* Color swatch */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-10 h-10 rounded-lg border-2 shadow-inner cursor-pointer transition-all hover:shadow-md',
              'border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30'
            )}
            style={{ backgroundColor: hex }}
            aria-label={`Open color picker (current color: ${hex})`}
            title={hex}
          />

          {/* Hex display and selector */}
          <div className="flex-1">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  'w-full h-9 px-3 text-sm font-mono bg-background border rounded-lg flex items-center justify-between',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30',
                  'uppercase transition-colors border-border text-foreground'
                )}
              >
                <span>{hex}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown color picker */}
        {isOpen && (
          <div className="relative z-50 p-3 bg-background border border-border rounded-lg shadow-lg animate-fade-in">
            <Chrome
              color={hex}
              onChange={handleColorChange}
              disableAlpha={true}
              width="100%"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    );
  }
);

AdvancedColorPicker.displayName = 'AdvancedColorPicker';
