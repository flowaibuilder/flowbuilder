import React, { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import EditableText, { EditableContext } from './EditableText';

export default function FloatingImage({ image, onUpdate, onDelete, isEditable, isSelected, selectedText, onSelectText, onSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null); // 'se', 'sw', 'ne', 'nw', 'e', 's'
  
  const startPos = useRef({ x: 0, y: 0 });
  const startDim = useRef({ x: 0, y: 0, w: 0, h: 0, containerWidth: 1000 });

  const handleMouseDownMove = (e) => {
    if (!isEditable) return;
    e.stopPropagation();
    setIsDragging(true);

    const container = document.getElementById('preview-scroll-container');
    const containerWidth = container ? container.clientWidth : 1000;

    startPos.current = { x: e.clientX, y: e.clientY };
    const currentX = ((image.xPercent || 0) / 100) * containerWidth;
    startDim.current = { x: currentX, y: image.y, containerWidth };
  };

  const handleMouseDownResize = (e, direction) => {
    if (!isEditable) return;
    e.stopPropagation();
    setIsResizing(direction);

    const container = document.getElementById('preview-scroll-container');
    const containerWidth = container ? container.clientWidth : 1000;

    startPos.current = { x: e.clientX, y: e.clientY };
    const currentX = ((image.xPercent || 0) / 100) * containerWidth;
    const currentW = ((image.widthPercent || 20) / 100) * containerWidth;

    startDim.current = { 
      x: currentX, 
      y: image.y, 
      w: currentW, 
      h: image.height || 150,
      containerWidth 
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        const { x, y, containerWidth } = startDim.current;
        
        const newX = Math.max(0, x + dx);
        const xPercent = (newX / containerWidth) * 100;
        
        onUpdate({
          ...image,
          xPercent: Math.min(100 - (image.widthPercent || 20), xPercent),
          y: Math.max(0, y + dy)
        });
      } else if (isResizing) {
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;
        let { x, y, w, h, containerWidth } = startDim.current;

        if (isResizing.includes('e')) w = Math.max(50, w + dx);
        if (isResizing.includes('s')) h = Math.max(50, h + dy);
        if (isResizing.includes('w')) {
          const newW = Math.max(50, w - dx);
          if (newW !== 50) {
            x = x + dx;
            w = newW;
          }
        }
        if (isResizing.includes('n')) {
          const newH = Math.max(50, h - dy);
          if (newH !== 50) {
            y = y + dy;
            h = newH;
          }
        }

        onUpdate({
          ...image,
          xPercent: (x / containerWidth) * 100,
          y,
          widthPercent: (w / containerWidth) * 100,
          width: w,
          height: h
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
  }, [isDragging, isResizing, image, onUpdate]);

  const aspect = (image.type !== 'text' && image.width && image.height) ? `${image.width} / ${image.height}` : 'auto';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${image.xPercent || 0}%`,
        top: `${image.y}px`,
        width: `${image.widthPercent || 20}%`,
        maxWidth: '100%',
        aspectRatio: aspect,
        zIndex: image.zIndex !== undefined ? image.zIndex : 10,
        opacity: image.opacity !== undefined ? image.opacity : 1,
        filter: image.blur ? `blur(${image.blur}px)` : 'none',
      }}
      className={`floating-image-container group ${isEditable && image.type !== 'text' ? 'cursor-grab active:cursor-grabbing' : ''} ${
        isEditable && isSelected ? 'ring-2 ring-[#d4f000] ring-offset-2 ring-offset-black/50' : ''
      } ${
        image.shadow === 'soft' ? 'shadow-md' :
        image.shadow === 'medium' ? 'shadow-xl' :
        image.shadow === 'hard' ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' :
        'shadow-none'
      }`}
      onMouseDown={(e) => {
        if (isEditable && onSelect) onSelect();
        if (image.type !== 'text') {
          handleMouseDownMove(e);
        }
      }}
    >
      {isEditable && image.type === 'text' && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            if (isEditable && onSelect) onSelect();
            handleMouseDownMove(e);
          }}
          className={`absolute -left-6 top-1/2 -translate-y-1/2 p-1.5 bg-[#09090b]/95 border border-white/20 text-white rounded cursor-grab active:cursor-grabbing transition-opacity z-50 flex items-center justify-center shadow-lg ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Drag handle to reposition text widget"
        >
          <GripVertical size={13} className="text-[#d4f000]" />
        </div>
      )}
      {(!image.type || image.type === 'image') && (
        <img
          src={image.url}
          alt="Floating site asset"
          className="w-full h-full object-cover pointer-events-none"
          style={{
            borderRadius: `${image.borderRadius || 0}px`
          }}
        />
      )}

      {image.type === 'button' && (
        <div
          className="w-full h-full flex items-center justify-center font-bold px-4 text-center select-none"
          style={{
            backgroundColor: image.color || '#d4f000',
            color: image.textColor || '#000000',
            borderRadius: `${image.borderRadius || 4}px`,
            fontSize: 'inherit',
            textDecoration: 'none'
          }}
        >
          {image.text || 'Click Me'}
        </div>
      )}

      {image.type === 'text' && (
        <div className="w-full h-full p-2 select-text overflow-visible">
          {isEditable ? (
            <EditableContext.Provider value={{
              isEditingText: true,
              selectedText: selectedText,
              onSelectText: onSelectText,
              updateText: (path, newValObj) => {
                onUpdate({
                  ...image,
                  text: newValObj.text !== undefined ? newValObj.text : image.text,
                  fontFamily: newValObj.fontFamily || image.fontFamily,
                  fontSize: newValObj.fontSize || image.fontSize,
                  fontWeight: newValObj.fontWeight || image.fontWeight,
                  textAlign: newValObj.textAlign || image.textAlign
                });
              }
            }}>
              <EditableText 
                path={`float-text-${image.id}`} 
                value={{
                  text: image.text || 'Floating text block',
                  fontFamily: image.fontFamily || 'Inter',
                  fontSize: image.fontSize || 16,
                  fontWeight: image.fontWeight || '400',
                  textAlign: image.textAlign || 'left',
                  textColor: image.textColor || '#ffffff'
                }} 
                className="w-full h-full bg-transparent border-none outline-none"
              />
            </EditableContext.Provider>
          ) : (
            <div
              style={{
                color: image.textColor || '#ffffff',
                fontSize: `${image.fontSize || 16}px`,
                fontFamily: image.fontFamily || 'sans-serif',
                textAlign: image.textAlign || 'left',
                fontWeight: image.fontWeight || '400',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
              className="w-full h-full"
            >
              {image.text || 'Type your text here...'}
            </div>
          )}
        </div>
      )}

      {image.type === 'shape' && (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: image.color || '#333333',
            borderRadius: `${image.borderRadius || 0}px`,
            border: image.borderWidth ? `${image.borderWidth}px solid ${image.borderColor || '#ffffff'}` : 'none'
          }}
        />
      )}

      {isEditable && isSelected && (
        <>
          {/* Delete Button */}
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete();
            }}
            className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110 z-[60] cursor-pointer"
          >
            <Trash2 size={12} />
          </button>

          {/* Resizer Handles */}
          {/* Bottom Right */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-se-resize shadow-md z-50"
          />
          {/* Bottom Left */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-sw-resize shadow-md z-50"
          />
          {/* Top Right */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-ne-resize shadow-md z-50"
          />
          {/* Top Left */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-nw-resize shadow-md z-50"
          />
          {/* East Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1 w-1.5 h-3 bg-[#d4f000] border border-[#080808] rounded cursor-e-resize shadow-sm z-50"
          />
          {/* South Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-[#d4f000] border border-[#080808] rounded cursor-s-resize shadow-sm z-50"
          />
        </>
      )}
    </div>
  );
}
