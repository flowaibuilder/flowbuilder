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

module.exports = router;
