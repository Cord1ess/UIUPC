/**
 * Calculates the required zoom factor to ensure a rotated image completely fills 
 * its container without showing empty spaces/gray areas at the corners.
 */
export const getSmartScale = (rotation: number) => {
  if (rotation === 0) return 1;
  const rad = (Math.abs(rotation) * Math.PI) / 180;
  // This factor ensures the bounding box of the crop rectangle
  // is always contained within the original image area.
  return Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad));
};
