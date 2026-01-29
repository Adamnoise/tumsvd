import React, { useState, useEffect, forwardRef } from 'react';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HexColorPickerProps {
  hue: number;
  chroma: number;
  lightness: number;
  onColorChange: (hue: number, chroma: number, lightness: number) => void;
  className?: string;
}

// Convert OKLCH to approximate Hex (simplified conversion)
function oklchToHex(h: number, c: number, l: number): string {
  // Simplified OKLCH to HSL approximation
  const hsl_h = h;
  const hsl_s = Math.min(100, c * 300);
  const hsl_l = l;
  
  return hslToHex(hsl_h, hsl_s, hsl_l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Convert Hex to OKLCH approximation
function hexToOklch(hex: string): { h: number; c: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  
  // Convert HSL to OKLCH approximation
  return {
    h: Math.round(h),
    c: Math.round(s * 0.4 * 100) / 100,
    l: Math.round(l * 100)
  };
}

// Validate hex color
function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export const HexColorPicker = forwardRef<HTMLDivElement, HexColorPickerProps>(({
  hue,
  chroma,
  lightness,
  onColorChange,
  className,
}, ref) => {
  const [hexValue, setHexValue] = useState(() => oklchToHex(hue, chroma, lightness));
  const [isValid, setIsValid] = useState(true);
  
  // Update hex when OKLCH values change externally
  useEffect(() => {
    setHexValue(oklchToHex(hue, chroma, lightness));
    setIsValid(true);
  }, [hue, chroma, lightness]);

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setHexValue(value);
    
    // Validate and convert
    if (isValidHex(value)) {
      const { h, c, l } = hexToOklch(value);
      onColorChange(h, c, l);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setHexValue(hex);
    setIsValid(true);
    const { h, c, l } = hexToOklch(hex);
    onColorChange(h, c, l);
  };

  return (
    <div 
      ref={ref}
      className={cn("space-y-2", className)}
    >
      <div className="flex items-center gap-2">
        <Palette className="w-3.5 h-3.5 text-muted-foreground" />
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Base Color
        </label>
      </div>
      
      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border/50">
        {/* Color swatch with picker */}
        <div className="relative">
          <input
            type="color"
            value={hexValue.length === 7 && isValid ? hexValue : '#000000'}
            onChange={handleColorPicker}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Color picker"
          />
          <div
            className={cn(
              "w-10 h-10 rounded-lg border-2 shadow-inner cursor-pointer transition-all",
              isValid 
                ? "border-border/50" 
                : "border-destructive"
            )}
            style={{ backgroundColor: isValid ? hexValue : '#ff0000' }}
          />
        </div>
        
        {/* Hex input */}
        <div className="flex-1 space-y-1">
          <input
            type="text"
            value={hexValue}
            onChange={handleHexInput}
            className={cn(
              "w-full h-9 px-3 text-sm font-mono bg-background border rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              "uppercase transition-colors",
              isValid 
                ? "border-border text-foreground" 
                : "border-destructive text-destructive"
            )}
            placeholder="#FF9F00"
            maxLength={7}
            aria-label="Hex color code"
            aria-invalid={!isValid}
          />
          {!isValid && (
            <p className="text-[10px] text-destructive animate-fade-in">
              Invalid hex format (e.g., #FF5733)
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

HexColorPicker.displayName = 'HexColorPicker';
