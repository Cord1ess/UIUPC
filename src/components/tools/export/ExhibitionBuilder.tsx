"use client";

import React, { useState, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaArchive, FaCheckCircle, FaTrash, FaPlus, FaColumns, FaTimes } from "react-icons/fa";
import JSZip from "jszip";

interface ExhibitionBuilderProps {
  convertBlob: (img: any, mime: string, quality: number) => Promise<Blob>;
  getExtension: (mime: string) => string;
  format: string;
  quality: number;
  formatBytes: (bytes: number) => string;
}

interface ImageGridData {
  id: string;
  serial: string;
  caption: string;
}

const ExhibitionBuilder: React.FC<ExhibitionBuilderProps> = ({ convertBlob, getExtension, format, quality, formatBytes }) => {
  const { images } = useStudioStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Syntax Builder State
  const [syntaxTokens, setSyntaxTokens] = useState<string[]>(["Serial", "_", "Name", "-", "Institution"]);
  const availableTokens = ["Serial", "Name", "Caption", "Institution", "Phone", "Category", "-", "_", " "];

  // Global Constants
  const [authorName, setAuthorName] = useState("");
  const [institution, setInstitution] = useState("UIUPC");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("Open");

  // Grid / DnD State
  const [gridData, setGridData] = useState<ImageGridData[]>(
    images.map((img, i) => ({ id: img.id, serial: (i + 1).toString().padStart(2, '0'), caption: "" }))
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const [zipFilename, setZipFilename] = useState("UIUPC_Studio_Export");
  const [imageSizes, setImageSizes] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadSizes = async () => {
       const mapped: Record<string, number> = {};
       for (const img of images) {
         try {
           const res = await fetch(img.workingUrl);
           const blob = await res.blob();
           mapped[img.id] = blob.size;
         } catch (e) { mapped[img.id] = img.originalSize; }
       }
       setImageSizes(mapped);
    };
    loadSizes();
  }, [images]);

  // Sync grid if images change
  useEffect(() => {
    setGridData(current => {
       const newGrid = images.map((img, i) => {
          const existing = current.find(c => c.id === img.id);
          return existing || { id: img.id, serial: (i + 1).toString().padStart(2, '0'), caption: "" };
       });
       // Retain original order if possible
       return newGrid.sort((a, b) => {
          const idxA = current.findIndex(c => c.id === a.id);
          const idxB = current.findIndex(c => c.id === b.id);
          if (idxA === -1 || idxB === -1) return 0;
          return idxA - idxB;
       });
    });
  }, [images]);

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
       setDraggedIndex(null);
       setDropTargetIndex(null);
       return;
    }
    
    setGridData(prev => {
      const newData = [...prev];
      const [draggedItem] = newData.splice(draggedIndex, 1);
      newData.splice(dropIndex, 0, draggedItem);
      
      // Auto-recalculate serials on drop
      return newData.map((item, i) => ({
         ...item,
         serial: (i + 1).toString().padStart(2, '0')
      }));
    });
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const updateGrid = (id: string, field: keyof ImageGridData, value: string) => {
     setGridData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const getPreviewName = (data: ImageGridData) => {
    const ext = getExtension(format);
    const nameStr = syntaxTokens.map(token => {
      switch(token) {
        case "Serial": return data.serial || "XX";
        case "Name": return authorName || "Name";
        case "Caption": return data.caption || "Caption";
        case "Institution": return institution || "Inst";
        case "Phone": return phoneNumber || "Phone";
        case "Category": return category || "Category";
        case " ": return " ";
        case "-": return "-";
        case "_": return "_";
        default: return "";
      }
    }).join("");
    return `${nameStr}.${ext}`.replace(/\s+/g, '_'); // fallback spaces to underscore for safety
  };

  const getZipSyntaxName = () => {
    const nameStr = syntaxTokens.map(token => {
      switch(token) {
        case "Serial": return ""; // Ignore explicit serial for Zip root
        case "Name": return authorName || "Name";
        case "Caption": return ""; // Ignore explicit caption for Zip root
        case "Institution": return institution || "Inst";
        case "Phone": return phoneNumber || "Phone";
        case "Category": return category || "Category";
        case " ": return " ";
        case "-": return "-";
        case "_": return "_";
        default: return "";
      }
    }).join("");
    
    // Clean up trailing/duplicate delimiters resulting from omitted row tokens
    return nameStr.replace(/\s+/g, '_').replace(/-_/g, '-').replace(/_-/g, '-').replace(/_+/g, '_').replace(/^-+|-+$/g, '').replace(/^_|_$/g, '') || "UIUPC_Exhibition";
  };

  const handleZipProcess = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    const folder = zip.folder(`${zipFilename || 'UIUPC_Export'}_${Date.now()}`);

    for (let i = 0; i < gridData.length; i++) {
       const dataRow = gridData[i];
       const img = images.find(img => img.id === dataRow.id);
       if (!img) continue;

       const convertedBlob = await convertBlob(img, format, quality);
       
       const finalName = getPreviewName(dataRow);
       folder?.file(finalName, convertedBlob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = `${zipFilename || 'UIUPC_Studio_Export'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(zipUrl);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
      
      {/* Top Header Controls */}
      <div className="p-6 border-b border-black/5 dark:border-white/5 space-y-6">
         
         <div className="flex flex-col xl:flex-row gap-6 justify-between">
            <div className="space-y-4 flex-1">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Global Constants</h3>
               <div className="grid grid-cols-2 gap-3">
                 <input 
                   type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Full Name"
                   className="w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-uiupc-orange transition-colors"
                 />
                 <input 
                   type="text" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Inst. (e.g. UIUPC)"
                   className="w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-uiupc-orange transition-colors"
                 />
                 <input 
                   type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone Number"
                   className="w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-uiupc-orange transition-colors"
                 />
                 <input 
                   type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g. Color)"
                   className="w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-uiupc-orange transition-colors"
                 />
               </div>
            </div>

            <div className="flex-1 space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Syntax Constructor</h3>
               <div className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl min-h-[42px]">
                  {syntaxTokens.map((token, i) => (
                    <span key={i} className="px-2 py-1.5 bg-black/5 dark:bg-white/5 rounded text-[10px] font-mono font-bold text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10 flex items-center gap-2">
                       {token}
                       <button 
                         onClick={() => setSyntaxTokens(syntaxTokens.filter((_, index) => index !== i))} 
                         className="w-4 h-4 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all flex-shrink-0"
                         title="Remove Token"
                       >
                         <FaTimes className="text-[8px]" />
                       </button>
                    </span>
                  ))}
               </div>
               <div className="flex flex-wrap items-center gap-2">
                  {availableTokens.map(t => (
                     <button key={t} onClick={() => setSyntaxTokens([...syntaxTokens, t])} className="px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[9px] hover:bg-uiupc-orange hover:text-white transition-colors">
                       <FaPlus className="inline mr-1 text-[8px]"/> {t}
                     </button>
                  ))}
               </div>
            </div>
         </div>

      </div>

      {/* Editable Grid Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950">
         <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 border-b border-black/5 dark:border-white/5 z-10 shadow-sm">
               <tr>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 w-16 text-center">Img (Drag)</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 w-24">Serial <span className="text-red-500">*</span></th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400">Caption</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 w-64">Filename</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 w-24 text-right">Size</th>
               </tr>
            </thead>
            <tbody>
               {gridData.map((data, index) => {
                  const img = images.find(i => i.id === data.id);
                  if (!img) return null;
                  return (
                     <tr 
                        key={data.id} 
                        draggable
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(index); }}
                        onDragLeave={() => setDropTargetIndex(null)}
                        onDragEnd={() => { setDraggedIndex(null); setDropTargetIndex(null); }}
                        onDrop={() => handleDrop(index)}
                        className={`transition-colors cursor-move group
                           ${draggedIndex === index ? 'opacity-50 bg-uiupc-orange/10 border-b border-uiupc-orange/10' : 'hover:bg-black/5 dark:hover:bg-white/5 border-b border-black/5 dark:border-white/5'}
                           ${dropTargetIndex === index && draggedIndex !== index ? 'border-t-2 border-t-uiupc-orange bg-uiupc-orange/5' : ''}`}
                     >
                        <td className="px-4 py-2">
                           <img src={img.workingUrl} className="w-10 h-10 object-cover rounded shadow-sm border border-black/10 dark:border-white/10 pointer-events-none" />
                        </td>
                        <td className="px-4 py-2">
                           <input 
                              type="text" value={data.serial} onChange={e => updateGrid(img.id, 'serial', e.target.value)} placeholder="01"
                              className="w-full bg-transparent border-b border-transparent focus:border-uiupc-orange outline-none text-xs font-mono py-1 transition-colors cursor-text"
                           />
                        </td>
                        <td className="px-4 py-2">
                           <input 
                              type="text" value={data.caption} onChange={e => updateGrid(img.id, 'caption', e.target.value)} placeholder="Optional specific caption..."
                              className="w-full bg-transparent border-b border-transparent focus:border-uiupc-orange outline-none text-xs py-1 transition-colors text-zinc-500 cursor-text"
                           />
                        </td>
                        <td className="px-4 py-2">
                           <span className="text-[10px] font-mono font-medium text-uiupc-orange/80 group-hover:text-uiupc-orange transition-colors truncate block w-full max-w-[240px] pointer-events-none">
                              {getPreviewName(data)}
                           </span>
                        </td>
                        <td className="px-4 py-2 text-right text-[10px] font-mono text-zinc-500">
                           {formatBytes((imageSizes[img.id] || img.originalSize) * (format === 'image/png' ? 1 : quality))}
                        </td>
                     </tr>
                  )
               })}
            </tbody>
         </table>
      </div>

      {/* Footer Executor */}
      <div className="p-4 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col xl:flex-row items-center justify-between gap-4">
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="hidden lg:flex flex-col mr-4 border-r border-black/10 dark:border-white/10 pr-6 gap-0.5">
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Est. Total</span>
               <span className="text-xs font-black text-uiupc-orange font-mono">
                  {formatBytes(Object.values(imageSizes).reduce((a, b) => a + b, 0) * (format === 'image/png' ? 1 : quality))}
               </span>
            </div>
            
            <input 
               type="text" 
               value={zipFilename} 
               onChange={e => setZipFilename(e.target.value)} 
               placeholder="ZIP Archive Name"
               className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-uiupc-orange transition-all w-full sm:w-64"
            />
            <button 
               onClick={() => setZipFilename(getZipSyntaxName())}
               className="px-4 py-3 rounded-xl border border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap"
            >
               Use Syntax
            </button>
         </div>

         <button 
            onClick={handleZipProcess}
            disabled={isProcessing}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-uiupc-orange/20 disabled:opacity-50 flex items-center justify-center gap-3"
         >
            {isProcessing ? "Packaging Exhibition Payload..." : <><FaArchive className="text-sm" /> Generate Renamed ZIP ({images.length})</>}
         </button>
      </div>

    </div>
  );
};

export default ExhibitionBuilder;
