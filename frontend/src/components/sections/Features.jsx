import React, { useContext, useState } from 'react';
import { Zap, ShieldCheck, Layers, Cpu, Sparkles, BarChart3, Copy, Trash2 } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText, { EditableContext } from '../EditableText';

const ICONS = [Zap, ShieldCheck, Layers, Cpu, Sparkles, BarChart3];

export default function Features({ content = {}, feel }) {
  const s = getStyles(feel);
  const { isEditingText, updateText } = useContext(EditableContext);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);

  const features = content.items || [
    { title: 'Lightning Speed', description: 'Engineered for extreme performance and instantaneous load times across all devices.' },
    { title: 'Bank-Grade Security', description: 'Enterprise encryption and real-time privacy protocols safeguarding every asset.' },
    { title: 'Seamless Workflow', description: 'Intuitive drag-and-drop tools and real-time synchronization built for modern teams.' }
  ];

  const duplicateItem = (index) => {
    if (updateText) {
      const newItems = [...features];
      const cloned = JSON.parse(JSON.stringify(newItems[index]));
      newItems.splice(index + 1, 0, cloned);
      updateText('items', newItems);
    }
  };

  const deleteItem = (index) => {
    if (updateText) {
      if (features.length <= 1) {
        alert('You must keep at least one card.');
        return;
      }
      const newItems = features.filter((_, i) => i !== index);
      updateText('items', newItems);
    }
  };

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              <EditableText path="tagline" value={content.tagline || 'Core Features'} />
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Everything you need to succeed'} />
          </h2>
          <div className="mt-4 text-base opacity-75 max-w-xl mx-auto leading-relaxed">
            <EditableText path="description" value={content.description || 'Our platform provides the best-in-class tools and intelligent automation.'} />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-none">
          <div className={s.grid}>
            {features.map((feature, index) => {
              const IconComp = ICONS[index % ICONS.length];
              return (
                <div 
                  key={index} 
                  className={`${s.card} flex flex-col justify-between group relative`}
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <IconComp className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-current mb-3">
                      <EditableText path={`items.${index}.title`} value={feature.title} />
                    </h3>
                    <div className="text-sm opacity-80 leading-relaxed">
                      <EditableText path={`items.${index}.description`} value={feature.description} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
