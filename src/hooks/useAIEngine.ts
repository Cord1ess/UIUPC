import { useState } from "react";
import WorkerManager from "@/workers/WorkerManager";
import { useStudioStore } from "@/store/useStudioStore";

export function useAIEngine(defaultStatus: string = "AI Computing Engine") {
  const { images, activeImageId, applyProcessedImage } = useStudioStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(defaultStatus);
  const [activeOp, setActiveOp] = useState<string | null>(null);

  const activeImage = images.find((img) => img.id === activeImageId);

  const processJob = async (
    workerType: 'ai' | 'image',
    payload: any,
    operationId: string,
    toolFamily: "retouch" | "enhance",
    historyLabel: string
  ) => {
    if (!activeImage) return;

    setIsProcessing(true);
    setActiveOp(operationId);
    setStatusMessage(`Initializing ${historyLabel}...`);

    try {
      const res = await fetch(activeImage.workingUrl);
      const blob = await res.blob();

      // Dispatch to global singleton worker
      const finalPayload = { ...payload, blob };
      
      const resultBlob = await WorkerManager.process(workerType, finalPayload, (msg) => {
        setStatusMessage(msg);
      });

      // Commit to store history safely
      applyProcessedImage(activeImage.id, resultBlob, toolFamily, historyLabel);
      
      setStatusMessage(defaultStatus);
    } catch (e: any) {
      console.error(e);
      setStatusMessage(`Failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
      setActiveOp(null);
    }
  };

  return { activeImage, isProcessing, statusMessage, activeOp, processJob, setStatusMessage };
}
