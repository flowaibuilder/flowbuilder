import React, { useState } from 'react';
import { getStyles } from '../../utils/themeHelper';
import { Loader2, MapPin, Mail, Phone, Clock, Send, CheckCircle } from 'lucide-react';
import EditableText from '../EditableText';

export default function Contact({ content = {}, feel }) {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details Column */}
          <div className={`${s.card} lg:col-span-5 space-y-6`}>
            <div>
              <div className="mb-4">
                <span className={s.badge}>
                  <EditableText path="tagline" value={content.tagline || 'Get In Touch'} />
                </span>
              </div>
              <h2 className={s.heading}>
                <EditableText path="title" value={content.title || "Let's Start a Conversation"} />
              </h2>
              <p className="mt-4 text-sm sm:text-base opacity-80 leading-relaxed">
                <EditableText path="description" value={content.description || 'Have a project in mind or want to learn more about our solutions? Reach out anytime.'} />
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-current/10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Location</p>
                  <p className="text-sm font-semibold text-current mt-0.5">
                    <EditableText path="address" value={content.address || '123 Innovation Way, Suite 400, Tech City'} />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Email</p>
                  <p className="text-sm font-semibold text-current mt-0.5">
                    <EditableText path="email" value={content.email || 'hello@yourdomain.com'} />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Phone</p>
                  <p className="text-sm font-semibold text-current mt-0.5">
                    <EditableText path="phone" value={content.phone || '+1 (555) 234-5678'} />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <form className={`${s.card} lg:col-span-7 space-y-5`} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-2">Your Name *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-current/20 bg-current/[0.02] p-3.5 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-current/20 bg-current/[0.02] p-3.5 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-current/20 bg-current/[0.02] p-3.5 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-2">Message *</label>
              <textarea 
                rows={4} 
                name="message"
                required
                placeholder="Tell us about your project or inquiry..."
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-current/20 bg-current/[0.02] p-3.5 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none" 
              />
            </div>

            <button type="submit" disabled={status === 'loading'} className={`w-full flex items-center justify-center gap-2 ${s.button}`}>
              {status === 'loading' ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>

            {status === 'success' && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-500 text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
                Message sent successfully! We'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-bold text-center">
                Failed to send message. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
