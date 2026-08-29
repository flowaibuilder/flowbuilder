import React, { useState, useContext } from 'react';
import { ChevronDown, HelpCircle, Copy, Trash2 } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText, { EditableContext } from '../EditableText';

export default function FAQ({ content = {}, feel }) {
  const s = getStyles(feel);
  const { isEditingText, updateText } = useContext(EditableContext);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);

  const items = content.items || [
    { question: 'How quickly can I launch my website?', answer: 'You can generate and publish your fully customized, production-ready website in under 60 seconds using our AI builder.' },
    { question: 'Can I customize the design, colors, and layout later?', answer: 'Yes! Every section, color palette, typography token, and text block is 100% editable in real time with our live visual builder.' },
    { question: 'Is the website optimized for mobile and SEO?', answer: 'Absolutely. Every generated site is fully responsive, lightweight, accessible, and optimized with semantic HTML and metadata for search engines.' },
    { question: 'Can I connect my own custom domain?', answer: 'Yes, you can easily link your custom domain or publish instantly with our high-speed global CDN hosting.' }
  ];

  const [openIndices, setOpenIndices] = useState([0]); // First item open by default

  const toggleItem = (idx) => {
    setOpenIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
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
              <EditableText path="tagline" value={content.tagline || 'Frequently Asked Questions'} />
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Everything You Need to Know'} />
          </h2>
          <div className="mt-4 text-base opacity-75 max-w-xl mx-auto leading-relaxed">
            <EditableText path="description" value={content.description || 'Have questions? Here are clear answers to the most common questions.'} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div 
                key={index} 
                className={`${s.card} transition-all duration-200 cursor-pointer select-none relative`}
                onClick={() => toggleItem(index)}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
              >
                {isEditingText && hoveredCardIndex === index && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-40 bg-black/80 p-1.5 rounded-lg border border-white/10 shadow-xl backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
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
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-current">
                    <EditableText path={`items.${index}.question`} value={item.question} />
                  </h3>
                  <div className={`p-1 rounded-full bg-current/5 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-current/10 text-sm sm:text-base opacity-80 leading-relaxed">
                    <EditableText path={`items.${index}.answer`} value={item.answer} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
