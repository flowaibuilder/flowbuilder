const express = require('express');
const { analyzeDataWithLLM } = require('../services/dataService');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { csvContent, query } = req.body;
    
    if (!csvContent || !query) {
      return res.status(400).json({ error: 'csvContent and query are required.' });
    }

    const result = await analyzeDataWithLLM(csvContent, query);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Data Agent Route Error:', error);
    res.status(500).json({ error: error.error?.message || error.message || 'Failed to analyze data.' });
  }
});

module.exports = router;
