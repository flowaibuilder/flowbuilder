import React, { useContext, useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Columns, Grid, Loader2 } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText, { EditableContext } from '../EditableText';
import { uploadImageFile } from '../../utils/uploadHelper';

export default function Gallery({ content = {}, feel }) {
  const s = getStyles(feel);
  const { isEditingText, updateText } = useContext(EditableContext);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [loadingCardIndex, setLoadingCardIndex] = useState(null);

  const columns = content.columns || 3; // Default to 3 columns

  const rawItems = content.items || [
    { title: 'Modern Workspace', description: 'Clean minimal workspace designed for maximum productivity.', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
    { title: 'Meeting Lounge', description: 'Cozy collaborative meeting environments.', imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80' },
    { title: 'Executive Studio', description: 'Sophisticated private offices with modern setups.', imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80' }
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
        alert('You must keep at least one image card.');
        return;
      }
      const newItems = items.filter((_, i) => i !== index);
      updateText('items', newItems);
    }
  };

  const setColumns = (cols) => {
    if (updateText) {
      updateText('columns', cols);
    }
  };

  const renderFieldWithDelete = (path, val, fallback, className = '', Tag = 'div') => {
    const activeVal = val !== undefined ? val : fallback;
    const isEmpty = val === '';
    
    if (!isEditingText && isEmpty) return null;

    return (
      <div className="relative group/field inline-flex items-center gap-1.5 max-w-full justify-center">
        <Tag className={className}>
          <EditableText path={path} value={activeVal} />
        </Tag>
        {isEditingText && val !== '' && (
          <button
            type="button"
            onClick={() => updateText(path, '')}
            className="p-1 rounded bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover/field:opacity-100 transition-opacity cursor-pointer shrink-0"
            title="Delete text content"
          >
            <Trash2 size={8} />
          </button>
        )}
      </div>
    );
  };

  // Determine grid cols class depending on selected column style
  const gridClass = columns === 1 
    ? 'grid-cols-1' 
    : columns === 2 
    ? 'grid-cols-1 md:grid-cols-2' 
    : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Gallery Control Bar (Visible in Editor Mode) */}
        {isEditingText && (
          <div className="mx-auto max-w-3xl mb-8 p-3 bg-current/[0.05] border border-current/15 text-current rounded-xl flex flex-wrap items-center justify-between gap-4 select-none backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-65 flex items-center gap-1.5">
                <Grid size={12} className="text-[#d4f000]" /> Columns Layout
              </span>
              <div className="flex bg-current/[0.1] border border-current/5 p-0.5 rounded-lg">
                {[1, 2, 3].map(cols => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => setColumns(cols)}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      columns === cols 
                        ? 'bg-[#d4f000] text-black shadow-md' 
                        : 'text-current hover:bg-current/10'
                    }`}
                  >
                    {cols} {cols === 1 ? 'Col' : 'Cols'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Header Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-65">Header Block:</span>
                <button
                  type="button"
                  onClick={() => updateText('showHeader', content.showHeader !== false ? false : true)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer border ${
                    content.showHeader !== false 
                      ? 'bg-[#d4f000] text-black border-[#d4f000]' 
                      : 'bg-transparent text-current/80 border-current/20 hover:bg-current/5'
                  }`}
                >
                  {content.showHeader !== false ? 'Shown' : 'Hidden'}
                </button>
              </div>

              {/* Card Text & Borders Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-65">Details & Borders:</span>
                <button
                  type="button"
                  onClick={() => updateText('showCardText', content.showCardText !== false ? false : true)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer border ${
                    content.showCardText !== false 
                      ? 'bg-[#d4f000] text-black border-[#d4f000]' 
                      : 'bg-transparent text-current/80 border-current/20 hover:bg-current/5'
                  }`}
                >
                  {content.showCardText !== false ? 'Shown' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        {content.showHeader !== false && (isEditingText || 
          (content.tagline !== '' && content.tagline !== undefined) || 
          (content.title !== '' && content.title !== undefined) || 
          (content.description !== '' && content.description !== undefined)) && (
          <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
            {(isEditingText || (content.tagline !== '' && content.tagline !== undefined)) && (
              <div className="mb-4">
                {renderFieldWithDelete('tagline', content.tagline, 'Gallery Showcase', s.badge, 'span')}
              </div>
            )}
            
            {(isEditingText || (content.title !== '' && content.title !== undefined)) && (
              <h2 className="w-full flex justify-center">
                {renderFieldWithDelete('title', content.title, 'Visual Gallery & Showcase', s.heading, 'div')}
              </h2>
            )}

            {(isEditingText || (content.description !== '' && content.description !== undefined)) && (
              <div className="mt-4 text-base opacity-75 max-w-xl mx-auto leading-relaxed w-full flex justify-center">
                {renderFieldWithDelete('description', content.description, 'Explore our dynamic image collection.', 'text-center', 'div')}
              </div>
            )}
          </div>
        )}

        <div className={`grid gap-8 ${gridClass}`}>
          {items.map((item, index) => {
            const imageUrl = item.imageUrl;
            
            // Check if card has any active text content to display
            const hasTitleText = item.title !== '' && item.title !== undefined;
            const hasDescText = item.description !== '' && item.description !== undefined;
            const showCardDecorations = content.showCardText !== false && (isEditingText || hasTitleText || hasDescText);

            return (
              <div 
                key={index} 
                className={`${showCardDecorations ? s.card : ''} group flex flex-col justify-between overflow-hidden relative`}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
              >
                {isEditingText && hoveredCardIndex === index && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-40 bg-black/85 p-1.5 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
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
                  <div className={`w-full h-64 bg-gradient-to-br from-primary/10 via-current/5 to-current/10 border border-current/10 flex flex-col items-center justify-center relative overflow-hidden rounded-xl ${showCardDecorations ? 'mb-6' : ''}`}>
                    {loadingCardIndex === index ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-[#d4f000]" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">Uploading...</span>
                      </div>
                    ) : imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title || 'Gallery item'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider opacity-40">No Image Uploaded</span>
                    )}

                    {isEditingText && hoveredCardIndex === index && (
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
                          <button
                            onClick={() => removeImage(index)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {showCardDecorations && (
                    <div className="space-y-2">
                      {(isEditingText || hasTitleText) && (
                        <div className="w-full flex justify-start">
                          {renderFieldWithDelete(`items.${index}.title`, item.title, 'Image Title', 'text-lg font-bold tracking-tight text-current', 'div')}
                        </div>
                      )}
                      {(isEditingText || hasDescText) && (
                        <div className="w-full flex justify-start text-sm opacity-80 leading-relaxed">
                          {renderFieldWithDelete(`items.${index}.description`, item.description, 'Image Description details...', '', 'div')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
