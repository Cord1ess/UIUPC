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

  static async process(workerType: 'ai' | 'image', payload: any, onStatus?: (msg: string) => void): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const worker = workerType === 'ai' ? this.getAIWorker() : this.getImageWorker();
      
      const messageHandler = (e: MessageEvent) => {
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
      worker.postMessage(payload);
    });
  }
}

export default WorkerManager;
