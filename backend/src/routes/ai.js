const express = require('express');
const { generateWebsiteSpec, refineWebsiteSpec, suggestBusinessProfile } = require('../services/aiService');

const router = express.Router();

router.post('/suggest-profile', async (req, res) => {
  try {
    const { name, industry } = req.body;
    if (!name || !industry) {
      return res.status(400).json({ error: 'Name and industry are required.' });
    }
    const suggestions = await suggestBusinessProfile({ name, industry });
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate suggestions.' });
  }
});

router.post('/generate-website', async (req, res) => {
  try {
    const { name, industry, description, pages, feel, cta, fontStyle, theme } = req.body;
    
    if (!name || !industry) {
      return res.status(400).json({ error: 'Name and industry are required.' });
    }

    const websiteSpec = await generateWebsiteSpec({ name, industry, description, pages, feel, cta, fontStyle, theme });
    res.json({ success: true, spec: websiteSpec });
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: error.error?.message || error.message || 'Failed to generate website layout.' });
  }
});

router.post('/refine-website', async (req, res) => {
  try {
    const { currentSpec, instruction, chatHistory, currentTheme, currentFeel, businessName, siteImages } = req.body;
    
    if (!currentSpec || !instruction) {
      return res.status(400).json({ error: 'currentSpec and instruction are required.' });
    }

    const result = await refineWebsiteSpec(currentSpec, instruction, {
      chatHistory,
      currentTheme,
      currentFeel,
      businessName,
      siteImages
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: error.error?.message || error.message || 'Failed to refine website layout.' });
  }
});

module.exports = router;
