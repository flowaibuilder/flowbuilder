const express = require('express');
const { analyzeDataWithLLM } = require('../services/dataService');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const router = express.Router();

const resendApiKey = process.env.RESEND_API_KEY;
let resend;
if (resendApiKey && resendApiKey !== 're_xxxxxxxxx') {
  resend = new Resend(resendApiKey);
}

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not initialized' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${Date.now()}-${cleanName}`;
    const bucketName = 'images';

    // Check buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketExists = buckets && buckets.some(b => b.name === bucketName);
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 10485760 // 10MB
      });
      if (createError) throw createError;
    }

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('File upload route error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});


router.post('/analyze', async (req, res) => {
  try {
    const { csvContent, query } = req.body;
    
    if (!csvContent) {
      return res.status(400).json({ error: 'csvContent is required.' });
    }

    const result = await analyzeDataWithLLM(csvContent, query);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Data Agent Route Error:', error);
    res.status(500).json({ error: error.error?.message || error.message || 'Failed to analyze data.' });
  }
});

router.post('/track-visit/:subdomain', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    const { subdomain } = req.params;

    const { data: site, error: fetchError } = await supabase
      .from('published_sites')
      .select('config')
      .eq('subdomain', subdomain)
      .single();

    if (fetchError || !site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Use IST (UTC+5:30) so midnight in India correctly starts a new day
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const today = new Date(Date.now() + IST_OFFSET_MS).toISOString().split('T')[0];
    const config = site.config || {};
    if (!config.visitorStats) config.visitorStats = {};
    config.visitorStats[today] = (config.visitorStats[today] || 0) + 1;

    // ── Geo tracking using ip-api.com (free, no key needed) ────────────────
    try {
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['cf-connecting-ip'] ||
        req.socket?.remoteAddress ||
        '';

      // Skip tracking for localhost/private IPs
      const isPrivate = !ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.');
      if (!isPrivate) {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city,regionName,lat,lon`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.country) {
            if (!config.geoStats) config.geoStats = {};
            const countryKey = geo.countryCode || geo.country;
            if (!config.geoStats[countryKey]) {
              config.geoStats[countryKey] = {
                country: geo.country,
                countryCode: geo.countryCode,
                lat: geo.lat,
                lon: geo.lon,
                visits: 0,
                cities: {}
              };
            }
            config.geoStats[countryKey].visits++;
            if (geo.lat && geo.lon) {
              config.geoStats[countryKey].lat = geo.lat;
              config.geoStats[countryKey].lon = geo.lon;
            }
            if (geo.city) {
              config.geoStats[countryKey].cities[geo.city] = (config.geoStats[countryKey].cities[geo.city] || 0) + 1;
            }
          }
        }
      }
    } catch (geoErr) {
      console.warn('Geo tracking failed (non-fatal):', geoErr.message);
    }

    // ── Referrer / Traffic Source tracking ─────────────────────────────────
    try {
      const { referrer = '', utmSource = '', utmMedium = '', utmCampaign = '' } = req.body || {};

      // Helper: map a referrer URL or UTM source to a human-friendly source name
      const classifySource = (ref, utm) => {
        const src = utm.toLowerCase();
        const url = ref.toLowerCase();

        // UTM source overrides everything (most accurate — explicitly set by the site owner)
        if (src) {
          if (/whatsapp/.test(src)) return { source: 'WhatsApp',  icon: '💬', type: 'social' };
          if (/instagram/.test(src)) return { source: 'Instagram', icon: '📸', type: 'social' };
          if (/facebook|fb/.test(src)) return { source: 'Facebook', icon: '👥', type: 'social' };
          if (/youtube/.test(src)) return { source: 'YouTube',   icon: '▶️', type: 'social' };
          if (/twitter|x\.com/.test(src)) return { source: 'Twitter/X', icon: '🐦', type: 'social' };
          if (/linkedin/.test(src)) return { source: 'LinkedIn', icon: '💼', type: 'social' };
          if (/google/.test(src)) return { source: 'Google',    icon: '🔍', type: 'search' };
          if (/bing/.test(src)) return { source: 'Bing',      icon: '🔍', type: 'search' };
          return { source: utm.charAt(0).toUpperCase() + utm.slice(1), icon: '🔗', type: 'other' };
        }

        // Referrer URL parsing
        if (!url || url === 'null') return { source: 'Direct',    icon: '🔗', type: 'direct' };
        if (/google\./.test(url))   return { source: 'Google',    icon: '🔍', type: 'search' };
        if (/bing\.com/.test(url))  return { source: 'Bing',      icon: '🔍', type: 'search' };
        if (/yahoo\.com/.test(url)) return { source: 'Yahoo',     icon: '🔍', type: 'search' };
        if (/youtube\.com/.test(url)) return { source: 'YouTube', icon: '▶️', type: 'social' };
        if (/facebook\.com|fb\.com/.test(url)) return { source: 'Facebook', icon: '👥', type: 'social' };
        if (/instagram\.com/.test(url)) return { source: 'Instagram', icon: '📸', type: 'social' };
        if (/twitter\.com|x\.com/.test(url)) return { source: 'Twitter/X', icon: '🐦', type: 'social' };
        if (/linkedin\.com/.test(url)) return { source: 'LinkedIn', icon: '💼', type: 'social' };
        if (/t\.co/.test(url)) return { source: 'Twitter/X', icon: '🐦', type: 'social' };
        if (/wa\.me|whatsapp/.test(url)) return { source: 'WhatsApp', icon: '💬', type: 'social' };

        // Generic domain as source
        try {
          const domain = new URL(ref).hostname.replace(/^www\./, '');
          return { source: domain, icon: '🌐', type: 'other' };
        } catch {
          return { source: 'Other', icon: '🌐', type: 'other' };
        }
      };

      const { source, icon, type } = classifySource(referrer, utmSource);

      if (!config.referrerStats) config.referrerStats = {};
      if (!config.referrerStats[source]) {
        config.referrerStats[source] = { source, icon, type, visits: 0 };
      }
      config.referrerStats[source].visits++;

      // If a campaign is present, track it too
      if (utmCampaign) {
        if (!config.campaignStats) config.campaignStats = {};
        config.campaignStats[utmCampaign] = (config.campaignStats[utmCampaign] || 0) + 1;
      }
    } catch (refErr) {
      console.warn('Referrer tracking failed (non-fatal):', refErr.message);
    }

    const { error: updateError } = await supabase
      .from('published_sites')
      .update({ config })
      .eq('subdomain', subdomain);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

router.post('/submit-form/:subdomain', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized' });
    const { subdomain } = req.params;
    const { name, email, phone, message } = req.body;

    // Fetch the published site
    const { data: site, error: fetchError } = await supabase
      .from('published_sites')
      .select('website_id, config, user_id')
      .eq('subdomain', subdomain)
      .single();

    if (fetchError || !site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const config = site.config || {};
    
    // Check if the current headers are the old dummy marketing headers
    const isDummyData = config.dataHeaders && config.dataHeaders[0] === 'Category';
    
    if (!config.dataHeaders || isDummyData) {
      config.dataHeaders = ['Name', 'Email', 'Phone', 'Message', 'Date'];
      config.dataRows = [];
    }

    // Append new submission
    const dateStr = new Date().toLocaleString();
    const newRow = [name || '', email || '', phone || '', message || '', dateStr];
    config.dataRows = [...(config.dataRows || []), newRow];

    // Update published_sites
    const { error: updateError } = await supabase
      .from('published_sites')
      .update({ config })
      .eq('subdomain', subdomain);

    if (updateError) throw updateError;

    // Also update saved_websites so the draft workspace sees it too
    if (site.website_id) {
      const { data: savedSite } = await supabase
        .from('saved_websites')
        .select('config')
        .eq('id', site.website_id)
        .single();
        
      if (savedSite) {
        const savedConfig = savedSite.config || {};
        savedConfig.dataHeaders = config.dataHeaders;
        savedConfig.dataRows = config.dataRows;
        await supabase
          .from('saved_websites')
          .update({ config: savedConfig })
          .eq('id', site.website_id);
      }
    }

    // ── Send Email Notification using Resend ───────────────────────────────
    if (resend && site.user_id) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(site.user_id);
        const userEmail = userData?.user?.email;
        
        if (userEmail) {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: userEmail,
            subject: `New Lead Submitted on Your Website (${subdomain})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #111;">You've received a new form submission!</h2>
                <p>A visitor has filled out the contact form on your published website: <strong>${subdomain}.flow.devshahid.me</strong></p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                    <td style="padding: 8px 0;">${name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${email}">${email || 'N/A'}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px 0;">${phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
                    <td style="padding: 8px 0; white-space: pre-wrap;">${message || 'N/A'}</td>
                  </tr>
                </table>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">This notification was sent automatically by Flow AI Builder.</p>
              </div>
            `
          });
        }
      } catch (emailErr) {
        console.error('Failed to send lead email notification:', emailErr);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

module.exports = router;
