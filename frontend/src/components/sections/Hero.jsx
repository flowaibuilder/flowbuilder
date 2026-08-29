import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import { Sparkles } from 'lucide-react';
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
    <div className={`${s.container} relative overflow-hidden`} style={customContainerStyle}>
      {/* Subtle ambient lighting effect */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: 'var(--color-primary, #3b82f6)' }}
      />

      <div className="mx-auto max-w-4xl text-center flex flex-col items-center py-16 sm:py-20 relative z-10">
        {/* Top Tagline / Trust Pill */}
        <div className="mb-6">
          <span className={s.subheading}>
            <Sparkles className="w-3.5 h-3.5" />
            <EditableText path="tagline" value={content.tagline || 'Next-Generation Experience'} />
          </span>
        </div>

        {/* Main Headline */}
        <h1 className={`${s.heading} max-w-3xl`}>
          <EditableText path="headline" value={content.headline || 'Creative Design Reimagined'} />
        </h1>

        {/* Subheadline */}
        <div className={`mt-6 ${s.body} mx-auto text-center`}>
          <EditableText path="subheadline" value={content.subheadline || 'We build stunning web projects with cutting edge aesthetic and smart interactions.'} />
        </div>

        {/* Action Buttons */}
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
