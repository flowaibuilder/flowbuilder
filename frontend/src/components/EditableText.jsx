import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Bold, Type, GripVertical } from 'lucide-react';

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

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null);
  const startDragPos = useRef({ x: 0, y: 0 });
  const startDimensions = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const textVal = (value && typeof value === 'object') ? (value.text || '') : (value || '');
  
  const customStyles = (value && typeof value === 'object') ? {
    fontSize: value.fontSize ? `${value.fontSize}px` : undefined,
    fontFamily: value.fontFamily,
    textAlign: value.textAlign,
    fontWeight: value.fontWeight,
    color: value.color || value.textColor,
  } : {};

  const hasCoordinates = value && typeof value === 'object' && value.x !== undefined && value.y !== undefined;
  const positionStyles = hasCoordinates ? {
    position: 'absolute',
    left: `${value.x}px`,
    top: `${value.y}px`,
    width: value.w ? `${value.w}px` : 'auto',
    height: value.h ? `${value.h}px` : 'auto',
    zIndex: 40,
  } : {};

  const handleMouseDownMove = (e) => {
    if (!isEditingText) return;
    e.stopPropagation();
    setIsDragging(true);

    const container = elementRef.current?.closest('[id^="section-"]');
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
    const rect = elementRef.current ? elementRef.current.getBoundingClientRect() : { left: 0, top: 0, width: 100, height: 30 };

    startDragPos.current = { x: e.clientX, y: e.clientY };
    const currentX = hasCoordinates ? value.x : (rect.left - containerRect.left);
    const currentY = hasCoordinates ? value.y : (rect.top - containerRect.top);

    startDimensions.current = { x: currentX, y: currentY, w: rect.width, h: rect.height };
  };

  const handleMouseDownResize = (e, direction) => {
    if (!isEditingText) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(direction);

    const container = elementRef.current?.closest('[id^="section-"]');
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
    const rect = elementRef.current ? elementRef.current.getBoundingClientRect() : { left: 0, top: 0, width: 100, height: 30 };

    startDragPos.current = { x: e.clientX, y: e.clientY };
    const currentX = hasCoordinates ? value.x : (rect.left - containerRect.left);
    const currentY = hasCoordinates ? value.y : (rect.top - containerRect.top);
    const currentW = (value && typeof value === 'object' && value.w !== undefined) ? value.w : rect.width;
    const currentH = (value && typeof value === 'object' && value.h !== undefined) ? value.h : rect.height;

    startDimensions.current = { x: currentX, y: currentY, w: currentW, h: currentH };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - startDragPos.current.x;
        const dy = e.clientY - startDragPos.current.y;
        const { x, y } = startDimensions.current;
        
        const currentValObj = (value && typeof value === 'object') ? value : { text: String(value) };
        updateText(path, {
          ...currentValObj,
          x: Math.round(x + dx),
          y: Math.round(y + dy)
        });
      } else if (isResizing) {
        const dx = e.clientX - startDragPos.current.x;
        const dy = e.clientY - startDragPos.current.y;
        let { x, y, w, h } = startDimensions.current;

        if (isResizing.includes('e')) w = Math.max(20, w + dx);
        if (isResizing.includes('s')) h = Math.max(20, h + dy);
        if (isResizing.includes('w')) {
          const newW = Math.max(20, w - dx);
          if (newW !== 20) {
            x = x + dx;
            w = newW;
          }
        }
        if (isResizing.includes('n')) {
          const newH = Math.max(20, h - dy);
          if (newH !== 20) {
            y = y + dy;
            h = newH;
          }
        }

        const currentValObj = (value && typeof value === 'object') ? value : { text: String(value) };
        updateText(path, {
          ...currentValObj,
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(w),
          h: Math.round(h)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, value, path, updateText, hasCoordinates]);

  if (!isEditingText) {
    if (isLink) {
      return <a href={href} className={className} style={{ ...customStyles, ...positionStyles }}>{textVal}</a>;
    }
    return <span className={className} style={{ ...customStyles, ...positionStyles }}>{textVal}</span>;
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

  const isAligned = !!customStyles.textAlign;

  return (
    <span 
      className={`relative ${isAligned ? 'block w-full' : 'inline-block'} ${
        isEditingText && isSelected ? 'ring-2 ring-[#d4f000] ring-offset-2 ring-offset-black/50 z-50' : ''
      }`}
      style={{
        ...positionStyles,
        display: isAligned ? 'block' : 'inline-block',
      }}
    >
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
            ? 'border-transparent bg-white/10' 
            : 'border-[#d4f000]/30 hover:border-[#d4f000]'
        }`}
        style={{ 
          display: isAligned ? 'block' : 'inline-block', 
          width: '100%',
          height: '100%',
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

      {/* Drag & Resize Handles */}
      {isEditingText && isSelected && (
        <>
          {/* Drag Handle */}
          <div
            onMouseDown={handleMouseDownMove}
            className="absolute -left-6 top-1/2 -translate-y-1/2 p-1.5 bg-[#09090b]/95 border border-white/20 text-white rounded cursor-grab active:cursor-grabbing transition-opacity z-[1001] flex items-center justify-center shadow-lg"
            title="Drag handle to reposition text"
          >
            <GripVertical size={13} className="text-[#d4f000]" />
          </div>

          {/* Resizer Handles */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-se-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-sw-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-ne-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-nw-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-1.5 h-3 bg-[#d4f000] border border-[#080808] rounded cursor-e-resize shadow-sm z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-[#d4f000] border border-[#080808] rounded cursor-s-resize shadow-sm z-[1001]"
          />
        </>
      )}
    </span>
  );
}
