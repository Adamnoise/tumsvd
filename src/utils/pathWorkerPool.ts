import { CornerExponents } from '../types/layers';

// Store pending requests by ID
type PendingRequest = {
  resolve: (pathData: string) => void;
  reject: (error: Error) => void;
};

let requestIdCounter = 0;
const pendingRequests = new Map<string, PendingRequest>();
let worker: Worker | null = null;

/**
 * Initialize the worker if not already done
 */
function initWorker(): Worker {
  if (worker) {
    return worker;
  }

  // Create worker - this path might need adjustment based on build config
  try {
    worker = new Worker(new URL('./workers/math.worker.ts', import.meta.url), {
      type: 'module',
    });

    // Handle messages from worker
    worker.onmessage = (event) => {
      const { id, pathData, error } = event.data;
      const request = pendingRequests.get(id);

      if (!request) {
        console.warn(`Received response for unknown request ID: ${id}`);
        return;
      }

      pendingRequests.delete(id);

      if (error) {
        request.reject(new Error(error));
      } else {
        request.resolve(pathData);
      }
    };

    // Handle worker errors
    worker.onerror = (event) => {
      console.error('Worker error:', event.message);
      // Clear all pending requests on worker error
      pendingRequests.forEach((request) => {
        request.reject(new Error(`Worker error: ${event.message}`));
      });
      pendingRequests.clear();
    };
  } catch (error) {
    console.warn(
      'Failed to create Web Worker for path generation, falling back to main thread',
      error
    );
    // Return a dummy worker that we'll handle differently
    return null as unknown as Worker;
  }

  return worker;
}

/**
 * Generate a symmetric superellipse path using the worker
 * Falls back to synchronous generation if worker fails
 */
export async function generatePathAsync(
  width: number,
  height: number,
  exp: number
): Promise<string> {
  try {
    const workerInstance = initWorker();
    if (!workerInstance) {
      // Fallback to synchronous generation
      return generatePathSync(width, height, exp);
    }

    const id = `req-${++requestIdCounter}-${Date.now()}`;

    return new Promise((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error('Path generation timeout'));
      }, 10000);

      pendingRequests.set(id, {
        resolve: (pathData) => {
          clearTimeout(timeoutId);
          resolve(pathData);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      });

      workerInstance.postMessage({
        type: 'GENERATE_PATH_SYMMETRIC',
        id,
        width,
        height,
        exp,
      });
    });
  } catch (error) {
    // Fallback to synchronous generation on any error
    return generatePathSync(width, height, exp);
  }
}

/**
 * Generate an asymmetric (per-corner) superellipse path using the worker
 * Falls back to synchronous generation if worker fails
 */
export async function generatePerCornerPathAsync(
  width: number,
  height: number,
  corners: CornerExponents
): Promise<string> {
  try {
    const workerInstance = initWorker();
    if (!workerInstance) {
      // Fallback to synchronous generation
      return generatePerCornerPathSync(width, height, corners);
    }

    const id = `req-${++requestIdCounter}-${Date.now()}`;

    return new Promise((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error('Path generation timeout'));
      }, 10000);

      pendingRequests.set(id, {
        resolve: (pathData) => {
          clearTimeout(timeoutId);
          resolve(pathData);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      });

      workerInstance.postMessage({
        type: 'GENERATE_PATH_ASYMMETRIC',
        id,
        width,
        height,
        corners,
      });
    });
  } catch (error) {
    // Fallback to synchronous generation on any error
    return generatePerCornerPathSync(width, height, corners);
  }
}

/**
 * Synchronous fallback for path generation
 * Used when Web Worker is not available
 */
function generatePathSync(width: number, height: number, exp: number): string {
  const { getSuperellipsePath } = require('./math');
  return getSuperellipsePath(width, height, exp);
}

/**
 * Synchronous fallback for per-corner path generation
 */
function generatePerCornerPathSync(
  width: number,
  height: number,
  corners: CornerExponents
): string {
  const { getPerCornerSuperellipsePath } = require('./math');
  return getPerCornerSuperellipsePath(width, height, corners);
}

/**
 * Terminate the worker (cleanup)
 */
export function terminateWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
    pendingRequests.clear();
  }
}
