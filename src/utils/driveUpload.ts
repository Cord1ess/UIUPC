export interface DriveUploadOptions {
  action?: string;
  folderName?: string;
  fileName: string;
}

export const uploadToDrive = async (file: File, options: DriveUploadOptions) => {
  const GAS_URL = process.env.NEXT_PUBLIC_GAS_DRIVE;
  if (!GAS_URL) throw new Error("Google Drive API is not configured.");

  // Convert file to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const base64Data = await base64Promise;

  const response = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: options.action || 'upload',
      fileName: options.fileName,
      mimeType: file.type,
      data: base64Data,
      folderName: options.folderName || 'Root'
    })
  });

  const result = await response.json();
  if (result.error) throw new Error(result.error);
  
  return result.fileId as string;
};
