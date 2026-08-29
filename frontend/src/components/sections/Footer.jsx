import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Footer({ content = {}, feel, sections = [] }) {
  const isDarkBase = ['luxury', 'futuristic', 'bold'].includes(feel);
  const borderStyle = feel === 'bold' ? 'border-t-4 border-current' : 'border-t border-current/10';

  const defaultNavLinks = [
    { id: '1', label: 'Overview', href: '#section-1' },
    { id: '2', label: 'Features', href: '#section-2' },
    { id: '3', label: 'Pricing', href: '#section-3' },
    { id: '4', label: 'Contact', href: '#section-4' },
  ];

  const dynamicLinks = (sections || [])
    .filter(s => s && s.type && s.type !== 'footer')
    .map(s => {
      let rawLabel = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      if (s.type === 'hero' || s.type === 'home') rawLabel = 'Home';
      if (s.type === 'faq') rawLabel = 'FAQ';
      
      return {
        id: s.id,
        label: rawLabel,
        href: `#section-${s.id}`
      };
    });

  const linksToRender = dynamicLinks.length > 0 ? dynamicLinks : defaultNavLinks;
  const col1 = linksToRender.slice(0, 5);
  const col2 = linksToRender.slice(5);

  return (
    <footer className={`bg-current/[0.03] ${borderStyle} text-current font-sans transition-colors duration-300`}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-current/10">
          {/* Brand Column */}
          <div className="md:col-span-8 space-y-4">
            <div className="text-xl font-black uppercase tracking-wider">
              <EditableText path="companyName" value={content.companyName || 'Your Brand, Inc.'} />
            </div>
            <div className="text-sm opacity-70 max-w-sm leading-relaxed">
              <EditableText path="tagline" value={content.tagline || 'Crafting world-class digital experiences powered by intelligent design and high performance.'} />
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-4 space-y-3 flex flex-col items-start md:items-start text-left">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Navigation</p>
            <div className={`flex items-start justify-start text-sm opacity-80 text-left ${col2.length > 0 ? 'gap-8' : ''}`}>
              <ul className="space-y-2 flex flex-col items-start text-left">
                {col1.map(link => (
                  <li key={link.id}>
                    <a href={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {col2.length > 0 && (
                <ul className="space-y-2 flex flex-col items-start text-left">
                  {col2.map(link => (
                    <li key={link.id}>
                      <a href={link.href} className="hover:text-primary transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col items-start justify-start text-left text-xs opacity-60">
          <div className="flex flex-wrap items-center justify-start gap-1">
            <span>&copy;</span>
            <EditableText path="copyrightYear" value={content.copyrightYear || String(new Date().getFullYear())} />
            <EditableText path="companyName" value={content.companyName || 'Your Brand, Inc.'} />
            <span>. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
