import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Portfolio({ content, feel }) {
  const s = getStyles(feel);
  const items = content.items || [
    { title: 'Project Alpha', description: 'Advanced automation platform.' },
    { title: 'Project Beta', description: 'Interactive data visualization.' },
    { title: 'Project Gamma', description: 'Modern web application.' }
  ];

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              Portfolio
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Our Latest Work'} />
          </h2>
        </div>

        <div className={s.grid}>
          {items.map((item, index) => (
            <div key={index} className={s.card}>
              <div 
                className="w-full h-48 bg-current/5 border border-current/10 mb-4 flex items-center justify-center text-4xl overflow-hidden rounded-lg"
              >
                🎨
              </div>
              <h3 className="text-lg font-bold uppercase mb-2">
                <EditableText path={`items.${index}.title`} value={item.title} />
              </h3>
              <p className="text-sm opacity-80 border-t border-current/10 pt-2">
                <EditableText path={`items.${index}.description`} value={item.description} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
