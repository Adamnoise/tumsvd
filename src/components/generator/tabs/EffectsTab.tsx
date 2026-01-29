import React, { forwardRef } from 'react';
import { Droplets, Paintbrush, Sparkles, Layers } from 'lucide-react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';
import { CustomSlider } from '../CustomSlider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface EffectsTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}

const EFFECT_PRESETS = [
  { 
    id: 'none',
    name: 'None', 
    settings: { blur: 0, backdropBlur: 0, borderEnabled: false, noiseEnabled: false } 
  },
  { 
    id: 'glass',
    name: 'Glass', 
    settings: { 
      blur: 0, 
      backdropBlur: 12, 
      borderEnabled: true, 
      strokeWidth: 1, 
      strokeColor: '#FFFFFF', 
      strokeOpacity: 20, 
      strokePosition: 'inside' as const,
      noiseEnabled: false 
    } 
  },
  { 
    id: 'soft',
    name: 'Soft', 
    settings: { blur: 5, backdropBlur: 0, borderEnabled: false, noiseEnabled: false } 
  },
  { 
    id: 'textured',
    name: 'Textured', 
    settings: { blur: 0, backdropBlur: 0, borderEnabled: false, noiseEnabled: true, noiseIntensity: 40 } 
  },
];

export const EffectsTab = forwardRef<HTMLDivElement, EffectsTabProps>(({ state, updateState }, ref) => {
  // Blur value validation
  const handleBlurChange = (val: number) => {
    updateState({ blur: Math.max(0, Math.min(50, val)) });
  };

  const handleBackdropBlurChange = (val: number) => {
    updateState({ backdropBlur: Math.max(0, Math.min(30, val)) });
  };

  return (
    <div ref={ref} className="space-y-6 animate-fade-in">
      {/* Quick Effect Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Effects</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {EFFECT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => updateState(preset.settings)}
              className={cn(
                "px-3 py-2.5 text-xs font-medium rounded-lg transition-all",
                "border border-border/50 hover:border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              aria-label={`Apply ${preset.name} effect preset`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Blur Effects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blur Effects</p>
        </div>
        
        <div className="space-y-4 p-3 bg-muted/20 rounded-lg border border-border/50">
          <div className="space-y-1">
            <CustomSlider
              label="Blur"
              value={state.blur || 0}
              min={0}
              max={50}
              step={1}
              onChange={handleBlurChange}
              unit="px"
            />
            <p className="text-[10px] text-muted-foreground px-1">
              Apply gaussian blur to the shape
            </p>
          </div>

          <div className="space-y-1">
            <CustomSlider
              label="Backdrop Blur"
              value={state.backdropBlur}
              min={0}
              max={30}
              step={1}
              onChange={handleBackdropBlurChange}
              unit="px"
            />
            <p className="text-[10px] text-muted-foreground px-1">
              Blur background (glassmorphism)
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Border/Stroke Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">Stroke</p>
              <p className="text-[10px] text-muted-foreground">Add border outline</p>
            </div>
          </div>
          <Switch
            checked={state.borderEnabled}
            onCheckedChange={(checked) => updateState({ borderEnabled: checked })}
            aria-label={state.borderEnabled ? "Disable stroke" : "Enable stroke"}
          />
        </div>

        {state.borderEnabled && (
          <div className="space-y-4 p-3 bg-muted/20 rounded-lg border border-border/50 animate-fade-in">
            {/* Stroke Color */}
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Stroke Color
              </label>
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <div className="relative w-8 h-8 rounded-md border border-border overflow-hidden">
                  <input
                    type="color"
                    value={state.strokeColor || '#000000'}
                    onChange={(e) => updateState({ strokeColor: e.target.value })}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10"
                    aria-label="Stroke color picker"
                  />
                  <div className="w-full h-full" style={{ backgroundColor: state.strokeColor || '#000000' }} />
                </div>
                <input
                  type="text"
                  value={(state.strokeColor || '#000000').toUpperCase()}
                  onChange={(e) => updateState({ strokeColor: e.target.value })}
                  className="flex-1 h-8 px-2 bg-background border border-border rounded-md text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={7}
                  placeholder="#000000"
                  aria-label="Stroke hex color code"
                />
              </div>
            </div>

            <CustomSlider
              label="Stroke Width"
              value={state.strokeWidth}
              min={0}
              max={20}
              step={1}
              onChange={(val) => updateState({ strokeWidth: val })}
              unit="px"
            />

            {/* Position */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Position</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Stroke position">
                {(['inside', 'center', 'outside'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateState({ strokePosition: pos })}
                    className={cn(
                      "px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      state.strokePosition === pos
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-pressed={state.strokePosition === pos}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Style</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Stroke style">
                {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateState({ strokeStyle: style })}
                    className={cn(
                      "px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      state.strokeStyle === style
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-pressed={state.strokeStyle === style}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <CustomSlider
              label="Stroke Opacity"
              value={state.strokeOpacity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => updateState({ strokeOpacity: val })}
              unit="%"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Noise Overlay */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">Noise Overlay</p>
              <p className="text-[10px] text-muted-foreground">Add texture grain</p>
            </div>
          </div>
          <Switch
            checked={state.noiseEnabled}
            onCheckedChange={(checked) => updateState({ noiseEnabled: checked })}
            aria-label={state.noiseEnabled ? "Disable noise overlay" : "Enable noise overlay"}
          />
        </div>

        {state.noiseEnabled && (
          <div className="p-3 bg-muted/20 rounded-lg border border-border/50 animate-fade-in">
            <CustomSlider
              label="Noise Intensity"
              value={state.noiseIntensity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => updateState({ noiseIntensity: val })}
              unit="%"
            />
          </div>
        )}
      </div>
    </div>
  );
});

EffectsTab.displayName = 'EffectsTab';
