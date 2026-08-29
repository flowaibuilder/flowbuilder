import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Footer({ content = {}, feel }) {
  const isDarkBase = ['luxury', 'futuristic', 'bold'].includes(feel);
  const borderStyle = feel === 'bold' ? 'border-t-4 border-current' : 'border-t border-current/10';

  return (
    <footer className={`bg-current/[0.03] ${borderStyle} text-current font-sans transition-colors duration-300`}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-current/10">
          {/* Brand Column */}
          <div className="md:col-span-8 space-y-4">
            <div className="text-xl font-black uppercase tracking-wider">
              <EditableText path="companyName" value={content.companyName || 'Your Brand, Inc.'} />
            </div>
            <p className="text-sm opacity-70 max-w-sm leading-relaxed">
              <EditableText path="tagline" value={content.tagline || 'Crafting world-class digital experiences powered by intelligent design and high performance.'} />
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-4 space-y-3 flex flex-col items-center md:items-center text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Navigation</p>
            <ul className="space-y-2 text-sm opacity-80 flex flex-col items-center text-center">
              <li><a href="#section-1" className="hover:text-primary transition-colors">Overview</a></li>
              <li><a href="#section-2" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#section-3" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#section-4" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col items-center justify-center text-center text-xs opacity-60">
          <p>
            &copy; <EditableText path="copyrightYear" value={content.copyrightYear || String(new Date().getFullYear())} /> <EditableText path="companyName" value={content.companyName || 'Your Brand, Inc.'} />. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
