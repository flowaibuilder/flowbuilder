import React, { useRef, useState, useEffect } from 'react';

export default function EditableImage({ image, onUpdateImage, isEditable }) {
  const containerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const startWidth = useRef(0);
  const startX = useRef(0);

  if (!image || !image.url) return null;

  const handleMouseDown = (e) => {
    if (!isEditable) return;
    e.preventDefault();
    setIsResizing(true);
    startWidth.current = image.width || 400;
    startX.current = e.clientX;
    document.body.style.cursor = 'se-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const deltaX = e.clientX - startX.current;
      const newWidth = Math.max(150, Math.min(800, startWidth.current + deltaX));
      onUpdateImage({
        ...image,
        width: newWidth
      });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default';
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, image, onUpdateImage]);

  return (
    <div 
      ref={containerRef}
      className="relative group inline-block"
      style={{
        width: image.width ? `${image.width}px` : '100%',
        maxWidth: '100%',
      }}
    >
      <img 
        src={image.url} 
        alt="Editable section asset" 
        style={{
          width: '100%',
          borderRadius: image.borderRadius ? `${image.borderRadius}px` : '8px',
          aspectRatio: image.aspectRatio !== 'auto' ? image.aspectRatio : undefined
        }}
        className="object-cover shadow-2xl border border-white/10"
      />
      
      {isEditable && (
        <div 
          onMouseDown={handleMouseDown}
          className="absolute bottom-2 right-2 w-4 h-4 bg-[#d4f000] hover:bg-[#b8d000] border-2 border-[#080808] rounded-full cursor-se-resize shadow-lg flex items-center justify-center transition-all z-50 scale-125 hover:scale-150"
          title="Drag to resize"
        >
          <div className="w-1.5 h-1.5 bg-[#080808] rounded-full" />
        </div>
      )}
    </div>
  );
}
