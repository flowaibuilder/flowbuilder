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
      const response = await fetch('http://localhost:5000/api/refine-website', {
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
    <div className="min-h-screen bg-gray-100 pb-24" style={themeStyle}>
      <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-40 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Live Preview & Editor</h1>
          <p className="text-sm text-gray-500">Drag sections by their handles to reorder them</p>
        </div>
        <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
          Publish Website
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-white shadow-xl min-h-[800px] overflow-hidden relative">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection key={section.id} id={section.id} section={section} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Floating AI Chat Editor */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <form 
          onSubmit={handleRefine}
          className="bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center gap-2"
        >
          <div className="pl-4 pr-2 text-primary">
            <Sparkles size={20} />
          </div>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isRefining}
            placeholder="e.g. Change the hero button to say 'Join Now' and make the theme dark..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 py-2 outline-none"
          />
          <button
            type="submit"
            disabled={isRefining || !instruction.trim()}
            className="bg-primary text-white p-2.5 rounded-full hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            {isRefining ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
