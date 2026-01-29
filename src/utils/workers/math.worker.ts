// Web Worker for CPU-intensive math operations
// Runs path generation on a separate thread to avoid blocking the UI

import { getSuperellipsePath, getPerCornerSuperellipsePath } from '../math';

type WorkerMessage = 
  | {
      type: 'GENERATE_PATH_SYMMETRIC';
      id: string;
      width: number;
      height: number;
      exp: number;
    }
  | {
      type: 'GENERATE_PATH_ASYMMETRIC';
      id: string;
      width: number;
      height: number;
      corners: {
        topLeft: number;
        topRight: number;
        bottomRight: number;
        bottomLeft: number;
      };
    };

type WorkerResponse = {
  id: string;
  pathData: string;
};

// Listen for messages from the main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, id } = event.data;

  try {
    let pathData: string;

    if (type === 'GENERATE_PATH_SYMMETRIC') {
      const { width, height, exp } = event.data;
      pathData = getSuperellipsePath(width, height, exp);
    } else if (type === 'GENERATE_PATH_ASYMMETRIC') {
      const { width, height, corners } = event.data;
      pathData = getPerCornerSuperellipsePath(width, height, corners);
    } else {
      throw new Error(`Unknown message type: ${type}`);
    }

    // Send the result back to the main thread
    const response: WorkerResponse = { id, pathData };
    self.postMessage(response);
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export {};
