import React, { useState, useMemo, useCallback } from 'react';
import { X, Copy, Check, Download, Code, FileJson, AlertCircle } from 'lucide-react';
import { SuperellipseState } from '@/hooks/useSuperellipse';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SuperellipseState;
  pathData: string;
}

type ExportFormat = 'css' | 'svg' | 'react' | 'vue';

const FORMAT_TABS: { id: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { id: 'css', label: 'CSS', icon: <Code className="w-3.5 h-3.5" /> },
  { id: 'svg', label: 'SVG', icon: <Code className="w-3.5 h-3.5" /> },
  { id: 'react', label: 'React', icon: <Code className="w-3.5 h-3.5" /> },
  { id: 'vue', label: 'Vue', icon: <Code className="w-3.5 h-3.5" /> },
];

// Code generators
const generateCSS = (state: SuperellipseState, pathData: string): string => {
  const stops = state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ');
  let background = '';
  
  if (state.colorMode === 'solid') {
    background = state.solidColor;
  } else if (state.colorMode === 'linear') {
    background = `linear-gradient(${state.gradientAngle}deg, ${stops})`;
  } else if (state.colorMode === 'radial') {
    background = `radial-gradient(circle, ${stops})`;
  } else {
    background = `conic-gradient(from ${state.gradientAngle}deg, ${stops})`;
  }

  return `/* Superellipse Shape */
.superellipse {
  width: ${state.width}px;
  height: ${state.height}px;
  background: ${background};
  clip-path: path('${pathData}');
  position: relative;
}

/* Glow Effect (optional) */
.superellipse::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: oklch(${state.lightness}% ${state.chroma} ${state.hue});
  filter: blur(${state.glowBlur}px);
  opacity: ${(state.glowOpacity / 100) * 0.5};
  z-index: -1;
  border-radius: 50%;
}

/* Browser Compatibility Note:
   clip-path with path() requires modern browsers.
   Consider using an SVG mask for older browser support. */`;
};

const generateSVG = (state: SuperellipseState, pathData: string): string => {
  const stops = state.gradientStops.map((s, i) => 
    `      <stop offset="${s.position}%" stop-color="${s.color}" />`
  ).join('\n');

  let fill = state.solidColor;
  let defs = '';

  if (state.colorMode !== 'solid') {
    fill = 'url(#gradient)';
    if (state.colorMode === 'linear') {
      defs = `  <defs>
    <linearGradient id="gradient" gradientTransform="rotate(${state.gradientAngle})">
${stops}
    </linearGradient>
  </defs>`;
    } else if (state.colorMode === 'radial') {
      defs = `  <defs>
    <radialGradient id="gradient">
${stops}
    </radialGradient>
  </defs>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${state.width}" height="${state.height}" 
     viewBox="0 0 ${state.width} ${state.height}" 
     xmlns="http://www.w3.org/2000/svg">
${defs}
  <path d="${pathData}" fill="${fill}" />
</svg>`;
};

const generateReact = (state: SuperellipseState, pathData: string): string => {
  const stops = state.gradientStops.map((s, i) => 
    `          <stop offset="${s.position}%" stopColor="${s.color}" />`
  ).join('\n');

  return `import React from 'react';

interface SuperellipseProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Superellipse: React.FC<SuperellipseProps> = ({
  className = '',
  width = ${state.width},
  height = ${state.height},
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 ${state.width} ${state.height}"
      className={className}
    >
      <defs>
        <linearGradient id="superellipse-gradient" gradientTransform="rotate(${state.gradientAngle})">
${stops}
        </linearGradient>
      </defs>
      <path 
        d="${pathData}" 
        fill="${state.colorMode === 'solid' ? state.solidColor : 'url(#superellipse-gradient)'}" 
      />
    </svg>
  );
};

export default Superellipse;`;
};

const generateVue = (state: SuperellipseState, pathData: string): string => {
  const stops = state.gradientStops.map((s) => 
    `        <stop offset="${s.position}%" stop-color="${s.color}" />`
  ).join('\n');

  return `<template>
  <svg 
    :width="width" 
    :height="height" 
    viewBox="0 0 ${state.width} ${state.height}"
    :class="className"
  >
    <defs>
      <linearGradient id="superellipse-gradient" gradientTransform="rotate(${state.gradientAngle})">
${stops}
      </linearGradient>
    </defs>
    <path 
      d="${pathData}" 
      fill="${state.colorMode === 'solid' ? state.solidColor : 'url(#superellipse-gradient)'}" 
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
  width?: number;
  height?: number;
}>();

withDefaults(defineProps(), {
  width: ${state.width},
  height: ${state.height},
});
</script>`;
};

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  state,
  pathData,
}) => {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('css');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const code = useMemo(() => {
    switch (activeFormat) {
      case 'css':
        return generateCSS(state, pathData);
      case 'svg':
        return generateSVG(state, pathData);
      case 'react':
        return generateReact(state, pathData);
      case 'vue':
        return generateVue(state, pathData);
      default:
        return '';
    }
  }, [activeFormat, state, pathData]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    const extensions: Record<ExportFormat, string> = {
      css: 'css',
      svg: 'svg',
      react: 'tsx',
      vue: 'vue',
    };
    const mimeTypes: Record<ExportFormat, string> = {
      css: 'text/css',
      svg: 'image/svg+xml',
      react: 'text/typescript',
      vue: 'text/plain',
    };

    const blob = new Blob([code], { type: mimeTypes[activeFormat] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superellipse.${extensions[activeFormat]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [code, activeFormat]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 id="export-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-white">
              Export Code
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Copy or download your superellipse in various formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Format Tabs */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          {FORMAT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFormat(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                activeFormat === tab.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
              role="tab"
              aria-selected={activeFormat === tab.id}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Preview */}
        <div className="relative max-h-80 overflow-auto">
          <div className="absolute top-3 right-3 text-[10px] text-zinc-400 uppercase tracking-wider z-10">
            {activeFormat}
          </div>
          <pre className="p-5 pt-8 text-[11px] leading-relaxed text-green-400 dark:text-green-300 font-mono bg-zinc-900 dark:bg-black overflow-x-auto">
            {code}
          </pre>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900 dark:from-black to-transparent pointer-events-none" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          {/* Tip */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Modern browsers only. Check caniuse.com for clip-path support.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={handleCopy}
              disabled={copied || copyError}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                copied
                  ? 'bg-green-500 text-white'
                  : copyError
                  ? 'bg-red-500 text-white'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : copyError ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Failed
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {copied ? 'Code copied to clipboard' : copyError ? 'Failed to copy code' : ''}
      </div>
    </div>
  );
};
