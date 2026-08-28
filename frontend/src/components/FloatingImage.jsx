import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function FloatingImage({ image, onUpdate, onDelete, isEditable, isSelected, onSelect }) {
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

  const aspect = image.width && image.height ? `${image.width} / ${image.height}` : 'auto';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${image.xPercent || 0}%`,
        top: `${image.y}px`,
        width: `${image.widthPercent || 20}%`,
        aspectRatio: aspect,
        zIndex: isEditable ? (isSelected ? 100 : 99) : 10,
      }}
      className={`floating-image-container group ${isEditable ? 'cursor-grab active:cursor-grabbing' : ''} ${
        isEditable && isSelected ? 'ring-2 ring-[#d4f000]' : ''
      }`}
      onMouseDown={(e) => {
        handleMouseDownMove(e);
        if (isEditable && onSelect) onSelect();
      }}
    >
      <img
        src={image.url}
        alt="Floating site asset"
        className="w-full h-full object-cover shadow-2xl pointer-events-none"
        style={{
          borderRadius: `${image.borderRadius || 0}px`
        }}
      />

      {isEditable && isSelected && (
        <>
          {/* Delete Button */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onDelete}
            className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110 z-50 cursor-pointer"
          >
            <Trash2 size={12} />
          </button>

          {/* Resizer Handles */}
          {/* Bottom Right */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-se-resize shadow-md"
          />
          {/* Bottom Left */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-sw-resize shadow-md"
          />
          {/* Top Right */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-ne-resize shadow-md"
          />
          {/* Top Left */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-full cursor-nw-resize shadow-md"
          />
          {/* East Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1 w-1.5 h-3 bg-[#d4f000] border border-[#080808] rounded cursor-e-resize shadow-sm"
          />
          {/* South Edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-[#d4f000] border border-[#080808] rounded cursor-s-resize shadow-sm"
          />
        </>
      )}
    </div>
  );
}
