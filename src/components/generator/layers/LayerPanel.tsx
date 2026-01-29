import React, { memo, useState, useCallback } from 'react';
import { Plus, Layers, Square, Image, Type, ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { Layer, LayerType, BlendMode, Transform } from '@/types/layers';
import { LayerItem } from './LayerItem';
import { BlendModeSelector } from './BlendModeSelector';
import { TransformControls } from './TransformControls';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayer: Layer | null;
  onSelectLayer: (layerId: string | null) => void;
  onAddLayer: (type: LayerType) => void;
  onRemoveLayer: (layerId: string) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onReorderLayers: (startIndex: number, endIndex: number) => void;
  onSetBlendMode: (layerId: string, blendMode: BlendMode) => void;
  onSetOpacity: (layerId: string, opacity: number) => void;
  onUpdateTransform: (layerId: string, transform: Partial<Transform>) => void;
}

const ADD_LAYER_OPTIONS: { type: LayerType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'shape', label: 'Shape Layer', icon: Square, description: 'Add a new superellipse shape' },
  { type: 'image', label: 'Image Layer', icon: Image, description: 'Add an image layer' },
  { type: 'text', label: 'Text Layer', icon: Type, description: 'Add a text layer' },
];

export const LayerPanel = memo<LayerPanelProps>(({
  layers,
  selectedLayerId,
  selectedLayer,
  onSelectLayer,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onToggleLock,
  onReorderLayers,
  onSetBlendMode,
  onSetOpacity,
  onUpdateTransform,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [transformOpen, setTransformOpen] = useState(true);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderLayers(draggedIndex, index);
      setDraggedIndex(index);
    }
  }, [draggedIndex, onReorderLayers]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleRename = useCallback((layerId: string, newName: string) => {
    onUpdateLayer(layerId, { name: newName });
  }, [onUpdateLayer]);

  return (
    <aside 
      className="w-64 bg-background border-r border-border flex flex-col h-full overflow-hidden"
      role="complementary"
      aria-label="Layer panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Layers</h2>
            <span className="text-[10px] text-muted-foreground">{layers.length} layer{layers.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "p-1.5 rounded-md transition-colors",
                "hover:bg-primary/10 text-muted-foreground hover:text-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary/30"
              )}
              aria-label="Add new layer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
            {ADD_LAYER_OPTIONS.map((option) => (
              <DropdownMenuItem 
                key={option.type}
                onClick={() => onAddLayer(option.type)}
                className="flex items-start gap-2 p-2.5 cursor-pointer focus:bg-accent"
              >
                <div className="p-1 rounded bg-muted shrink-0">
                  <option.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{option.label}</span>
                  <span className="text-[10px] text-muted-foreground">{option.description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Layer List */}
      <ScrollArea className="flex-1">
        <div 
          className="p-2 space-y-1"
          role="list"
          aria-label="Layers"
        >
          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No layers yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Click the + button to add a layer
              </p>
            </div>
          ) : (
            layers.map((layer, index) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                index={index}
                isSelected={layer.id === selectedLayerId}
                isDragging={draggedIndex === index}
                onSelect={onSelectLayer}
                onToggleVisibility={onToggleVisibility}
                onToggleLock={onToggleLock}
                onDuplicate={onDuplicateLayer}
                onRemove={onRemoveLayer}
                onRename={handleRename}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Selected Layer Properties */}
      {selectedLayer && (
        <div className="border-t border-border shrink-0 bg-muted/20">
          {/* Properties Section */}
          <Collapsible
            open={propertiesOpen}
            onOpenChange={setPropertiesOpen}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Properties</span>
              </div>
              {propertiesOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-4">
                {/* Opacity Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Opacity
                    </label>
                    <span className="text-xs font-medium text-primary tabular-nums">
                      {selectedLayer.opacity}%
                    </span>
                  </div>
                  <Slider
                    value={[selectedLayer.opacity]}
                    onValueChange={([value]) => onSetOpacity(selectedLayer.id, value)}
                    min={0}
                    max={100}
                    step={1}
                    disabled={selectedLayer.locked}
                    className="w-full"
                  />
                </div>

                {/* Blend Mode Selector */}
                <BlendModeSelector
                  value={selectedLayer.blendMode}
                  onChange={(mode) => onSetBlendMode(selectedLayer.id, mode)}
                  disabled={selectedLayer.locked}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Transform Section */}
          <Collapsible
            open={transformOpen}
            onOpenChange={setTransformOpen}
            className="border-t border-border/50"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors">
              <span>Transform</span>
              {transformOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3">
                <TransformControls
                  transform={selectedLayer.transform}
                  onChange={(updates) => onUpdateTransform(selectedLayer.id, updates)}
                  disabled={selectedLayer.locked}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </aside>
  );
});

LayerPanel.displayName = 'LayerPanel';
