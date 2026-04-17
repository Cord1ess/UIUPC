/**
 * UIUPC Studio Bake Engine
 * 
 * This engine is responsible for 'baking' non-destructive UI edits 
 * (Filters, Watermarks, Crops, Vignettes) into a flat pixel buffer.
 */

export const applySharpen = (ctx: CanvasRenderingContext2D, width: number, height: number, amount: number) => {
  if (amount === 0) return;
  const weights = [
    0, -amount / 300, 0,
    -amount / 300, 1 + (4 * (amount / 300)), -amount / 300,
    0, -amount / 300, 0
  ];
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);
  const src = ctx.getImageData(0, 0, width, height).data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstOff = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;
          if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
            const srcOff = (scy * width + scx) * 4;
            const wt = weights[cy * side + cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = src[dstOff + 3];
    }
  }
  ctx.putImageData(output, 0, 0);
};

export const bakeImageToCanvas = async (img: any): Promise<HTMLCanvasElement> => {
    const res = await fetch(img.workingUrl);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    
    const edits = img.edits || {};
    const crop = edits.crop?.croppedAreaPixels;
    
    const canvas = document.createElement("canvas");
    const exportWidth = crop ? crop.width : bitmap.width;
    const exportHeight = crop ? crop.height : bitmap.height;
    
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");

    // 1. Crop / Base
    if (crop) {
       ctx.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, exportWidth, exportHeight);
    } else {
       ctx.drawImage(bitmap, 0, 0);
    }

    // 2. Filters
    if (edits.editorial) {
       const { exposure = 0, brightness = 0, contrast = 0, saturation = 100, blur = 0, sepia = 0, invert = 0, hueRotate = 0, vibrance = 0 } = edits.editorial;
       ctx.filter = `
         brightness(${100 + exposure + brightness}%)
         contrast(${100 + contrast}%)
         saturate(${saturation + vibrance}%)
         blur(${blur}px)
         sepia(${sepia}%)
         invert(${invert}%)
         hue-rotate(${hueRotate}deg)
       `.trim();
       
       ctx.drawImage(canvas, 0, 0);
       ctx.filter = "none";

       // 3. Temperature
       if (edits.editorial.temperature !== 0) {
          ctx.save();
          ctx.globalCompositeOperation = "overlay";
          ctx.fillStyle = edits.editorial.temperature > 0 
            ? `rgba(255, 140, 0, ${Math.abs(edits.editorial.temperature) / 300})`
            : `rgba(0, 100, 255, ${Math.abs(edits.editorial.temperature) / 300})`;
          ctx.fillRect(0, 0, exportWidth, exportHeight);
          ctx.restore();
       }

       // 4. Vignette
       if (edits.editorial.vignette > 0) {
          const grad = ctx.createRadialGradient(exportWidth/2, exportHeight/2, 0, exportWidth/2, exportHeight/2, Math.sqrt(exportWidth**2 + exportHeight**2)/2);
          grad.addColorStop(0.2, "transparent");
          grad.addColorStop(1, `rgba(0,0,0,${edits.editorial.vignette / 100})`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, exportWidth, exportHeight);
       }

       // 5. Sharpen
       if (edits.editorial.sharpen > 0) {
          applySharpen(ctx, exportWidth, exportHeight, edits.editorial.sharpen);
       }
    }

    // 6. Watermark
    const watermark = edits.transformer?.watermark;
    if (watermark?.enabled) {
       ctx.save();
       ctx.globalAlpha = watermark.opacity;
       
       const scaleVal = watermark.scale || 0.15;
       const insetVal = watermark.inset || 0.05;
       const wSize = exportWidth * scaleVal;
       
       const drawSingle = async (x: number, y: number, w: number) => {
          if (watermark.type === 'logo' && watermark.imageUri) {
             const wmImg = new Image();
             wmImg.src = watermark.imageUri;
             await new Promise(r => wmImg.onload = r);
             const aspect = wmImg.naturalHeight / wmImg.naturalWidth;
             ctx.drawImage(wmImg, x, y, w, w * aspect);
          } else {
             const text = watermark.text || "UIUPC";
             ctx.font = `black ${w}px Outfit, Inter, sans-serif`;
             ctx.fillStyle = "white";
             ctx.shadowColor = "rgba(0,0,0,0.5)";
             ctx.shadowBlur = w / 10;
             ctx.textBaseline = "middle";
             ctx.textAlign = "center";
             ctx.fillText(text, x + w/2, y + w/2);
          }
       };

       if (watermark.tiled) {
          const step = wSize * 2;
          for(let tx = 0; tx < exportWidth; tx += step) {
             for(let ty = 0; ty < exportHeight; ty += step) {
                await drawSingle(tx, ty, wSize);
             }
          }
       } else {
          let wx = (exportWidth - wSize) / 2;
          let wy = (exportHeight - wSize) / 2;
          const inset = exportWidth * insetVal;

          if (watermark.position.includes('top')) wy = inset;
          if (watermark.position.includes('bottom')) wy = exportHeight - wSize - inset;
          if (watermark.position.includes('left')) wx = inset;
          if (watermark.position.includes('right')) wx = exportWidth - wSize - inset;

          await drawSingle(wx, wy, wSize);
       }
       ctx.restore();
    }

    return canvas;
};
