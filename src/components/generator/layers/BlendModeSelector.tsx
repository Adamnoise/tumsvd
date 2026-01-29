import React, { memo } from 'react';
import { Blend } from 'lucide-react';
import { BlendMode, BLEND_MODES } from '@/types/layers';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BlendModeSelectorProps {
  value: BlendMode;
  onChange: (value: BlendMode) => void;
  disabled?: boolean;
}

// Group blend modes by category for better UX
const BLEND_MODE_GROUPS = {
  'Normal': ['normal'],
  'Darken': ['multiply', 'darken', 'color-burn'],
  'Lighten': ['screen', 'lighten', 'color-dodge'],
  'Contrast': ['overlay', 'hard-light', 'soft-light'],
  'Inversion': ['difference', 'exclusion'],
  'Component': ['hue', 'saturation', 'color', 'luminosity'],
};

export const BlendModeSelector = memo<BlendModeSelectorProps>(({
  value,
  onChange,
  disabled = false,
}) => {
  const currentMode = BLEND_MODES.find(m => m.value === value);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Blend className="w-3.5 h-3.5 text-muted-foreground" />
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Blend Mode
        </label>
      </div>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as BlendMode)}
        disabled={disabled}
      >
        <SelectTrigger 
          className={cn(
            "h-8 text-xs bg-muted/50 border-border",
            "focus:ring-2 focus:ring-primary/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <SelectValue placeholder="Select blend mode">
            {currentMode?.label || 'Normal'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border shadow-lg z-50 max-h-64">
          {Object.entries(BLEND_MODE_GROUPS).map(([groupName, modes]) => (
            <div key={groupName}>
              <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                {groupName}
              </div>
              {modes.map((modeValue) => {
                const mode = BLEND_MODES.find(m => m.value === modeValue);
                if (!mode) return null;
                return (
                  <SelectItem 
                    key={mode.value} 
                    value={mode.value}
                    className="text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "w-4 h-4 rounded border border-border flex items-center justify-center",
                          "bg-gradient-to-br from-primary/30 to-accent/30"
                        )}
                        style={{ mixBlendMode: mode.value as any }}
                      />
                      {mode.label}
                    </div>
                  </SelectItem>
                );
              })}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

BlendModeSelector.displayName = 'BlendModeSelector';
