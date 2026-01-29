import React, { forwardRef } from 'react';
import { Shuffle, Sun, Moon, Sparkles, Lightbulb, Move, Settings2 } from 'lucide-react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';
import { CustomSlider } from '../CustomSlider';
import { HexColorPicker } from '../HexColorPicker';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

type GlowAnimationType = 'none' | 'pulse' | 'breathe' | 'rotate' | 'wave' | 'float';

const ANIMATION_OPTIONS: { id: GlowAnimationType; label: string; description: string }[] = [
  { id: 'none', label: 'None', description: 'Static glow' },
  { id: 'pulse', label: 'Pulse', description: 'Subtle pulsing' },
  { id: 'breathe', label: 'Breathe', description: 'Soft breathing' },
  { id: 'rotate', label: 'Rotate', description: 'Rotating glow' },
  { id: 'wave', label: 'Wave', description: 'Gentle wave' },
  { id: 'float', label: 'Float', description: 'Floating motion' },
];

interface GlowTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  onRandomize?: () => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export const GlowTab = forwardRef<HTMLDivElement, GlowTabProps>(({ 
  state, 
  updateState, 
  onRandomize, 
  theme = 'dark', 
  onThemeChange 
}, ref) => {
  const handleHexColorChange = (hue: number, chroma: number, lightness: number) => {
    updateState({ hue, chroma, lightness });
  };

  return (
    <div ref={ref} className="space-y-6 animate-fade-in">
      {/* Main Toggle + Theme Selector */}
      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Glow Effect</h2>
            <p className="text-[10px] text-muted-foreground">4-layer progressive blur</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          {onThemeChange && (
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg" role="group" aria-label="Theme selection">
              <button
                onClick={() => onThemeChange('light')}
                className={cn(
                  "p-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/30",
                  theme === 'light'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Light mode"
                aria-label="Switch to light theme"
                aria-pressed={theme === 'light'}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={cn(
                  "p-1.5 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/30",
                  theme === 'dark'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Dark mode"
                aria-label="Switch to dark theme"
                aria-pressed={theme === 'dark'}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
          
          <Switch
            checked={state.enabled}
            onCheckedChange={(checked) => updateState({ enabled: checked })}
            aria-label="Toggle glow effect"
          />
        </div>
      </div>

      {/* Hex Color Picker */}
      <HexColorPicker
        hue={state.hue}
        chroma={state.chroma}
        lightness={state.lightness}
        onColorChange={handleHexColorChange}
      />

      {/* OKLCH Sliders */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <label htmlFor="hue-slider">Hue</label>
            <span className="font-medium text-foreground tabular-nums">{state.hue}°</span>
          </div>
          <div className="relative h-5 rounded-lg overflow-hidden border border-border/30">
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)' }}
              aria-hidden="true"
            />
            <input
              id="hue-slider"
              type="range"
              min={0}
              max={360}
              value={state.hue}
              onChange={(e) => updateState({ hue: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              aria-label="Hue slider"
            />
            <div
              className="absolute top-0 h-full w-1 bg-white border border-border shadow-lg pointer-events-none rounded"
              style={{ left: `calc(${(state.hue / 360) * 100}% - 2px)` }}
              aria-hidden="true"
            />
          </div>
        </div>

        <CustomSlider
          label="Chroma"
          value={state.chroma}
          min={0}
          max={0.4}
          step={0.01}
          onChange={(val) => updateState({ chroma: val })}
        />

        <CustomSlider
          label="Lightness"
          value={state.lightness}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ lightness: val })}
          unit="%"
        />
      </div>

      <div className="h-px bg-border" />

      {/* Shape Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Glow Shape</p>
        </div>
        
        <CustomSlider
          label="Mask Size"
          value={Math.round(state.glowMaskSize * 100)}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ glowMaskSize: val / 100 })}
          unit="%"
        />

        <CustomSlider
          label="Scale"
          value={state.glowScale}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(val) => updateState({ glowScale: val })}
          unit="x"
        />
      </div>

      <div className="h-px bg-border" />

      {/* Position */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Position</p>
        </div>
        
        <CustomSlider
          label="Offset X"
          value={state.glowPositionX}
          min={-1200}
          max={400}
          step={10}
          onChange={(val) => updateState({ glowPositionX: val })}
          unit="px"
        />
        <CustomSlider
          label="Offset Y"
          value={state.glowPositionY}
          min={-1800}
          max={400}
          step={10}
          onChange={(val) => updateState({ glowPositionY: val })}
          unit="px"
        />
      </div>

      <div className="h-px bg-border" />

      {/* Advanced Glow */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Intensity</p>
        </div>
        
        <CustomSlider
          label="Glow Opacity"
          value={state.glowOpacity}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ glowOpacity: val })}
          unit="%"
        />

        <CustomSlider
          label="Glow Blur"
          value={state.glowBlur}
          min={0}
          max={300}
          step={1}
          onChange={(val) => updateState({ glowBlur: val })}
          unit="px"
        />

        <CustomSlider
          label="Glow Spread"
          value={state.glowSpread}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ glowSpread: val })}
          unit="%"
        />
      </div>

      <div className="h-px bg-border" />

      {/* Animation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Animation</p>
        </div>

        {/* Animation Type Selector */}
        <div className="grid grid-cols-3 gap-1.5">
          {ANIMATION_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => updateState({ glowAnimation: option.id })}
              className={cn(
                'px-2 py-2.5 rounded-lg text-[10px] font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary/30',
                state.glowAnimation === option.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={option.description}
              aria-pressed={state.glowAnimation === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Animation Controls (only show when animation is active) */}
        {state.glowAnimation !== 'none' && (
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg border border-border/50 animate-fade-in">
            <CustomSlider
              label="Speed"
              value={state.glowAnimationSpeed}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(val) => updateState({ glowAnimationSpeed: val })}
              unit="x"
            />
            <CustomSlider
              label="Intensity"
              value={state.glowAnimationIntensity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => updateState({ glowAnimationIntensity: val })}
              unit="%"
            />
          </div>
        )}
      </div>

      {/* Random Generator */}
      {onRandomize && (
        <button
          onClick={onRandomize}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
            "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium",
            "hover:from-primary/90 hover:to-primary/70",
            "transition-all shadow-lg active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          )}
          aria-label="Generate random spotlight colors"
        >
          <Shuffle className="w-4 h-4" aria-hidden="true" />
          Random Spotlight
        </button>
      )}
    </div>
  );
});

GlowTab.displayName = 'GlowTab';
