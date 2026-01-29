import React, { memo } from 'react';
import { Layer, ShapeContent } from '@/types/layers';
import { cn } from '@/lib/utils';

interface LayerThumbnailProps {
  layer: Layer;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Renders a small thumbnail preview of a layer
 */
export const LayerThumbnail = memo<LayerThumbnailProps>(({ 
  layer, 
  size = 'sm',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
  };

  if (layer.type === 'shape' && layer.content?.type === 'superellipse') {
    const content = layer.content as ShapeContent;
    
    // Create a simple preview based on shape parameters
    const scale = size === 'sm' ? 0.15 : 0.2;
    const previewWidth = content.width * scale;
    const previewHeight = content.height * scale;
    
    // Generate a simplified path for the preview (using full path would be overkill)
    const borderRadius = content.exp < 2 ? '0%' : content.exp < 4 ? '20%' : '50%';
    
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded overflow-hidden flex-shrink-0 border border-muted-foreground/20 bg-muted/30",
          sizeClasses[size],
          className
        )}
        title={`${layer.name} (Shape: ${content.width}x${content.height})`}
      >
        <div
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            backgroundColor: content.solidColor || '#FF9F00',
            opacity: content.solidOpacity / 100,
            borderRadius,
            transition: 'all 0.2s ease-out',
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  if (layer.type === 'image' && layer.content?.type === 'image') {
    const content = layer.content as any;
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded overflow-hidden flex-shrink-0 border border-muted-foreground/20 bg-muted/30",
          sizeClasses[size],
          className
        )}
        title={`${layer.name} (Image)`}
      >
        <img
          src={content.src}
          alt={content.alt || layer.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (layer.type === 'text' && layer.content?.type === 'text') {
    const content = layer.content as any;
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded overflow-hidden flex-shrink-0 border border-muted-foreground/20 bg-muted/30 text-[8px] font-bold",
          sizeClasses[size],
          className
        )}
        title={`${layer.name} (Text: "${content.text}")`}
        style={{ color: content.color || '#000000' }}
      >
        {content.text.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  if (layer.type === 'group') {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded overflow-hidden flex-shrink-0 border border-muted-foreground/20 bg-muted/30 text-[10px]",
          sizeClasses[size],
          className
        )}
        title={`${layer.name} (Group)`}
      >
        <span className="text-muted-foreground/60">⊕</span>
      </div>
    );
  }

  // Fallback
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded overflow-hidden flex-shrink-0 border border-muted-foreground/20 bg-muted/30",
        sizeClasses[size],
        className
      )}
      title={layer.name}
    />
  );
});

LayerThumbnail.displayName = 'LayerThumbnail';
