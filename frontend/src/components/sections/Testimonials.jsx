import React, { useContext, useState } from 'react';
import { Star, Quote, Upload, Trash2, Camera, Copy } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText, { EditableContext } from '../EditableText';
import { uploadImageFile } from '../../utils/uploadHelper';

export default function Testimonials({ content = {}, feel }) {
  const s = getStyles(feel);
  const { isEditingText, updateText } = useContext(EditableContext);
  const [hoveredAvatarIndex, setHoveredAvatarIndex] = useState(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);

  const items = content.items || [
    { quote: 'This platform transformed our entire online presence within minutes. The aesthetic and workflow is second to none.', author: 'Jane Doe', role: 'CEO at TechCorp', company: 'TechCorp' },
    { quote: 'The interactive builder and flawless design tokens made our launch effortless and stunning.', author: 'John Smith', role: 'Founder & Product Lead', company: 'DesignHub' },
    { quote: 'Exceptional attention to detail and performance. Our conversion rates increased by 40% immediately after launch.', author: 'Elena Rostova', role: 'Head of Growth', company: 'GlobalVentures' }
  ];

  const handleAvatarChange = async (index, e) => {
    const file = e.target.files?.[0];
    if (file && updateText) {
      const fileUrl = await uploadImageFile(file);
      updateText(`items.${index}.avatarUrl`, fileUrl);
    }
  };

  const removeAvatar = (index) => {
    if (updateText) {
      updateText(`items.${index}.avatarUrl`, null);
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
              <EditableText path="tagline" value={content.tagline || 'Testimonials & Reviews'} />
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Loved by builders worldwide'} />
          </h2>
          <div className="mt-4 text-base opacity-75 max-w-xl mx-auto leading-relaxed">
            <EditableText path="description" value={content.description || 'See why forward-thinking leaders choose our platform to build their web presence.'} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {items.map((item, index) => {
            const authorText = typeof item.author === 'object' ? (item.author.text || item.author.label || '') : String(item.author || '');
            const displayAuthor = authorText || 'User';
            const initial = displayAuthor.charAt(0).toUpperCase();
            const avatarUrl = item.avatarUrl;

            return (
              <div 
                key={index} 
                className={`${s.card} flex flex-col justify-between relative group`}
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
                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star key={starIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <div className="text-base font-normal opacity-90 leading-relaxed mb-8 italic">
                    "<EditableText path={`items.${index}.quote`} value={item.quote} />"
                  </div>
                </div>

                <div className="border-t border-current/10 pt-5 flex items-center gap-3.5">
                  <div 
                    className="relative group/avatar cursor-pointer shrink-0"
                    onMouseEnter={() => setHoveredAvatarIndex(index)}
                    onMouseLeave={() => setHoveredAvatarIndex(null)}
                  >
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={displayAuthor} 
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-primary/20" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                        {initial}
                      </div>
                    )}

                    {/* Edit Avatar Controls Overlay */}
                    {isEditingText && hoveredAvatarIndex === index && (
                      <div className="absolute inset-0 bg-black/75 rounded-full flex items-center justify-center gap-1 z-30 transition-all">
                        <label className="cursor-pointer p-1 hover:text-[#d4f000] text-white transition-colors" title="Upload Avatar">
                          <Upload className="w-3.5 h-3.5" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleAvatarChange(index, e)} 
                            className="hidden" 
                          />
                        </label>
                        {avatarUrl && (
                          <button 
                            onClick={() => removeAvatar(index)} 
                            className="p-1 hover:text-red-400 text-white transition-colors"
                            title="Remove Avatar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-current">
                      <EditableText path={`items.${index}.author`} value={item.author} />
                    </div>
                    <div className="text-xs opacity-60 font-medium mt-0.5">
                      <EditableText path={`items.${index}.role`} value={item.role} />
                    </div>
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
