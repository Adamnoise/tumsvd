import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Undo/Redo history management hook
 * Maintains a stack of state snapshots for time-travel editing
 */
export function useHistory<T>(initialState: T, maxHistory: number = 50) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);
  const historyRef = useRef<{ past: T[]; present: T; future: T[] }>({
    past: [],
    present: initialState,
    future: [],
  });

  // Sync ref with state
  useEffect(() => {
    historyRef.current = { past, present, future };
  }, [past, present, future]);

  /**
   * Push a new state onto the history stack
   * Clears the future stack (redo history)
   */
  const pushState = useCallback((newState: T) => {
    setPast((prevPast) => {
      const newPast = [...prevPast, present];
      // Limit history size
      return newPast.length > maxHistory ? newPast.slice(-maxHistory) : newPast;
    });
    setPresent(newState);
    setFuture([]);
  }, [present, maxHistory]);

  /**
   * Undo: go back to previous state
   */
  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const newPast = prevPast.slice(0, -1);
      const newPresent = prevPast[prevPast.length - 1];

      setFuture((prevFuture) => [present, ...prevFuture]);
      setPresent(newPresent);

      return newPast;
    });
  }, [present]);

  /**
   * Redo: go forward to next state
   */
  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const newFuture = prevFuture.slice(1);
      const newPresent = prevFuture[0];

      setPast((prevPast) => [...prevPast, present]);
      setPresent(newPresent);

      return newFuture;
    });
  }, [present]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  /**
   * Reset to initial state and clear history
   */
  const resetHistory = useCallback((state: T) => {
    setPresent(state);
    setPast([]);
    setFuture([]);
  }, []);

  return {
    state: present,
    setState: setPresent,
    pushState,
    undo,
    redo,
    clearHistory,
    resetHistory,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: {
      past: past.length,
      future: future.length,
    },
  };
}

/**
 * Hook for keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
 */
export function useHistoryKeyboardShortcuts(
  onUndo: () => void,
  onRedo: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      // Check for Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        onRedo();
      }
      // Also support Ctrl+Y for redo (Windows)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y' && !e.shiftKey) {
        e.preventDefault();
        onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, enabled]);
}
