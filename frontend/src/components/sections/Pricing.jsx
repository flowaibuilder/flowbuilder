import React, { useContext, useState } from 'react';
import { Check, Sparkles, Copy, Trash2 } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText, { EditableContext } from '../EditableText';

export default function Pricing({ content = {}, feel }) {
  const s = getStyles(feel);
  const { isEditingText, updateText } = useContext(EditableContext);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);

  const plans = (content.plans && content.plans.length > 0) ? content.plans : [
    {
      name: 'Starter',
      price: '$29',
      description: 'Ideal for individuals and small projects getting started.',
      features: ['All Core Platform Features', 'Up to 5 Active Projects', 'Community Support', 'Standard Analytics'],
      ctaText: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      description: 'Everything you need to scale and automate your operations.',
      features: ['Unlimited Projects', 'Priority 24/7 Support', 'Advanced Analytics & Reports', 'Custom Domain & Branding', 'Team Collaboration'],
      ctaText: 'Get Started Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      description: 'Tailored solutions and dedicated infrastructure for organizations.',
      features: ['Custom SLA & Account Manager', 'Dedicated Compute Nodes', 'SSO & Advanced Security', 'Unlimited Team Members'],
      ctaText: 'Contact Sales',
      popular: false
    }
  ];

  const duplicateItem = (index) => {
    if (updateText) {
      const newPlans = [...plans];
      const cloned = JSON.parse(JSON.stringify(newPlans[index]));
      if (cloned.popular) cloned.popular = false;
      newPlans.splice(index + 1, 0, cloned);
      updateText('plans', newPlans);
    }
  };

  const deleteItem = (index) => {
    if (updateText) {
      if (plans.length <= 1) {
        alert('You must keep at least one plan.');
        return;
      }
      const newPlans = plans.filter((_, i) => i !== index);
      updateText('plans', newPlans);
    }
  };

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16 flex flex-col items-center">
          <div className="mb-4">
            <span className={s.badge}>
              <EditableText path="tagline" value={content.tagline || 'Flexible Pricing'} />
            </span>
          </div>
          <h2 className={s.heading}>
            <EditableText path="title" value={content.title || 'Simple, transparent plans for every team'} />
          </h2>
          <div className="mt-4 text-base opacity-75 max-w-xl mx-auto leading-relaxed">
            <EditableText path="description" value={content.description || 'Choose the right plan to accelerate your growth. No hidden fees.'} />
          </div>
        </div>

        <div className="isolate mx-auto mt-12 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 items-stretch">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            const popularCardClasses = isPopular && feel !== 'bold'
              ? 'border-2 border-primary ring-4 ring-primary/10 shadow-2xl scale-[1.03] z-10'
              : '';

            const planFeatures = plan.features || [
              'Full Platform Access',
              'Real-Time Analytics',
              'Cloud Sync & Backup',
              '24/7 Customer Support'
            ];

            return (
              <div
                key={index}
                className={`${s.card} ${popularCardClasses} flex flex-col justify-between h-full relative group`}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
              >
                {isEditingText && hoveredCardIndex === index && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-40 bg-black/80 p-1.5 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); duplicateItem(index); }}
                      className="p-1 text-white hover:text-[#d4f000] hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Duplicate Plan"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteItem(index); }}
                      className="p-1 text-white hover:text-red-400 hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary text-black shadow-md border border-primary">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-x-4 mb-4">
                    <h3 className="text-xl font-bold tracking-tight text-current">
                      <EditableText path={`plans.${index}.name`} value={plan.name} />
                    </h3>
                  </div>

                  <div className="text-sm opacity-75 mb-6 leading-relaxed">
                    <EditableText path={`plans.${index}.description`} value={plan.description} />
                  </div>

                  <div className="flex items-baseline gap-x-1 mb-8 pb-6 border-b border-current/10">
                    <span className="text-4xl sm:text-5xl font-black text-current tracking-tight">
                      <EditableText path={`plans.${index}.price`} value={plan.price} />
                    </span>
                    <span className="text-xs opacity-60 font-semibold uppercase tracking-wider">/month</span>
                  </div>

                  {/* Feature checkmarks */}
                  <ul className="space-y-3 mb-8">
                    {planFeatures.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-sm opacity-85">
                        <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <EditableText 
                    path={`plans.${index}.ctaText`} 
                    value={plan.ctaText || (isPopular ? 'Get Started Pro' : 'Choose Plan')} 
                    className={`block w-full text-center ${isPopular ? s.button : s.buttonSec}`}
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
