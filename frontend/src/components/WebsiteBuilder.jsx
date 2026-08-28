import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles, Send, Loader2 } from 'lucide-react';

import Hero from './sections/Hero';
import Features from './sections/Features';
import Pricing from './sections/Pricing';
import Footer from './sections/Footer';

const SectionComponents = {
  hero: Hero,
  features: Features,
  pricing: Pricing,
  footer: Footer,
};

function SortableSection({ id, section }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Component = SectionComponents[section.type];

  if (!Component) return null;

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity border border-gray-200"
      >
        <GripVertical size={20} className="text-gray-500" />
      </div>
      
      <div className="hover:ring-2 hover:ring-primary hover:ring-inset transition-shadow relative z-0">
        <Component content={section.content || {}} />
      </div>
    </div>
  );
}

export default function WebsiteBuilder({ initialSpec, theme }) {
  const [sections, setSections] = useState(
    (initialSpec || []).map((s, idx) => ({ ...s, id: s.id || `section-${idx}` }))
  );
  
  const [instruction, setInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRefine = async (e) => {
    e.preventDefault();
    if (!instruction.trim()) return;

    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSpec: sections, instruction }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Preserve IDs if possible, else assign new
      const newSections = data.spec.map((s, idx) => {
        const existing = sections.find(old => old.id === s.id);
        return { ...s, id: existing ? existing.id : `section-new-${Date.now()}-${idx}` };
      });
      setSections(newSections);
      setInstruction('');
    } catch (err) {
      console.error('Refinement failed:', err);
      alert('Failed to apply changes: ' + err.message);
    } finally {
      setIsRefining(false);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No sections to display. Please generate a website first.
      </div>
    );
  }

  // Inject the custom theme variables inline so the Tailwind classes pick them up
  const themeStyle = theme ? {
    '--color-primary': theme.primary,
    '--color-secondary': theme.secondary,
    '--color-bg-base': theme.background,
  } : {};

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#080808]" style={themeStyle}>
      {/* Left Sidebar */}
      <div className="w-80 bg-[#121212] border-r border-white/10 flex flex-col shadow-2xl relative z-10">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white tracking-wide uppercase mb-1">Live Preview</h1>
          <p className="text-xs text-white/50 tracking-wider">Drag sections by their handles to reorder</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-[#d4f000]" /> AI Assistant
            </h3>
            <p className="text-sm text-white/40 mb-4 leading-relaxed">
              Tell the AI what you want to change. It can modify content, swap sections, or adjust styling based on your prompt.
            </p>
            <form 
              onSubmit={handleRefine}
              className="flex flex-col gap-3"
            >
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={isRefining}
                rows={5}
                placeholder="e.g. Change the hero button to say 'Join Now' and make it larger..."
                className="w-full bg-white/5 border border-white/10 focus:border-[#d4f000] focus:ring-0 text-white placeholder-white/30 p-3 outline-none text-sm resize-none transition-colors"
              />
              <button
                type="submit"
                disabled={isRefining || !instruction.trim()}
                className="bg-[#d4f000] text-[#080808] p-3 font-bold uppercase tracking-wider text-xs hover:bg-[#b8d000] disabled:bg-white/10 disabled:text-white/30 transition-colors flex items-center justify-center gap-2"
              >
                {isRefining ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isRefining ? 'Refining...' : 'Apply Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex flex-col gap-3">
          <button className="w-full bg-[#d4f000] hover:bg-[#b8d000] text-[#080808] px-6 py-3 rounded-none font-bold text-sm uppercase tracking-wider transition-colors">
            Publish Website
          </button>
          <button 
            onClick={() => window.location.href = '/tools'}
            className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white px-6 py-3 rounded-none font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Exit Editor
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto relative" style={{ backgroundColor: 'var(--color-bg-base, #ffffff)' }}>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-full w-full">
              {sections.map((section) => (
                <SortableSection key={section.id} id={section.id} section={section} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
