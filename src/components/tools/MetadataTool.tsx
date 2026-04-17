"use client";

import React, { useState, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import piexif from "piexifjs";
import ExifReader from "exifreader";
import { 
  FaCheckCircle,
  FaUserEdit,
  FaCopyright,
  FaTag,
  FaFingerprint,
  FaInfoCircle,
  FaEdit,
  FaImage,
  FaRulerCombined,
  FaFile,
  FaCalendarAlt,
  FaCamera,
  FaMicrochip,
  FaLayerGroup,
  FaSlidersH,
  FaCrosshairs,
  FaClock,
  FaBullseye,
  FaAdjust
} from "react-icons/fa";

const MetadataTool: React.FC = () => {
  const { images, activeImageId, updateImageEdits, applyProcessedImage } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);
  const metadataSettings = activeImage?.edits?.metadata || { stripExif: false, overrides: {} };

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "modify">("view");
  const [imageInfo, setImageInfo] = useState<Record<string, string>>({});
  const [exifGroups, setExifGroups] = useState<Record<string, Record<string, string>>>({});

  // Extract base image metadata and deep EXIF on mount
  useEffect(() => {
    if (!activeImage) return;

    // Load basic file/image properties
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        "Dimensions": `${img.naturalWidth} × ${img.naturalHeight} px`,
        "Aspect Ratio": (img.naturalWidth / img.naturalHeight).toFixed(2),
        "File Size": `${(activeImage.file.size / 1024).toFixed(1)} KB`,
        "Format": activeImage.file.type || "unknown",
      });
    };
    img.src = activeImage.workingUrl;

    // Load deep EXIF using ExifReader (More comprehensive than piexif)
    const loadExif = async () => {
      try {
        const tags = await ExifReader.load(activeImage.workingUrl);
        const groups: Record<string, Record<string, string>> = {
          "Technical Settings": {},
          "Hardware": {},
          "Binary Info": {}
        };
        
        // 1. Technical
        if (tags['ExposureTime']) groups["Technical Settings"]["Shutter"] = tags['ExposureTime'].description;
        if (tags['FNumber']) groups["Technical Settings"]["Aperture"] = tags['FNumber'].description;
        if (tags['ISOSpeedRatings']) groups["Technical Settings"]["ISO"] = tags['ISOSpeedRatings'].description;
        if (tags['FocalLength']) groups["Technical Settings"]["Focal Length"] = tags['FocalLength'].description;
        if (tags['ExposureBiasValue']) groups["Technical Settings"]["Exposure Bias"] = tags['ExposureBiasValue'].description;
        if (tags['WhiteBalance']) groups["Technical Settings"]["White Balance"] = tags['WhiteBalance'].description;

        // 2. Hardware
        if (tags['Make']) groups["Hardware"]["Manufacturer"] = tags['Make'].description;
        if (tags['Model']) groups["Hardware"]["Model"] = tags['Model'].description;
        if (tags['Software']) groups["Hardware"]["Software"] = tags['Software'].description;
        if (tags['LensModel']) groups["Hardware"]["Lens"] = tags['LensModel'].description;

        // 3. Binary/General
        if (tags['DateTimeOriginal']) groups["Binary Info"]["Captured"] = tags['DateTimeOriginal'].description;
        if (tags['ColorSpace']) groups["Binary Info"]["Color Space"] = tags['ColorSpace'].description;
        if (tags['XResolution']) groups["Binary Info"]["Resolution"] = `${tags['XResolution'].description} DPI`;

        // Filter out empty groups
        const filteredGroups = Object.fromEntries(
          Object.entries(groups).filter(([_, content]) => Object.keys(content).length > 0)
        );

        setExifGroups(filteredGroups);
      } catch (err) { 
        console.log("No deep EXIF detected", err); 
        setExifGroups({});
      }
    };
    
    loadExif();
  }, [activeImage?.id, activeImage?.workingUrl]);

  if (!activeImage) return null;

  const handleUpdate = (updates: any) => {
    updateImageEdits(activeImage.id, {
      metadata: { ...metadataSettings, ...updates }
    });
  };

  const setOverride = (key: string, value: string) => {
    handleUpdate({ 
      overrides: { ...metadataSettings.overrides, [key]: value } 
    });
  };

  const getBase64FromBlob = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeImage.workingUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      // Create a heavily-optimized JPEG canvas output
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d', { alpha: false })?.drawImage(img, 0, 0);

      // Extract raw JPEG base64 (since piexif only supports JPEG mutation)
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      let finalDataUrl = jpegDataUrl;

      // Apply EXIF Modifications via piexifjs
      if (metadataSettings.stripExif) {
         // piexif.remove strips all headers entirely out of the binary
         finalDataUrl = piexif.remove(jpegDataUrl);
      } else {
         try {
             // Load existing or mock empty if none exists
             const exifObj = { "0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "Interop": {} };
             
             // Setup overrides into the Exif standard IFD tags
             if (metadataSettings.overrides["Author"]) {
                 exifObj["0th"][piexif.ImageIFD.Artist] = metadataSettings.overrides["Author"];
             }
             if (metadataSettings.overrides["Copyright"]) {
                 exifObj["0th"][piexif.ImageIFD.Copyright] = metadataSettings.overrides["Copyright"];
             }
             if (metadataSettings.overrides["Keywords"]) {
                 exifObj["0th"][piexif.ImageIFD.Software] = metadataSettings.overrides["Keywords"]; // Fallback to software tag for generic text
             }

             // Dump the modified binary string tree back into the dataUrl
             const exifBytes = piexif.dump(exifObj as any);
             finalDataUrl = piexif.insert(exifBytes, jpegDataUrl);
         } catch (e) {
             console.error("Failed to construct piexif string", e);
         }
      }

      // Convert back to a native Blob logic
      const res = await fetch(finalDataUrl);
      const blob = await res.blob();

      applyProcessedImage(activeImage.id, blob, "metadata", metadataSettings.stripExif ? "EXIF Scrubbed" : "Meta Injected (JPEG)");
      setIsProcessing(false);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const INFO_ICONS: Record<string, React.ReactNode> = {
    "Dimensions": <FaRulerCombined />,
    "Aspect Ratio": <FaImage />,
    "File Size": <FaFile />,
    "Format": <FaFile />,
    "Manufacturer": <FaCamera />,
    "Model": <FaMicrochip />,
    "Captured": <FaCalendarAlt />,
    "Shutter": <FaClock />,
    "Aperture": <FaBullseye />,
    "ISO": <FaAdjust />,
    "Focal Length": <FaCrosshairs />,
    "Lens": <FaLayerGroup />,
    "Software": <FaEdit />
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setActiveTab("view")}
          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
            ${activeTab === "view" 
              ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-400 hover:text-zinc-600"}`}
        >
          <FaInfoCircle className="inline mr-2" />View Info
        </button>
        <button 
          onClick={() => setActiveTab("modify")}
          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
            ${activeTab === "modify" 
              ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-400 hover:text-zinc-600"}`}
        >
          <FaEdit className="inline mr-2" />Modify EXIF
        </button>
      </div>

      {activeTab === "view" ? (
        /* === VIEW TAB === */
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-2 mb-2">
            <FaFingerprint className="text-uiupc-orange text-xs" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Payload Integrity</span>
          </div>

          <div className="space-y-2">
            {Object.entries(imageInfo).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-4 px-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                  {INFO_ICONS[key] || <FaInfoCircle />} {key}
                </span>
                <span className="text-[10px] font-mono text-zinc-800 dark:text-zinc-200">{value}</span>
              </div>
            ))}
            
            {/* Deep EXIF Display */}
            {Object.keys(exifGroups).length === 0 ? (
               <div className="py-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">No Deep Metadata detected</p>
               </div>
            ) : (
               Object.entries(exifGroups).map(([groupName, content]) => (
                <div key={groupName} className="space-y-3 pt-4">
                   <div className="flex items-center gap-2 px-2">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-uiupc-orange">{groupName}</span>
                     <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
                   </div>
                   <div className="grid gap-2">
                      {Object.entries(content).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-4 px-5 rounded-2xl bg-black/4 dark:bg-white/4 border border-black/5 dark:border-white/5">
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                             {INFO_ICONS[key] || <FaInfoCircle />} {key}
                           </span>
                           <span className="text-[10px] font-mono text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">{value}</span>
                        </div>
                      ))}
                   </div>
                </div>
               ))
            )}
          </div>
        </div>
      ) : (
        /* === MODIFY TAB === */
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <FaFingerprint className="text-uiupc-orange text-xs" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Modify Data</span>
          </div>

          <p className="text-xs text-zinc-500 font-sans px-2">Modifying or stripping EXIF data will explicitly convert the resulting image to the JPEG format structure to support the binary headers.</p>

          {/* Stripping Toggle */}
          <div 
            onClick={() => handleUpdate({ stripExif: !metadataSettings.stripExif })}
            className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group
              ${metadataSettings.stripExif ? 'bg-red-500/5 border-red-500/20' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5'}`}
          >
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 dark:text-white group-hover:text-uiupc-orange transition-colors">
                  Strip EXIF Data
                </p>
                <p className="text-[8px] text-zinc-500 font-sans tracking-tight">Remove all embedded metadata binary tags</p>
             </div>
             <div className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${metadataSettings.stripExif ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${metadataSettings.stripExif ? 'left-7' : 'left-1'}`} />
             </div>
          </div>

          {/* Override Forms */}
          {!metadataSettings.stripExif && (
            <div className="space-y-6">
               {[
                 { key: "Author", label: "Author Override", icon: <FaUserEdit />, placeholder: "e.g. Jonayed" },
                 { key: "Copyright", label: "Copyright Override", icon: <FaCopyright />, placeholder: "e.g. © 2026 UIUPC" },
                 { key: "Keywords", label: "Software Tag", icon: <FaTag />, placeholder: "e.g. Edited with UIUPC Studio" },
               ].map((field) => (
                 <div key={field.key} className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                       {field.icon} {field.label}
                    </p>
                    <input 
                      type="text" 
                      value={metadataSettings.overrides[field.key] || ""}
                      onChange={(e) => setOverride(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] font-sans focus:outline-none focus:ring-1 focus:ring-uiupc-orange transition-all placeholder:text-zinc-400"
                    />
                 </div>
               ))}
            </div>
          )}

          <button 
            onClick={handleApply}
            disabled={isProcessing}
            className="w-full py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isProcessing ? "Recompiling Hex..." : <><FaCheckCircle /> Commit Modifications</>}
          </button>
        </div>
      )}
    </div>
  );
};

export default MetadataTool;
