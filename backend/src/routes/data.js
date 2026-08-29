const express = require('express');
const { analyzeDataWithLLM } = require('../services/dataService');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}


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

    const today = new Date().toISOString().split('T')[0];
    const config = site.config || {};
    if (!config.visitorStats) {
      config.visitorStats = {};
    }
    
    config.visitorStats[today] = (config.visitorStats[today] || 0) + 1;

    const { error: updateError } = await supabase
      .from('published_sites')
      .update({ config })
      .eq('subdomain', subdomain);

    if (updateError) {
      throw updateError;
    }

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
      .select('website_id, config')
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

    res.json({ success: true });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

module.exports = router;
