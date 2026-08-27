import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Pricing({ content, feel }) {
  const s = getStyles(feel);
  const plans = content.plans || [];

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              Pricing
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Pricing plans for teams of all sizes'} />
          </h2>
          <p className="mt-4 text-sm opacity-80 max-w-xl mx-auto">
            <EditableText path="description" value={content.description || 'Choose an affordable plan packed with our best features.'} />
          </p>
        </div>

        <div className="isolate mx-auto mt-12 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0 items-center">
          {plans.map((plan, index) => {
            // Apply scale effect for popular card only in non-bold themes to look elegant
            const scaleClass = plan.popular && feel !== 'bold' ? 'lg:scale-105 z-10 border-2 border-primary' : '';
            return (
              <div
                key={index}
                className={`${s.card} ${scaleClass} flex flex-col justify-between h-full`}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4 mb-4">
                    <h3 className="text-xl font-bold uppercase">
                      <EditableText path={`plans.${index}.name`} value={plan.name} />
                    </h3>
                    {plan.popular && (
                      <span className={s.badge}>
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-70 mb-6">
                    <EditableText path={`plans.${index}.description`} value={plan.description} />
                  </p>
                </div>
                <div>
                  <p className="flex items-baseline gap-x-1 mb-6">
                    <span className="text-4xl font-extrabold">
                      <EditableText path={`plans.${index}.price`} value={plan.price} />
                    </span>
                    <span className="text-xs opacity-60">/month</span>
                  </p>
                  <EditableText 
                    path={`plans.${index}.ctaText`} 
                    value={plan.ctaText || 'Buy Plan'} 
                    className={`block w-full text-center ${plan.popular ? s.button : s.buttonSec}`}
                    isLink 
                    href="#" 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
