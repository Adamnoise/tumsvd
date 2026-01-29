import { useMemo, useCallback } from 'react';
import { ShapeContent, GradientStop } from '../types/layers';
import { getSuperellipsePath, getPerCornerSuperellipsePath } from '../utils/math';
import { DEFAULT_SHAPE_CONTENT } from '../utils/shapeDefaults';

/**
 * Hook to manage shape content for the selected layer
 * Provides a SuperellipseState-compatible interface while reading from and writing to layer content
 */
export function useSelectedShapeContent(
  selectedLayer: any | null,
  updateSelectedShapeContent: (updates: Partial<ShapeContent>) => void
) {
  // Get the shape content from the selected layer, or use defaults
  const shapeContent = useMemo<ShapeContent>(() => {
    if (
      selectedLayer &&
      selectedLayer.type === 'shape' &&
      selectedLayer.content?.type === 'superellipse'
    ) {
      return selectedLayer.content as ShapeContent;
    }
    return DEFAULT_SHAPE_CONTENT;
  }, [selectedLayer]);

  // Compute pathData based on shape parameters
  const pathData = useMemo(() => {
    if (shapeContent.useAsymmetricCorners) {
      return getPerCornerSuperellipsePath(
        shapeContent.width,
        shapeContent.height,
        shapeContent.cornerExponents
      );
    }
    return getSuperellipsePath(shapeContent.width, shapeContent.height, shapeContent.exp);
  }, [
    shapeContent.width,
    shapeContent.height,
    shapeContent.exp,
    shapeContent.useAsymmetricCorners,
    shapeContent.cornerExponents,
  ]);

  // Helper function to update shape state
  const updateState = useCallback(
    (updates: Partial<ShapeContent>) => {
      updateSelectedShapeContent(updates);
    },
    [updateSelectedShapeContent]
  );

  // Helper function to update gradient stop
  const updateGradientStop = useCallback(
    (index: number, updates: Partial<GradientStop>) => {
      const newStops = [...shapeContent.gradientStops];
      newStops[index] = { ...newStops[index], ...updates };
      updateState({ gradientStops: newStops });
    },
    [shapeContent.gradientStops, updateState]
  );

  // Helper function to reset to defaults
  const resetState = useCallback(() => {
    updateState(DEFAULT_SHAPE_CONTENT);
  }, [updateState]);

  // Helper function to load new state
  const loadState = useCallback(
    (newState: Partial<ShapeContent>) => {
      updateState(newState);
    },
    [updateState]
  );

  // Helper function to randomize glow
  const randomizeGlow = useCallback(() => {
    const randomH = Math.floor(Math.random() * 360);
    const randomL = 60 + Math.random() * 30;
    const randomC = 0.1 + Math.random() * 0.2;

    // Simple HSL to Hex conversion for solid color
    const hslToHex = (h: number, s: number, l: number): string => {
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    const hex = hslToHex(randomH, 80, 60);

    updateState({
      hue: randomH,
      lightness: randomL,
      chroma: randomC,
      solidColor: hex,
      glowPositionX: -100 + Math.random() * 200,
      glowPositionY: -100 + Math.random() * 100,
      glowScale: 0.8 + Math.random() * 1.4,
    });
  }, [updateState]);

  return {
    state: shapeContent,
    updateState,
    updateGradientStop,
    resetState,
    loadState,
    randomizeGlow,
    pathData,
  };
}
