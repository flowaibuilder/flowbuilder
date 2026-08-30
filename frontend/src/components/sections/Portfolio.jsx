import React, { useContext, useState, useEffect } from 'react';
import { ExternalLink, Layers, Upload, Trash2, Image, Copy, Loader2 } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText, { EditableContext } from '../EditableText';
import { uploadImageFile } from '../../utils/uploadHelper';

export default function Portfolio({ content = {}, feel }) {
  const s = getStyles(feel);
  const { isEditingText, updateText } = useContext(EditableContext);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [loadingCardIndex, setLoadingCardIndex] = useState(null);

  const rawItems = content.items || [
    { title: 'Project Nexus', category: 'Web App & AI', description: 'Next-generation intelligent automation platform with real-time sync.' },
    { title: 'Aura Analytics', category: 'Data & Dashboard', description: 'Interactive metrics visualization engine designed for modern enterprises.' },
    { title: 'Vanguard OS', category: 'Design System', description: 'Comprehensive design system and components for high-velocity teams.' }
  ];
  const items = Array.isArray(rawItems) ? rawItems : Object.values(rawItems);

  useEffect(() => {
    if (!content.items && updateText) {
      updateText('items', rawItems);
    }
  }, [content.items, updateText]);

  const handleImageChange = async (index, e) => {
    const file = e.target.files?.[0];
    if (file && updateText) {
      setLoadingCardIndex(index);
      try {
        const fileUrl = await uploadImageFile(file);
        updateText(`items.${index}.imageUrl`, fileUrl);
      } catch (err) {
        console.error("Image upload failed", err);
      } finally {
        setLoadingCardIndex(null);
      }
    }
  };

  const toggleFit = (index, currentFit) => {
    if (updateText) {
      const nextFit = currentFit === 'contain' ? 'cover' : 'contain';
      updateText(`items.${index}.imageFit`, nextFit);
    }
  };

  const removeImage = (index) => {
    if (updateText) {
      updateText(`items.${index}.imageUrl`, null);
    }
  };

  const duplicateItem = (index) => {
    if (updateText) {
      const newItems = [...items];
      const cloned = JSON.parse(JSON.stringify(newItems[index]));
      newItems.splice(index + 1, 0, cloned);
      updateText('items', newItems);
    }
  };

  const deleteItem = (index) => {
    if (updateText) {
      if (items.length <= 1) {
        alert('You must keep at least one card.');
        return;
      }
      const newItems = items.filter((_, i) => i !== index);
      updateText('items', newItems);
    }
  };

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              <EditableText path="tagline" value={content.tagline || 'Selected Portfolio'} />
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Our Latest Work & Case Studies'} />
          </h2>
          <div className="mt-4 text-base opacity-75 max-w-xl mx-auto leading-relaxed">
            <EditableText path="description" value={content.description || 'Explore our latest showcase of handcrafted projects and digital products.'} />
          </div>
        </div>

        <div className={s.grid}>
          {items.map((item, index) => {
            const imageUrl = item.imageUrl;
            const imageFit = item.imageFit || 'cover';

            return (
              <div 
                key={index} 
                className={`${s.card} group flex flex-col justify-between overflow-hidden relative`}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
              >
                {isEditingText && hoveredCardIndex === index && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-40 bg-black/80 p-1.5 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); duplicateItem(index); }}
                      className="p-1 text-white hover:text-[#d4f000] hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Duplicate Card"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteItem(index); }}
                      className="p-1 text-white hover:text-red-400 hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div>
                  {/* Visual Project Thumbnail */}
                  <div className="w-full h-52 bg-gradient-to-br from-primary/20 via-current/5 to-current/10 border border-current/10 mb-6 flex flex-col items-center justify-center relative overflow-hidden rounded-xl group-hover:border-primary/50 transition-all duration-300">
                    {loadingCardIndex === index ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-[#d4f000]" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Uploading...</span>
                      </div>
                    ) : imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title || 'Portfolio item'}
                        className={`w-full h-full ${imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
                      />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Layers className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                          {item.category || 'Featured Project'}
                        </span>
                      </>
                    )}

                    {/* Live Editing Overlay Controls */}
                    {isEditingText && hoveredCardIndex === index ? (
                      <div className="absolute inset-0 bg-black/80 flex flex-col gap-2 items-center justify-center p-3 z-30 transition-all duration-200">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#d4f000] text-black shadow-lg hover:scale-105 transition-transform">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="hidden"
                          />
                        </label>
                        
                        {imageUrl && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleFit(index, imageFit)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                              Fit: {imageFit === 'contain' ? 'Contain' : 'Cover'}
                            </button>
                            <button
                              onClick={() => removeImage(index)}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="w-full px-2 mt-1">
                          <input
                            type="text"
                            placeholder="Redirect URL (e.g. https://...)"
                            value={item.linkUrl || ''}
                            onChange={(e) => updateText(`items.${index}.linkUrl`, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 outline-none focus:border-[#d4f000] focus:ring-1 focus:ring-[#d4f000] font-sans text-center"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Standard Preview Hover Overlay */
                      item.linkUrl && item.linkUrl.trim() !== '' ? (
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-black shadow-lg">
                            View Project <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        </a>
                      ) : null
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary opacity-90">
                      <EditableText path={`items.${index}.category`} value={item.category || 'Case Study'} />
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-current mb-2">
                    <EditableText path={`items.${index}.title`} value={item.title} />
                  </h3>
                  <div className="text-sm opacity-80 leading-relaxed">
                    <EditableText path={`items.${index}.description`} value={item.description} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
