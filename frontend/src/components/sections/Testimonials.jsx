import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Testimonials({ content, feel }) {
  const s = getStyles(feel);
  const items = content.items || [
    { quote: 'This platform transformed our online presence instantly!', author: 'Jane Doe', role: 'CEO at TechCorp' },
    { quote: 'The aesthetic and smart setup is exactly what we needed.', author: 'John Smith', role: 'Founder of DesignHub' }
  ];

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              Testimonials
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Loved by builders'} />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <div key={index} className={s.card}>
              <p className="text-base font-medium italic mb-6">
                "<EditableText path={`items.${index}.quote`} value={item.quote} />"
              </p>
              <div className="border-t border-current/10 pt-4">
                <p className="font-bold text-sm uppercase">
                  <EditableText path={`items.${index}.author`} value={item.author} />
                </p>
                <p className="text-xs opacity-60 mt-0.5">
                  <EditableText path={`items.${index}.role`} value={item.role} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
