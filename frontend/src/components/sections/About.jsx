import React from 'react';
import { Award, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function About({ content = {}, feel }) {
  const s = getStyles(feel);

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Story Card */}
          <div className={`${s.card} lg:col-span-7 flex flex-col justify-between`}>
            <div>
              <div className="mb-4">
                <span className={s.badge}>
                  <EditableText path="tagline" value={content.tagline || 'Our Story & Vision'} />
                </span>
              </div>
              <h2 className={s.heading}>
                <EditableText path="title" value={content.title || 'Who We Are & What We Believe'} />
              </h2>
              <div className="mt-6 text-base opacity-80 leading-relaxed">
                <EditableText path="description" value={content.description || 'We are a dedicated team of builders, creators, and engineers committed to delivering world-class experiences that empower growth and redefine digital standards.'} />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-current/10 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-85">Verified Excellence</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-85">Industry Standard</span>
              </div>
            </div>
          </div>
          
          {/* Mission & Stats */}
          <div className={`${s.card} lg:col-span-5 flex flex-col justify-between`}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3">
                <EditableText path="missionTitle" value={content.missionTitle || 'Our Mission'} />
              </h3>
              <div className="leading-relaxed mb-6 opacity-80 text-sm">
                <EditableText path="mission" value={content.mission || 'To push limits and set new benchmarks in quality, speed, and design integrity across everything we build.'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-current/10 pt-6">
              <div className="p-4 rounded-xl bg-current/[0.03] border border-current/5">
                <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                  <EditableText path="stat1Value" value={content.stat1Value || '99.9%'} />
                </div>
                <div className="text-[11px] opacity-65 uppercase tracking-wider font-bold mt-1">
                  <EditableText path="stat1Label" value={content.stat1Label || 'Client Satisfaction'} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-current/[0.03] border border-current/5">
                <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                  <EditableText path="stat2Value" value={content.stat2Value || '10x'} />
                </div>
                <div className="text-[11px] opacity-65 uppercase tracking-wider font-bold mt-1">
                  <EditableText path="stat2Label" value={content.stat2Label || 'Faster Execution'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
