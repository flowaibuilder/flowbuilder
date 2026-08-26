const express = require('express');
const { generateWebsiteSpec, refineWebsiteSpec } = require('../services/aiService');

const router = express.Router();

router.post('/generate-website', async (req, res) => {
  try {
    const { name, industry, description } = req.body;
    
    if (!name || !industry) {
      return res.status(400).json({ error: 'Name and industry are required.' });
    }

    const websiteSpec = await generateWebsiteSpec({ name, industry, description });
    res.json({ success: true, spec: websiteSpec });
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: error.error?.message || error.message || 'Failed to generate website layout.' });
  }
});

router.post('/refine-website', async (req, res) => {
  try {
    const { currentSpec, instruction } = req.body;
    
    if (!currentSpec || !instruction) {
      return res.status(400).json({ error: 'currentSpec and instruction are required.' });
    }

    const updatedSpec = await refineWebsiteSpec(currentSpec, instruction);
    res.json({ success: true, spec: updatedSpec });
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: error.error?.message || error.message || 'Failed to refine website layout.' });
  }
});

module.exports = router;
