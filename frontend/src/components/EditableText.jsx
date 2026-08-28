import React, { createContext, useContext, useRef } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Bold, Type } from 'lucide-react';

export const EditableContext = createContext({
  isEditingText: false,
  isMediaMode: false,
  selectedText: null,
  onSelectText: () => {},
  updateText: () => {},
  updateImage: () => {},
});

export default function EditableText({ path, value, className = '', isLink = false, href = '#' }) {
  const { isEditingText, updateText, selectedText, onSelectText } = useContext(EditableContext);
  const elementRef = useRef(null);

  const textVal = (value && typeof value === 'object') ? (value.text || '') : (value || '');
  
  const customStyles = (value && typeof value === 'object') ? {
    fontSize: value.fontSize ? `${value.fontSize}px` : undefined,
    fontFamily: value.fontFamily,
    textAlign: value.textAlign,
    fontWeight: value.fontWeight,
  } : {};

  if (!isEditingText) {
    if (isLink) {
      return <a href={href} className={className} style={customStyles}>{textVal}</a>;
    }
    return <span className={className} style={customStyles}>{textVal}</span>;
  }

  const handleBlur = () => {
    if (elementRef.current) {
      const newText = elementRef.current.innerText.trim();
      const currentVal = typeof value === 'object' ? value : { text: value };
      updateText(path, {
        ...currentVal,
        text: newText
      });
    }
  };

  const handleFocus = () => {
    if (onSelectText) {
      onSelectText(path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      elementRef.current.blur();
    }
  };

  const updateStyleVal = (key, val) => {
    const currentValObj = (value && typeof value === 'object') ? value : { text: String(value) };
    updateText(path, {
      ...currentValObj,
      [key]: val
    });
  };

  const handleDecreaseSize = () => {
    const currentSize = (value && typeof value === 'object' && value.fontSize) ? value.fontSize : 16;
    updateStyleVal('fontSize', Math.max(10, currentSize - 2));
  };

  const handleIncreaseSize = () => {
    const currentSize = (value && typeof value === 'object' && value.fontSize) ? value.fontSize : 16;
    updateStyleVal('fontSize', Math.min(100, currentSize + 2));
  };

  const toggleBold = () => {
    const currentWeight = (value && typeof value === 'object' && value.fontWeight) ? value.fontWeight : '400';
    updateStyleVal('fontWeight', currentWeight === '800' ? '400' : '800');
  };

  const cycleFont = () => {
    const families = ['Inter', 'Outfit', "'Playfair Display'", "'Courier Prime'"];
    const currentFamily = (value && typeof value === 'object' && value.fontFamily) ? value.fontFamily : 'Inter';
    const currentIndex = families.indexOf(currentFamily);
    const nextFamily = families[(currentIndex + 1) % families.length];
    updateStyleVal('fontFamily', nextFamily);
  };

  const isSelected = selectedText && selectedText.path === path;

  return (
    <span className="relative inline-block">
      <span
        ref={elementRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          e.stopPropagation();
          handleFocus();
        }}
        className={`${className} outline-none px-1 rounded cursor-text border border-dashed transition-all ${
          isSelected 
            ? 'ring-2 ring-[#d4f000] border-transparent bg-white/10' 
            : 'border-[#d4f000]/30 hover:border-[#d4f000]'
        }`}
        style={{ 
          display: 'inline-block', 
          minWidth: '1ch',
          ...customStyles
        }}
      >
        {textVal}
      </span>

      {/* Floating Hover Toolbar */}
      {isEditingText && isSelected && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#121212]/95 border border-white/10 text-white rounded-md shadow-2xl flex items-center gap-1 p-1 z-[999] select-none backdrop-blur-md"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Font Cycle Button */}
          <button
            type="button"
            onClick={cycleFont}
            className="p-1 hover:bg-white/10 rounded text-xs font-bold flex items-center gap-1 px-1.5 text-white/80 hover:text-[#d4f000] transition-colors"
            title="Cycle Font Style"
          >
            <Type size={11} />
            <span className="text-[8px] uppercase tracking-wider">
              {((value && typeof value === 'object' && value.fontFamily) ? value.fontFamily : 'Inter').replace(/'/g, '').split(' ')[0]}
            </span>
          </button>

          <span className="w-[1px] h-3 bg-white/10 mx-0.5" />

          {/* Size decrease */}
          <button
            type="button"
            onClick={handleDecreaseSize}
            className="p-1 hover:bg-white/10 rounded text-white/80 hover:text-[#d4f000] text-[9px] font-black w-5 h-5 flex items-center justify-center transition-colors"
            title="Decrease Text Size"
          >
            A-
          </button>

          {/* Size Indicator */}
          <span className="text-[9px] font-black text-white/50 px-0.5 min-w-[24px] text-center">
            {((value && typeof value === 'object' && value.fontSize) ? value.fontSize : 16)}
          </span>

          {/* Size increase */}
          <button
            type="button"
            onClick={handleIncreaseSize}
            className="p-1 hover:bg-white/10 rounded text-white/80 hover:text-[#d4f000] text-[9px] font-black w-5 h-5 flex items-center justify-center transition-colors"
            title="Increase Text Size"
          >
            A+
          </button>

          <span className="w-[1px] h-3 bg-white/10 mx-0.5" />

          {/* Bold Button */}
          <button
            type="button"
            onClick={toggleBold}
            className={`p-1 hover:bg-white/10 rounded w-5 h-5 flex items-center justify-center transition-all ${
              (value && typeof value === 'object' && value.fontWeight === '800') ? 'text-[#d4f000]' : 'text-white/80'
            }`}
            title="Toggle Bold"
          >
            <Bold size={11} />
          </button>

          <span className="w-[1px] h-3 bg-white/10 mx-0.5" />

          {/* Align Left */}
          <button
            type="button"
            onClick={() => updateStyleVal('textAlign', 'left')}
            className={`p-1 hover:bg-white/10 rounded w-5 h-5 flex items-center justify-center transition-all ${
              (value && typeof value === 'object' && value.textAlign === 'left') ? 'text-[#d4f000]' : 'text-white/80'
            }`}
            title="Align Left"
          >
            <AlignLeft size={11} />
          </button>

          {/* Align Center */}
          <button
            type="button"
            onClick={() => updateStyleVal('textAlign', 'center')}
            className={`p-1 hover:bg-white/10 rounded w-5 h-5 flex items-center justify-center transition-all ${
              (value && typeof value === 'object' && value.textAlign === 'center') ? 'text-[#d4f000]' : 'text-white/80'
            }`}
            title="Align Center"
          >
            <AlignCenter size={11} />
          </button>

          {/* Align Right */}
          <button
            type="button"
            onClick={() => updateStyleVal('textAlign', 'right')}
            className={`p-1 hover:bg-white/10 rounded w-5 h-5 flex items-center justify-center transition-all ${
              (value && typeof value === 'object' && value.textAlign === 'right') ? 'text-[#d4f000]' : 'text-white/80'
            }`}
            title="Align Right"
          >
            <AlignRight size={11} />
          </button>
        </div>
      )}
    </span>
  );
}
