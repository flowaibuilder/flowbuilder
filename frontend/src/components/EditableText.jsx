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

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [newTab, setNewTab] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [availableSections, setAvailableSections] = useState([]);

  const openActionConfig = () => {
    const isObj = value && typeof value === 'object';
    setActionType(isObj ? (value.actionType || '') : '');
    setPhone(isObj ? (value.phone || '') : '');
    setMessage(isObj ? (value.message || '') : '');
    setUrl(isObj ? (value.url || '') : '');
    setNewTab(isObj ? (value.newTab || false) : false);
    setSectionId(isObj ? (value.sectionId || '') : '');
    setShowActionModal(true);
  };

  useEffect(() => {
    if (showActionModal) {
      const sectionElements = Array.from(document.querySelectorAll('[id^="section-"]'));
      const list = sectionElements.map(el => {
        const id = el.id.replace('section-', '');
        let label = 'Unknown Section';
        
        const heading = el.querySelector('h1, h2, h3, [class*="heading"]');
        if (heading) {
          label = heading.innerText.trim();
        } else {
          const typeMatch = el.innerHTML.toLowerCase();
          if (typeMatch.includes('features')) label = 'Features Section';
          else if (typeMatch.includes('testimonials')) label = 'Testimonials Section';
          else if (typeMatch.includes('pricing')) label = 'Pricing Section';
          else if (typeMatch.includes('contact')) label = 'Contact Section';
          else if (typeMatch.includes('hero')) label = 'Hero Section';
          else if (typeMatch.includes('about')) label = 'About Section';
          else if (typeMatch.includes('portfolio')) label = 'Portfolio Section';
          else if (typeMatch.includes('faq')) label = 'FAQ Section';
        }
        
        if (label.length > 40) label = label.substring(0, 37) + '...';
        return { id, label: `${label} (${id})` };
      });
      setAvailableSections(list);
    }
  }, [showActionModal]);

  const handleTestAction = () => {
    if (actionType === 'whatsapp') {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } else if (actionType === 'scroll') {
      const el = document.getElementById(`section-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (actionType === 'link') {
      let cleanUrl = url;
      if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith('/')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveAction = () => {
    const currentVal = typeof value === 'object' ? value : { text: value };
    updateText(path, {
      ...currentVal,
      actionType,
      phone: actionType === 'whatsapp' ? phone : undefined,
      message: actionType === 'whatsapp' ? message : undefined,
      url: actionType === 'link' ? url : undefined,
      newTab: actionType === 'link' ? newTab : undefined,
      sectionId: actionType === 'scroll' ? sectionId : undefined
    });
    setShowActionModal(false);
  };

  const handleButtonClick = (e) => {
    if (value && typeof value === 'object' && value.actionType) {
      e.preventDefault();
      
      const { actionType, phone, message, sectionId, url, newTab } = value;
      
      if (actionType === 'whatsapp' && phone) {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } else if (actionType === 'scroll' && sectionId) {
        const el = document.getElementById(`section-${sectionId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          const fallbackEl = document.querySelector(`[id$="${sectionId}"]`);
          if (fallbackEl) fallbackEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (actionType === 'link' && url) {
        let cleanUrl = url;
        if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith('/')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        if (newTab) {
          window.open(cleanUrl, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = cleanUrl;
        }
      }
    }
  };


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
      let finalHref = href || '#';
      let finalTarget = undefined;
      
      if (value && typeof value === 'object' && value.actionType === 'link' && value.url) {
        finalHref = value.url;
        if (!/^https?:\/\//i.test(finalHref) && !finalHref.startsWith('/')) {
          finalHref = 'https://' + finalHref;
        }
        if (value.newTab) finalTarget = '_blank';
      }
      
      return (
        <a 
          href={finalHref} 
          target={finalTarget}
          rel={finalTarget ? 'noopener noreferrer' : undefined}
          onClick={handleButtonClick}
          className={className} 
          style={{ ...customStyles, ...positionStyles }}
        >
          {textVal}
        </a>
      );
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
          {isLink && (
            <>
              <span className="w-[1px] h-3 bg-white/10 mx-0.5" />
              <button
                type="button"
                onClick={openActionConfig}
                className="p-1 hover:bg-white/10 rounded-none text-xs font-bold flex items-center gap-1 px-1.5 text-white/85 hover:text-[#d4f000] transition-colors"
                title="Configure Button Action"
              >
                <span className="text-[8px] uppercase tracking-wider">Action</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Drag & Resize Handles */}
      {isEditingText && isSelected && (
        <>
          {/* Drag Handle */}
          <div
            onMouseDown={handleMouseDownMove}
            className="absolute -left-6 top-1/2 -translate-y-1/2 p-1.5 bg-[#09090b]/95 border border-white/20 text-white rounded-none cursor-grab active:cursor-grabbing transition-opacity z-[1001] flex items-center justify-center shadow-lg"
            title="Drag handle to reposition text"
          >
            <GripVertical size={13} className="text-[#d4f000]" />
          </div>

          {/* Resizer Handles */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'se')}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-none cursor-se-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-none cursor-sw-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-none cursor-ne-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#d4f000] border border-[#080808] rounded-none cursor-nw-resize shadow-md z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'e')}
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-1.5 h-3 bg-[#d4f000] border border-[#080808] rounded-none cursor-e-resize shadow-sm z-[1001]"
          />
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 's')}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-[#d4f000] border border-[#080808] rounded-none cursor-s-resize shadow-sm z-[1001]"
          />
        </>
      )}
      
      {/* Action Configuration Modal */}
      {showActionModal && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div className="bg-[#0f0f12] border border-white/10 w-full max-w-md rounded-none p-6 shadow-2xl text-left text-white" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg tracking-wide uppercase">Configure Action</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowActionModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">Action Type</label>
                <select 
                  value={actionType} 
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-[#16161c] border border-white/10 text-white rounded-none p-2.5 outline-none focus:border-[#d4f000] text-sm"
                >
                  <option value="">None (Static Button)</option>
                  <option value="link">Open Link</option>
                  <option value="whatsapp">Open WhatsApp Chat</option>
                  <option value="scroll">Navigate to Section</option>
                </select>
              </div>

              {actionType === 'link' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">URL / Link Address</label>
                    <input 
                      type="text" 
                      value={url} 
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="e.g. google.com or /about"
                      className="w-full bg-[#16161c] border border-white/10 text-white rounded-none p-2.5 outline-none focus:border-[#d4f000] text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="checkbox" 
                      id="newTab" 
                      checked={newTab} 
                      onChange={(e) => setNewTab(e.target.checked)}
                      className="w-4 h-4 bg-[#16161c] border border-white/10 rounded-none accent-[#d4f000]"
                    />
                    <label htmlFor="newTab" className="text-sm font-semibold cursor-pointer select-none">Open link in a new tab</label>
                  </div>
                </div>
              )}

              {actionType === 'whatsapp' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">WhatsApp Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 15550001122 (Include country code, no spaces)"
                      className="w-full bg-[#16161c] border border-white/10 text-white rounded-none p-2.5 outline-none focus:border-[#d4f000] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">Pre-filled Message</label>
                    <textarea 
                      rows={3}
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Hello, I am interested in your services!"
                      className="w-full bg-[#16161c] border border-white/10 text-white rounded-none p-2.5 outline-none focus:border-[#d4f000] text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {actionType === 'scroll' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">Select Page Section</label>
                  {availableSections.length > 0 ? (
                    <select 
                      value={sectionId} 
                      onChange={(e) => setSectionId(e.target.value)}
                      className="w-full bg-[#16161c] border border-white/10 text-white rounded-none p-2.5 outline-none focus:border-[#d4f000] text-sm"
                    >
                      <option value="">-- Choose Section --</option>
                      {availableSections.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-white/40 italic">No section elements detected on the page. Add sections or view preview mode first.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-white/10 pt-4 mt-6 gap-2">
              <button 
                type="button" 
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white text-xs font-black uppercase tracking-wider transition-colors font-bold"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveAction}
                className="px-5 py-2.5 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] text-xs font-black uppercase tracking-wider rounded-none transition-colors font-bold"
              >
                Save Action
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
