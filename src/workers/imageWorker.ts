export type WorkerMessage = 
  | { type: 'PROCESS_TRANSFORM'; payload: any }
  | { type: 'PROCESS_EDITORIAL'; payload: any };

self.addEventListener('message', async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  try {
    if (type === 'PROCESS_TRANSFORM') {
      const { blob, transformer, naturalSize } = payload;
      
      // 1. High performance image decoding directly onto GPU
      const imageBitmap = await createImageBitmap(blob);
      
      let width = imageBitmap.width;
      let height = imageBitmap.height;

      // Calculate Target Dimensions
      if (transformer.resizer.mode === "dimensions" && transformer.resizer.width) {
        width = transformer.resizer.width;
        height = transformer.resizer.height || Math.round(width * (imageBitmap.height / imageBitmap.width));
      } else if (transformer.resizer.mode === "percentage") {
        const percentage = transformer.resizer.percentage || 100;
        width = Math.round(imageBitmap.width * (percentage / 100));
        height = Math.round(imageBitmap.height * (percentage / 100));
      }

      // 2. OffscreenCanvas (Runs entirely off the main thread = 0 UI lag)
      const offscreen = new OffscreenCanvas(width, height);
      const ctx = offscreen.getContext('2d', { alpha: false }); // Disable alpha for perf

      if (!ctx) throw new Error("Failed to get 2D context");

      // Hardware accelerated draw
      ctx.drawImage(imageBitmap, 0, 0, width, height);

      // Watermark Logic
      if (transformer.watermark.enabled) {
        ctx.globalAlpha = transformer.watermark.opacity;
        
        if (transformer.watermark.type === 'logo' && transformer.watermark.imageUri) {
          try {
            const logoRes = await fetch(transformer.watermark.imageUri);
            const logoBlob = await logoRes.blob();
            const logoBitmap = await createImageBitmap(logoBlob);
            
            // Calculate scale
            const scale = transformer.watermark.scale || 0.15;
            const logoTargetWidth = width * scale;
            const logoTargetHeight = logoBitmap.height * (logoTargetWidth / logoBitmap.width);

            if (transformer.watermark.tiled) {
              const pattern = ctx.createPattern(logoBitmap, 'repeat');
              if (pattern) {
                 ctx.fillStyle = pattern;
                 ctx.fillRect(0, 0, width, height);
              }
            } else {
            const { x, y } = getWatermarkPosition(
                transformer.watermark.position, 
                width, height, logoTargetWidth, logoTargetHeight, 
                width * (transformer.watermark.inset || 0.05)
              );
              ctx.drawImage(logoBitmap, x, y, logoTargetWidth, logoTargetHeight);
            }
          } catch (err) {
            console.error("Logo Watermark Failed", err);
          }
        } else if (transformer.watermark.type === 'text') {
           const scale = transformer.watermark.scale || 0.06;
           const fontSize = Math.max(width * scale, 12);
           const text = transformer.watermark.text || "UIUPC";
           ctx.font = `bold ${fontSize}px sans-serif`;
           ctx.fillStyle = "white";
           ctx.strokeStyle = "rgba(0,0,0,0.5)";
           ctx.lineWidth = fontSize * 0.05;
           
           const metrics = ctx.measureText(text);
           const textWidth = metrics.width;
           const textHeight = fontSize; 

           if (transformer.watermark.tiled) {
              ctx.translate(width / 2, height / 2);
              ctx.rotate(-Math.PI / 4);
              const stepX = width * 0.3;
              const stepY = height * 0.2;
              const diag = Math.sqrt(width * width + height * height);
              ctx.textAlign = 'center';
              ctx.fillStyle = "white";
              ctx.strokeStyle = "rgba(0,0,0,0.5)";
              ctx.lineWidth = 2;
              
              for (let y = -diag; y < diag * 2; y += stepY) {
                 for (let x = -diag; x < diag * 2; x += stepX) {
                    ctx.strokeText(text, x, y);
                    ctx.fillText(text, x, y);
                 }
              }
              ctx.resetTransform();
           } else {
              const { x, y } = getWatermarkPosition(
                transformer.watermark.position, 
                width, height, textWidth, textHeight, 
                width * (transformer.watermark.inset || 0.05)
              );
              
              ctx.textAlign = "left";
              ctx.textBaseline = "top";
              ctx.fillStyle = "white";
              ctx.strokeStyle = "rgba(0,0,0,0.5)";
              ctx.lineWidth = fontSize * 0.05;
              
              ctx.strokeText(text, x, y);
              ctx.fillText(text, x, y);
           }
        }
      }

      // 3. Ultra-fast binary output
      const resultBlob = await offscreen.convertToBlob({ type: "image/webp", quality: 0.95 });
      
      // Post result back to main thread
      self.postMessage({ type: 'SUCCESS', resultBlob, width, height });
    }
    
    else if (type === 'PROCESS_EDITORIAL') {
      const { blob, filters } = payload;
      
      const imageBitmap = await createImageBitmap(blob);
      const width = imageBitmap.width;
      const height = imageBitmap.height;

      const offscreen = new OffscreenCanvas(width, height);
      const ctx = offscreen.getContext('2d');
      if (!ctx) throw new Error("Failed to get 2D context");

      // 1. Standard Filters (Fast)
      const { 
        exposure, brightness, contrast, saturation, sepia, invert, hueRotate, blur,
        temperature, sharpen, vignette, vibrance
      } = filters;
      
      const filterString = `
        brightness(${100 + exposure + brightness}%)
        contrast(${100 + contrast}%)
        saturate(${saturation}%)
        sepia(${sepia || 0}%)
        invert(${invert || 0}%)
        hue-rotate(${hueRotate || 0}deg)
        blur(${blur || 0}px)
      `.trim().replace(/\s+/g, ' ');

      ctx.filter = filterString;
      ctx.drawImage(imageBitmap, 0, 0, width, height);
      ctx.filter = 'none'; // Clear filter for manual processing

      // 2. Specialized Filters (Manual Canvas manipulation)
      
      // Temperature (RGB Balance Shift)
      if (temperature !== 0) {
        applyTemperature(ctx, width, height, temperature);
      }

      // Vibrance (Smart Saturation)
      if (vibrance !== 0) {
        applyVibrance(ctx, width, height, vibrance);
      }

      // Vignette
      if (vignette > 0) {
        const gradient = ctx.createRadialGradient(
          width / 2, height / 2, Math.min(width, height) * 0.2, // inner
          width / 2, height / 2, Math.max(width, height) * 0.7  // outer
        );
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Sharpen (Balanced Convolution)
      if (sharpen > 0) {
        // Map 0-100 to 0-0.3 for professional intensity
        const intensity = sharpen / 300; 
        
        // Balanced 3x3 Laplacian Kernel (Sums to exactly 1.0)
        // [ 0, -i,  0 ]
        // [ -i, 1+4i, -i ]
        // [ 0, -i,  0 ]
        const kernel = [
          0,          -intensity,  0,
          -intensity,  1 + (4 * intensity), -intensity,
          0,          -intensity,  0
        ];
        applyConvolution(ctx, width, height, kernel);
      }

      const resultBlob = await offscreen.convertToBlob({ type: "image/jpeg", quality: 0.98 });
      self.postMessage({ type: 'SUCCESS', resultBlob });
    }
    
    else if (type === 'PROCESS_SPLIT') {
      const { blob, columns, rows } = payload;
      const imageBitmap = await createImageBitmap(blob);
      const sliceWidth = Math.floor(imageBitmap.width / columns);
      const sliceHeight = Math.floor(imageBitmap.height / rows);
      
      const slices = [];
      
      for (let y = 0; y < rows; y++) {
         for (let x = 0; x < columns; x++) {
            const offscreen = new OffscreenCanvas(sliceWidth, sliceHeight);
            const ctx = offscreen.getContext('2d', { alpha: false });
            if (ctx) {
               ctx.drawImage(
                 imageBitmap,
                 x * sliceWidth, y * sliceHeight, sliceWidth, sliceHeight,
                 0, 0, sliceWidth, sliceHeight
               );
               const sliceBlob = await offscreen.convertToBlob({ type: "image/jpeg", quality: 0.95 });
               slices.push({ x, y, blob: sliceBlob });
            }
         }
      }
      
      self.postMessage({ type: 'SUCCESS', slices });
    }

    else if (type === 'PROCESS_STITCH') {
      const { blobs, direction } = payload;
      // Decode all blobs simultaneously for SPEED
      const bitmaps = await Promise.all(blobs.map((b: Blob) => createImageBitmap(b)));
      
      let finalWidth = 0;
      let finalHeight = 0;

      if (direction === 'vertical') {
         finalWidth = Math.max(...bitmaps.map(b => b.width));
         finalHeight = bitmaps.reduce((acc, b) => acc + b.height, 0);
      } else {
         finalHeight = Math.max(...bitmaps.map(b => b.height));
         finalWidth = bitmaps.reduce((acc, b) => acc + b.width, 0);
      }

      const offscreen = new OffscreenCanvas(finalWidth, finalHeight);
      const ctx = offscreen.getContext('2d', { alpha: false });
      if (!ctx) throw new Error("Failed to get 2D context");
      
      // Fill background in case of uneven images
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, finalWidth, finalHeight);

      let curX = 0;
      let curY = 0;
      for (const bmp of bitmaps) {
         ctx.drawImage(bmp, curX, curY);
         if (direction === 'vertical') curY += bmp.height;
         else curX += bmp.width;
      }

      const resultBlob = await offscreen.convertToBlob({ type: "image/jpeg", quality: 0.95 });
      self.postMessage({ type: 'SUCCESS', resultBlob });
    }

    else if (type === 'PROCESS_COLLAGE') {
      const { blobs, columns, spacing } = payload;
      const bitmaps = await Promise.all(blobs.map((b: Blob) => createImageBitmap(b)));
      
      const numImages = bitmaps.length;
      const rows = Math.ceil(numImages / columns);
      
      let maxCellWidth = 0;
      let maxCellHeight = 0;
      
      bitmaps.forEach(bmp => {
         if (bmp.width > maxCellWidth) maxCellWidth = bmp.width;
         if (bmp.height > maxCellHeight) maxCellHeight = bmp.height;
      });

      const finalWidth = (columns * maxCellWidth) + ((columns + 1) * spacing);
      const finalHeight = (rows * maxCellHeight) + ((rows + 1) * spacing);

      const offscreen = new OffscreenCanvas(finalWidth, finalHeight);
      const ctx = offscreen.getContext('2d', { alpha: false });
      if (!ctx) throw new Error("Failed to get 2D context");
      
      ctx.fillStyle = "white"; // Background layer
      ctx.fillRect(0, 0, finalWidth, finalHeight);

      bitmaps.forEach((bmp, i) => {
         const col = i % columns;
         const row = Math.floor(i / columns);
         
         const x = spacing + (col * (maxCellWidth + spacing));
         const y = spacing + (row * (maxCellHeight + spacing));
         
         // Center image within its cell block if uneven
         const cx = x + (maxCellWidth - bmp.width) / 2;
         const cy = y + (maxCellHeight - bmp.height) / 2;

         ctx.drawImage(bmp, cx, cy);
      });

      const resultBlob = await offscreen.convertToBlob({ type: "image/jpeg", quality: 0.95 });
      self.postMessage({ type: 'SUCCESS', resultBlob });
    }

    else if (type === 'PROCESS_ERASE') {
      const { blob } = payload;
      
      // We dynamically import here so it doesn't inflate the general worker size
      // unless the user specifically hits the Eraser tool.
      const { removeBackground } = await import('@imgly/background-removal');

      self.postMessage({ type: 'STATUS', message: 'Downloading Neural Net (40MB)' });

      const config = {
        progress: (key: string, current: number, total: number) => {
          self.postMessage({ 
             type: 'PROGRESS', 
             message: `Loading ML Model: ${Math.round((current / total) * 100)}%` 
          });
        }
      };

      const resultBlob = await removeBackground(blob, config);
      
      self.postMessage({ type: 'SUCCESS', resultBlob });
    }

  } catch (error) {
    self.postMessage({ type: 'ERROR', error: (error as Error).message });
  }
});

// Helper for image convolution (Sharpness)
function applyConvolution(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number, kernel: number[]) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);
  
  const output = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const scy = Math.min(height - 1, Math.max(0, y + ky - halfSide));
          const scx = Math.min(width - 1, Math.max(0, x + kx - halfSide));
          const si = (scy * width + scx) * 4;
          const wt = kernel[ky * side + kx];
          r += data[si] * wt;
          g += data[si + 1] * wt;
          b += data[si + 2] * wt;
        }
      }

      output[i] = Math.min(255, Math.max(0, r));
      output[i + 1] = Math.min(255, Math.max(0, g));
      output[i + 2] = Math.min(255, Math.max(0, b));
      output[i + 3] = data[i+3]; // Alpha stays original
    }
  }

  ctx.putImageData(new ImageData(output, width, height), 0, 0);
}

// Temperature - High Fidelity RGB Shift
function applyTemperature(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number, value: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const shift = (value / 100) * 50; // Increased intensity: Max 50 RGB points shift

  for (let i = 0; i < data.length; i += 4) {
    if (value > 0) {
      // Warm: Increase Red/Yellow, decrease Blue
      data[i] = Math.min(255, data[i] + shift);
      data[i + 1] = Math.min(255, data[i + 1] + shift * 0.3); // Add a bit of yellow
      data[i + 2] = Math.max(0, data[i + 2] - shift);
    } else {
      // Cool: Increase Blue, decrease Red
      data[i + 2] = Math.min(255, data[i + 2] + Math.abs(shift));
      data[i] = Math.max(0, data[i] - Math.abs(shift));
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// Vibrance - Saturation of muted tones
function applyVibrance(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number, value: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const factor = value / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const avg = (r + g + b) / 3;
    const amt = (Math.abs(max - avg) * 2 / 255);
    const vibrance = factor * (1.0 - amt);

    data[i] = Math.min(255, Math.max(0, r + (max - r) * vibrance));
    data[i + 1] = Math.min(255, Math.max(0, g + (max - g) * vibrance));
    data[i + 2] = Math.min(255, Math.max(0, b + (max - b) * vibrance));
  }
  ctx.putImageData(imageData, 0, 0);
}

// Helpers for watermark positioning
function getWatermarkPosition(pos: string, imgW: number, imgH: number, markW: number, markH: number, padding: number) {
  let x = padding;
  let y = padding;

  if (pos.includes('right')) x = imgW - markW - padding;
  else if (pos.includes('center') && !pos.includes('-')) x = (imgW - markW) / 2;
  else if (pos.endsWith('-center') || pos.startsWith('center-')) {
    if (pos.includes('left') || pos.includes('right')) { /* x already handled */ }
    else x = (imgW - markW) / 2;
  }

  if (pos.includes('bottom')) y = imgH - markH - padding;
  else if (pos.includes('center')) {
     if (pos === 'center') {
        x = (imgW - markW) / 2;
        y = (imgH - markH) / 2;
     } else if (pos.startsWith('center-')) {
        y = (imgH - markH) / 2;
     } else if (pos.endsWith('-center')) {
        x = (imgW - markW) / 2;
     }
  }

  // Final specific overrides for clarity
  switch(pos) {
    case 'top-left': x = padding; y = padding; break;
    case 'top-center': x = (imgW - markW) / 2; y = padding; break;
    case 'top-right': x = imgW - markW - padding; y = padding; break;
    case 'center-left': x = padding; y = (imgH - markH) / 2; break;
    case 'center': x = (imgW - markW) / 2; y = (imgH - markH) / 2; break;
    case 'center-right': x = imgW - markW - padding; y = (imgH - markH) / 2; break;
    case 'bottom-left': x = padding; y = imgH - markH - padding; break;
    case 'bottom-center': x = (imgW - markW) / 2; y = imgH - markH - padding; break;
    case 'bottom-right': x = imgW - markW - padding; y = imgH - markH - padding; break;
  }

  return { x, y };
}
