import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconFolder, IconFileImage, IconChevronRight, IconClose, IconSearch, IconSync, IconCheckCircle, IconExclamationTriangle } from '@/components/shared/Icons';
import { getImageUrl } from '@/utils/imageUrl';
import { Admin_ModalPortal } from "@/features/admin/components/core/Admin_ModalPortal";

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string;
  thumbnail?: string;
  preview?: string;
  size?: number;
  created?: string;
}

interface PathSegment {
  id: string;
  name: string;
}

interface AdminDrivePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fileId: string, fileUrl: string, name: string) => void;
  title?: string;
  allowFolderSelection?: boolean;
}

// Memory cache for instantaneous navigation
const driveCache = new Map<string, any>();

export const Admin_DrivePicker: React.FC<AdminDrivePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Select Image from Drive",
  allowFolderSelection = false
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [path, setPath] = useState<PathSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null);

  const GAS_URL = process.env.NEXT_PUBLIC_GAS_DRIVE;

  const fetchFolder = useCallback(async (folderId: string | null = null) => {
    if (!GAS_URL) {
      setError("Google Apps Script URL is not configured.");
      return;
    }

      const cacheKey = folderId || 'root';
      if (driveCache.has(cacheKey)) {
        const cachedData = driveCache.get(cacheKey);
        setItems(cachedData.combinedItems);
        setPath(cachedData.path || []);
        setCurrentFolderId(cachedData.folderId);
        setIsLoading(false);
        // Continue to fetch in background to stay fresh
      } else {
        setIsLoading(true);
      }

      setError(null);
      setSelectedItem(null);
      setIsSearching(false);

    try {
      const url = new URL(GAS_URL);
      url.searchParams.append('action', 'browse');
      if (folderId) {
        url.searchParams.append('folderId', folderId);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const combinedItems: DriveItem[] = [
        ...(data.subfolders || []),
        ...(data.files || [])
      ];

      // Update cache
      driveCache.set(cacheKey, { combinedItems, path: data.path, folderId: data.folderId });

      setItems(combinedItems);
      setPath(data.path || []);
      setCurrentFolderId(data.folderId);
    } catch (err: any) {
      console.error("Drive fetch error:", err);
      setError(err.message || "Failed to load Drive contents.");
    } finally {
      setIsLoading(false);
    }
  }, [GAS_URL]);

  const searchDrive = useCallback(async (query: string) => {
    if (!GAS_URL || !query || query.length < 2) return;

    setIsLoading(true);
    setError(null);
    setSelectedItem(null);
    setIsSearching(true);

    try {
      const url = new URL(GAS_URL);
      url.searchParams.append('action', 'search');
      url.searchParams.append('query', query);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setItems(data.results || []);
    } catch (err: any) {
      console.error("Drive search error:", err);
      setError(err.message || "Search failed.");
    } finally {
      setIsLoading(false);
    }
  }, [GAS_URL]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      fetchFolder();
      setSearchQuery('');
    }
  }, [isOpen, fetchFolder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchDrive(searchQuery);
      } else if (searchQuery.length === 0 && isSearching) {
        fetchFolder(currentFolderId);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchDrive, fetchFolder, currentFolderId, isSearching]);

  const handleItemClick = (item: DriveItem) => {
    if (item.type === 'folder') {
      if (allowFolderSelection) {
        setSelectedItem(item);
      } else {
        fetchFolder(item.id);
        setSearchQuery('');
      }
    } else {
      setSelectedItem(item);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItem) {
      if (selectedItem.type === 'file') {
        const viewUrl = `https://drive.google.com/uc?export=view&id=${selectedItem.id}`;
        onSelect(selectedItem.id, viewUrl, selectedItem.name);
        onClose();
      } else if (selectedItem.type === 'folder' && allowFolderSelection) {
        onSelect(selectedItem.id, 'FOLDER', selectedItem.name);
        onClose();
      }
    }
  };

  const handleBreadcrumbClick = (id: string, index: number) => {
    // Prevent clicking current folder
    if (index === path.length - 1 && !isSearching) return;
    fetchFolder(id);
    setSearchQuery('');
  };

  return (
    <Admin_ModalPortal>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-white dark:bg-[#111] rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                  Browse Google Drive
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <IconClose size={16} />
              </button>
            </div>

            {/* Toolbar: Breadcrumbs & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 gap-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-black/5 dark:border-white/5">
              
              {/* Breadcrumbs */}
              <div className="flex items-center flex-wrap gap-2 flex-1 overflow-hidden">
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSearchQuery(''); fetchFolder(currentFolderId); }}
                      className="text-xs font-bold text-uiupc-orange hover:underline"
                    >
                      Return to Folder
                    </button>
                    <IconChevronRight size={10} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      Search Results
                    </span>
                  </div>
                ) : (
                  path.map((segment, index) => (
                    <React.Fragment key={segment.id}>
                      {index > 0 && <IconChevronRight size={10} className="text-zinc-400 shrink-0" />}
                      <button
                        onClick={() => handleBreadcrumbClick(segment.id, index)}
                        className={`text-xs font-bold truncate max-w-[120px] transition-colors ${
                          index === path.length - 1
                            ? 'text-zinc-900 dark:text-white cursor-default'
                            : 'text-zinc-500 hover:text-uiupc-orange'
                        }`}
                      >
                        {segment.name}
                      </button>
                    </React.Fragment>
                  ))
                )}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64 shrink-0">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-[#080808] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[300px] bg-zinc-50/30 dark:bg-zinc-950/30 relative">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10">
                  <IconSync size={30} className="animate-spin text-uiupc-orange mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {isSearching ? 'Searching...' : 'Loading folder...'}
                  </span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                  <IconExclamationTriangle size={40} className="text-red-500 mb-4" />
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-2">Error Accessing Drive</h3>
                  <p className="text-xs text-zinc-500">{error}</p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-300 dark:text-zinc-600 text-2xl">
                    <IconFolder size={24} />
                  </div>
                  <span className="text-xs font-bold text-zinc-500">
                    {isSearching ? 'No images found.' : 'This folder is empty.'}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-max">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      onDoubleClick={() => {
                        if (item.type === 'folder') {
                          fetchFolder(item.id);
                          setSearchQuery('');
                        }
                      }}
                      className={`
                        group relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 border-2
                        ${selectedItem?.id === item.id 
                          ? 'bg-uiupc-orange/5 border-uiupc-orange shadow-md' 
                          : 'bg-white dark:bg-[#111] border-transparent hover:border-black/5 dark:hover:border-white/5 hover:shadow-lg'
                        }
                      `}
                    >
                      {/* Thumbnail/Icon */}
                      <div className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                        {item.type === 'folder' ? (
                          <div className="relative group/folder w-full h-full flex items-center justify-center">
                            <IconFolder size={40} className="text-blue-400 group-hover:scale-110 transition-transform" />
                          </div>
                        ) : item.type === 'file' ? (
                          <img 
                            src={getImageUrl(item.id, 150, 60)} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <IconFileImage size={40} className="text-zinc-300" />
                        )}
                        
                        {/* Selection Checkmark */}
                        {selectedItem?.id === item.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-uiupc-orange rounded-full flex items-center justify-center text-white shadow-lg">
                            <IconCheckCircle size={14} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <span className="text-[10px] font-bold text-center w-full truncate text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      {item.type === 'file' && isSearching && (item as any).parentFolder && (
                        <span className="text-[9px] font-medium text-zinc-400 truncate w-full text-center mt-1">
                          in {(item as any).parentFolder}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="p-4 sm:p-6 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#111] flex items-center justify-between shrink-0">
              <div className="flex-1 truncate pr-4">
                {selectedItem ? (
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    Selected: <span className="text-uiupc-orange">{selectedItem.name}</span>
                  </p>
                ) : (
                  <p className="text-xs font-bold text-zinc-500">
                    Select an image to continue
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmSelection}
                  disabled={!selectedItem || (selectedItem.type !== 'file' && !(selectedItem.type === 'folder' && allowFolderSelection))}
                  className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-uiupc-orange text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </Admin_ModalPortal>
  );
};
