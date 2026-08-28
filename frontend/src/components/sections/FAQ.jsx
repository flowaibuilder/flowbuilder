import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function FAQ({ content, feel }) {
  const s = getStyles(feel);
  const items = content.items || [
    { question: 'How does it work?', answer: 'Simply fill out the questionnaire and AI handles the generation.' },
    { question: 'Can I customize the code?', answer: 'Yes, everything is fully modular and configurable.' }
  ];

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              FAQ
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Frequently Asked Questions'} />
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {items.map((item, index) => (
            <div key={index} className={s.card}>
              <h3 className="text-base font-bold uppercase mb-2">
                <EditableText path={`items.${index}.question`} value={item.question} />
              </h3>
              <p className="text-sm opacity-80 border-t border-current/10 pt-2">
                <EditableText path={`items.${index}.answer`} value={item.answer} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
