import React, { memo, useState, useCallback } from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Trash2, Copy, Square, Image, Type, Folder, MoreHorizontal } from 'lucide-react';
import { Layer } from '@/types/layers';
import { cn } from '@/lib/utils';
import { LayerThumbnail } from './LayerThumbnail';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onDuplicate: (layerId: string) => void;
  onRemove: (layerId: string) => void;
  onRename: (layerId: string, newName: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  index: number;
}

const LAYER_TYPE_ICONS = {
  shape: Square,
  image: Image,
  text: Type,
  group: Folder,
};

const LAYER_TYPE_COLORS = {
  shape: 'text-blue-500',
  image: 'text-green-500',
  text: 'text-orange-500',
  group: 'text-purple-500',
};

export const LayerItem = memo<LayerItemProps>(({
  layer,
  isSelected,
  isDragging,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onRemove,
  onRename,
  onDragStart,
  onDragOver,
  onDragEnd,
  index,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [dragOverZone, setDragOverZone] = useState<'top' | 'center' | 'bottom' | null>(null);

  const TypeIcon = LAYER_TYPE_ICONS[layer.type];
  const typeColor = LAYER_TYPE_COLORS[layer.type];

  const handleDoubleClick = useCallback(() => {
    if (!layer.locked) {
      setIsEditing(true);
      setEditName(layer.name);
    }
  }, [layer.locked, layer.name]);

  const handleNameSubmit = useCallback(() => {
    if (editName.trim() && editName !== layer.name) {
      onRename(layer.id, editName.trim());
    }
    setIsEditing(false);
  }, [editName, layer.id, layer.name, onRename]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(layer.name);
      setIsEditing(false);
    }
  }, [handleNameSubmit, layer.name]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(layer.id);
  }, [layer.id, onRemove]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(layer.id);
  }, [layer.id, onDuplicate]);

  return (
    <div
      draggable={!layer.locked}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(layer.id)}
      className={cn(
        "group flex items-center gap-1.5 px-2 py-2 rounded-lg transition-all duration-150 cursor-pointer",
        isSelected 
          ? "bg-primary/10 border border-primary/40 shadow-sm" 
          : "hover:bg-muted/60 border border-transparent",
        isDragging && "opacity-50 scale-[0.98]",
        !layer.visible && "opacity-60"
      )}
      role="listitem"
      aria-selected={isSelected}
      aria-label={`Layer: ${layer.name}`}
    >
      {/* Drag Handle */}
      <div 
        className={cn(
          "cursor-grab active:cursor-grabbing transition-colors flex-shrink-0",
          isSelected ? "text-primary/60" : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
        )}
        aria-hidden="true"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Visibility Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(layer.id);
        }}
        className={cn(
          "p-1 rounded transition-colors flex-shrink-0",
          layer.visible 
            ? "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50" 
            : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50"
        )}
        aria-label={layer.visible ? "Hide layer" : "Show layer"}
        aria-pressed={layer.visible}
      >
        {layer.visible ? (
          <Eye className="w-3.5 h-3.5" />
        ) : (
          <EyeOff className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Lock Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock(layer.id);
        }}
        className={cn(
          "p-1 rounded transition-colors flex-shrink-0",
          layer.locked 
            ? "text-amber-500 hover:text-amber-600 bg-amber-500/10" 
            : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50"
        )}
        aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
        aria-pressed={layer.locked}
      >
        {layer.locked ? (
          <Lock className="w-3.5 h-3.5" />
        ) : (
          <Unlock className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Type Icon */}
      <div className={cn("p-1 rounded bg-muted/50 flex-shrink-0", typeColor)}>
        <TypeIcon className="w-3 h-3" />
      </div>

      {/* Layer Name */}
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex-1 min-w-0 text-xs bg-background border border-primary/50 rounded-md px-2 py-1",
            "outline-none focus:ring-2 focus:ring-primary/30"
          )}
          aria-label="Edit layer name"
        />
      ) : (
        <span 
          onDoubleClick={handleDoubleClick}
          className={cn(
            "flex-1 min-w-0 text-xs font-medium truncate select-none",
            isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}
          title={`${layer.name} (double-click to rename)`}
        >
          {layer.name}
        </span>
      )}

      {/* Action Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "p-1 rounded transition-all flex-shrink-0",
              "opacity-0 group-hover:opacity-100",
              "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50",
              "focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-primary/30"
            )}
            aria-label="Layer actions"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 bg-popover border border-border shadow-lg z-50">
          <DropdownMenuItem 
            onClick={handleDuplicate}
            className="text-xs cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setIsEditing(true);
              setEditName(layer.name);
            }}
            disabled={layer.locked}
            className="text-xs cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleRemove}
            className="text-xs cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

LayerItem.displayName = 'LayerItem';
