class WorkerManager {
  private static aiWorker: Worker | null = null;
  private static imageWorker: Worker | null = null;

  static getAIWorker(): Worker {
    if (!this.aiWorker) {
      if (typeof window !== 'undefined') {
        this.aiWorker = new Worker(new URL("./aiWorker.ts", import.meta.url));
      }
    }
    return this.aiWorker!;
  }

  static getImageWorker(): Worker {
    if (!this.imageWorker) {
      if (typeof window !== 'undefined') {
        this.imageWorker = new Worker(new URL("./imageWorker.ts", import.meta.url));
      }
    }
    return this.imageWorker!;
  }

  /**
   * Process a request in a worker thread.
   * Uses a unique messageId to ensure responses are matched correctly even if 
   * multiple processes run concurrently on the same worker instance.
   */
  static async process(workerType: 'ai' | 'image', payload: any, onStatus?: (msg: string) => void): Promise<Blob> {
    const messageId = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const worker = workerType === 'ai' ? this.getAIWorker() : this.getImageWorker();
      
      const messageHandler = (e: MessageEvent) => {
        // Only handle messages matching this request's ID
        if (e.data.id !== messageId) return;

        if (e.data.type === 'SUCCESS') {
          worker.removeEventListener('message', messageHandler);
          resolve(e.data.resultBlob);
        } else if (e.data.type === 'STATUS' || e.data.type === 'PROGRESS') {
          if (onStatus) onStatus(e.data.message);
        } else if (e.data.type === 'ERROR') {
          worker.removeEventListener('message', messageHandler);
          reject(new Error(e.data.error));
        }
      };

      worker.addEventListener('message', messageHandler);
      worker.postMessage({ ...payload, id: messageId });
    });
  }
}

export default WorkerManager;
