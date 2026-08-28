import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Footer({ content, feel }) {
  const s = getStyles(feel);
  const isDarkBase = ['luxury', 'futuristic', 'bold'].includes(feel);
  
  // Custom styling for Footer depending on feel
  const footerBg = isDarkBase ? 'bg-black text-white/80' : 'bg-slate-50 text-slate-600';
  const borderStyle = feel === 'bold' ? 'border-t-4 border-black' : 'border-t border-current/10';

  return (
    <footer className={`${footerBg} ${borderStyle}`}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="md:order-1 flex flex-col sm:flex-row items-center gap-6 w-full justify-between">
          <div className="text-lg font-black uppercase tracking-wider">
            <EditableText path="companyName" value={content.companyName || 'Your Company, Inc'} />
          </div>
          <p className="text-center text-xs opacity-65 leading-relaxed sm:text-right">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
