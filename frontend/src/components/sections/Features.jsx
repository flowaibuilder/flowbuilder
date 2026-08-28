import React from 'react';
import { Star } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Features({ content, feel }) {
  const s = getStyles(feel);
  const features = content.items || [];

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              <EditableText path="tagline" value={content.tagline || 'Features'} />
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Everything you need to succeed'} />
          </h2>
          <p className="mt-4 text-sm opacity-80 max-w-xl mx-auto">
            <EditableText path="description" value={content.description || 'Our platform provides the best tools in the industry.'} />
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-none">
          <dl className={s.grid}>
            {features.map((feature, index) => (
              <div key={index} className={s.card}>
                <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-current mb-4">
                  <div className="p-2 bg-current/5 rounded-lg text-primary border border-current/10">
                    <Star className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <EditableText path={`items.${index}.title`} value={feature.title} />
                </dt>
                <dd className="text-sm opacity-80 leading-relaxed">
                  <p>
                    <EditableText path={`items.${index}.description`} value={feature.description} />
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
