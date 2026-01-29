import { ShapeContent, GradientStop } from '../types/layers';

/**
 * Default shape content for superellipse layers
 */
export const DEFAULT_SHAPE_CONTENT: ShapeContent = {
  type: 'superellipse',
  
  // Dimensions
  width: 320,
  height: 400,
  exp: 4.0,
  smoothing: 0.5,
  
  // Asymmetric corners
  useAsymmetricCorners: false,
  cornerExponents: {
    topLeft: 4.0,
    topRight: 4.0,
    bottomRight: 4.0,
    bottomLeft: 4.0,
  },
  
  // Colors
  colorMode: 'solid',
  solidColor: '#FF9F00',
  solidOpacity: 100,
  gradientStops: [
    { color: '#6366F1', position: 0 },
    { color: '#A855F7', position: 50 },
    { color: '#EC4899', position: 100 },
  ],
  gradientAngle: 135,
  
  // Glow (OKLCH)
  enabled: true,
  hue: 40,
  chroma: 0.18,
  lightness: 78,
  glowMaskSize: 0.3,
  glowScale: 0.9,
  glowPositionX: -590,
  glowPositionY: -1070,
  glowOpacity: 100,
  glowBlur: 120,
  glowSpread: 40,
  
  // Effects
  blur: 0,
  backdropBlur: 0,
  noiseEnabled: true,
  noiseIntensity: 35,
  
  // Border/Stroke
  borderEnabled: false,
  strokeColor: '#FFFFFF',
  strokeWidth: 2,
  strokePosition: 'inside',
  strokeStyle: 'solid',
  strokeOpacity: 100,
  
  // Shadow
  shadowDistance: 10,
  shadowIntensity: 30,
  
  // Animation
  glowAnimation: 'none',
  glowAnimationSpeed: 1,
  glowAnimationIntensity: 50,
};

/**
 * Create a shape content object with optional overrides
 */
export function createShapeContent(overrides?: Partial<ShapeContent>): ShapeContent {
  return {
    ...DEFAULT_SHAPE_CONTENT,
    ...(overrides || {}),
  };
}

/**
 * Validate shape content has required fields
 */
export function isValidShapeContent(content: any): content is ShapeContent {
  return (
    content &&
    content.type === 'superellipse' &&
    typeof content.width === 'number' &&
    typeof content.height === 'number' &&
    typeof content.exp === 'number'
  );
}
