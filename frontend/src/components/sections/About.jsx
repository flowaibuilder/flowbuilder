import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function About({ content, feel }) {
  const s = getStyles(feel);

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={s.card}>
            <div className="mb-4">
              <span className={s.badge}>
                <EditableText path="tagline" value={content.tagline || 'About Us'} />
              </span>
            </div>
            <h2 className={s.heading}>
              <EditableText path="title" value={content.title || 'Who we are'} />
            </h2>
            <p className="mt-6 text-sm opacity-80 leading-relaxed border-t border-current/10 pt-4">
              <EditableText path="description" value={content.description || 'We are a dedicated team committed to providing top-tier solutions.'} />
            </p>
          </div>
          
          <div className={s.card}>
            <h3 className="text-xl font-bold uppercase mb-4">Our Mission</h3>
            <p className="leading-relaxed mb-6 opacity-80 text-sm">
              <EditableText path="mission" value={content.mission || 'To push limits and set new standards in every project we deliver.'} />
            </p>
            <div className="grid grid-cols-2 gap-4 border-t border-current/10 pt-6">
              <div>
                <p className="text-3xl font-extrabold">100%</p>
                <p className="text-[10px] opacity-60 uppercase tracking-wider">Client Satisfaction</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">50+</p>
                <p className="text-[10px] opacity-60 uppercase tracking-wider">Projects Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
