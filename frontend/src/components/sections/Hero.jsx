import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Hero({ content = {}, feel }) {
  const s = getStyles(feel);

  const customContainerStyle = {};
  if (content.bgColor) customContainerStyle.backgroundColor = content.bgColor;
  if (content.textColor) customContainerStyle.color = content.textColor;

  // Harvest all possible button definitions from content
  const getButtonsList = () => {
    const rawArr = content.buttons || content.extraButtons;
    if (Array.isArray(rawArr) && rawArr.length > 0) {
      const items = [];
      if (content.ctaText && !rawArr.some(b => (b.text || b) === content.ctaText)) {
        items.push({ text: content.ctaText, isSecondary: false, path: 'ctaText' });
      }
      rawArr.forEach((b, idx) => {
        const text = typeof b === 'object' ? (b.text || b.label || 'Click Here') : String(b);
        const path = `buttons.${idx}.text`;
        items.push({ text, isSecondary: items.length > 0, path });
      });
      return items;
    }

    const items = [];
    const keysToTry = [
      'ctaText', 'secondaryCtaText', 'thirdCtaText', 'tertiaryCtaText',
      'ctaText2', 'ctaText3', 'ctaText4', 'ctaText5',
      'cta2Text', 'cta3Text', 'cta4Text', 'cta5Text',
      'button1', 'button2', 'button3', 'button4', 'button5'
    ];

    keysToTry.forEach((key) => {
      const val = content[key];
      if (val) {
        const text = typeof val === 'object' ? (val.text || val.label || '') : String(val);
        if (text && !items.some(i => i.text === text)) {
          items.push({
            text,
            isSecondary: items.length > 0,
            path: key
          });
        }
      }
    });

    if (items.length > 0) return items;

    return [{ text: 'Get Started', isSecondary: false, path: 'ctaText' }];
  };

  const buttonsList = getButtonsList();

  return (
    <div className={s.container} style={customContainerStyle}>
      <div className="mx-auto max-w-3xl text-center flex flex-col items-center py-12">
        <h1 className={s.heading}>
          <EditableText path="headline" value={content.headline || 'Creative Design Reimagined'} />
        </h1>
        <p className={`mt-6 ${s.body}`}>
          <EditableText path="subheadline" value={content.subheadline || 'We build stunning web projects with cutting edge aesthetic and smart interactions.'} />
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {buttonsList.map((btn, index) => (
            <EditableText
              key={index}
              path={btn.path || `buttons.${index}.text`}
              value={btn.text}
              className={btn.isSecondary || index > 0 ? s.buttonSec : s.button}
              isLink
              href="#"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
