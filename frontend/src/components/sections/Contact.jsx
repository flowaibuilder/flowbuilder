import React from 'react';
import { getStyles } from '../../utils/themeHelper';
import EditableText from '../EditableText';

export default function Contact({ content, feel }) {
  const s = getStyles(feel);

  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className={s.card}>
            <div className="mb-4">
              <span className={s.badge}>
                Contact
              </span>
            </div>
            <h2 className={s.heading}>
              <EditableText path="title" value={content.title || 'Get in touch'} />
            </h2>
            <div className="space-y-4 text-sm opacity-80 mt-6">
              <p>📍 <EditableText path="address" value={content.address || '123 AI Street, Tech City'} /></p>
              <p>✉️ <EditableText path="email" value={content.email || 'hello@yourdomain.com'} /></p>
              <p>📞 <EditableText path="phone" value={content.phone || '+1 (555) 000-0000'} /></p>
            </div>
          </div>

          <form className={`${s.card} space-y-4`} onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Name</label>
              <input 
                type="text" 
                className="w-full border border-current/25 bg-transparent p-3 outline-none focus:border-current/50 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Email</label>
              <input 
                type="email" 
                className="w-full border border-current/25 bg-transparent p-3 outline-none focus:border-current/50 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Message</label>
              <textarea 
                rows={4} 
                className="w-full border border-current/25 bg-transparent p-3 outline-none focus:border-current/50 transition-colors resize-none" 
              />
            </div>
            <button type="submit" className={`w-full ${s.button}`}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
