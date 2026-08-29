import React, { useState } from 'react';
import { getStyles } from '../../utils/themeHelper';
import { Loader2 } from 'lucide-react';
import EditableText from '../EditableText';

export default function Contact({ content, feel }) {
  const s = getStyles(feel);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('loading');
    try {
      const subdomain = window.location.hostname.split('.')[0];
      const res = await fetch(`/api/data/submit-form/${subdomain}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Submission failed');
      
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

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

          <form className={`${s.card} space-y-4`} onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-current/25 bg-transparent p-3 outline-none focus:border-current/50 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-current/25 bg-transparent p-3 outline-none focus:border-current/50 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Phone</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-current/25 bg-transparent p-3 outline-none focus:border-current/50 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">Message</label>
              <textarea 
                rows={4} 
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-current/25 bg-transparent p-3 outline-none focus:border-current/50 transition-colors resize-none" 
              />
            </div>
            <button type="submit" disabled={status === 'loading'} className={`w-full flex items-center justify-center ${s.button}`}>
              {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Message'}
            </button>
            {status === 'success' && (
              <p className="text-sm text-green-500 mt-2 text-center font-bold">Message sent successfully!</p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500 mt-2 text-center font-bold">Failed to send message. Try again.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
