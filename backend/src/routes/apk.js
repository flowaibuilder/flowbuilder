const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { startApkBuild, getJobStatus, checkAndroidBuildTools } = require('../services/apkService');

const PUBLIC_APKS_DIR = path.join(__dirname, '../../public/apks');

// Check tool status (JDK / Android SDK)
router.get('/tools', async (req, res) => {
  try {
    const tools = await checkAndroidBuildTools();
    res.json({
      success: true,
      tools
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start APK Build
router.post('/build', async (req, res) => {
  try {
    const { siteId, appName, packageId, siteUrl, siteData } = req.body;

    if (!appName && !siteData && !siteUrl) {
      return res.status(400).json({ success: false, error: 'appName or siteUrl or siteData is required' });
    }

    const job = await startApkBuild({
      siteId,
      appName: appName || 'MyApp',
      packageId: packageId || 'com.flowbuilder.app',
      siteUrl,
      siteData
    });

    res.json({
      success: true,
      job
    });
  } catch (err) {
    console.error('Error starting APK build:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Poll APK Build Status
router.get('/status/:buildId', (req, res) => {
  const { buildId } = req.params;
  const job = getJobStatus(buildId);

  if (!job) {
    return res.status(404).json({ success: false, error: 'Build job not found' });
  }

  res.json({
    success: true,
    job
  });
});

// Download Compiled APK
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(PUBLIC_APKS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found or build expired' });
  }

  res.download(filePath, safeFilename);
});

module.exports = router;
