const { startApkBuild, getJobStatus } = require('./src/services/apkService');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    console.log('Starting full demo website APK build...');
    const job = await startApkBuild({
      siteId: 'flowstudio_demo',
      appName: 'FlowStudio',
      packageId: 'com.flowstudio.app',
      siteUrl: '',
      siteData: {
        businessName: 'FlowStudio AI',
        theme: {
          primary: '#d4f000',
          secondary: '#121318',
          background: '#090a0f',
          text: '#ffffff'
        }
      }
    });

    console.log('Build queued. Monitoring progress...');
    
    const interval = setInterval(() => {
      const currentJob = getJobStatus(job.id);
      console.log(`Status: ${currentJob.status} | Progress: ${currentJob.progress}% | Message: ${currentJob.message}`);
      
      if (currentJob.status === 'completed') {
        clearInterval(interval);
        console.log('\nSUCCESS! Full Demo APK generated successfully.');
        const finalApkFilename = path.basename(currentJob.downloadUrl);
        const sourcePath = path.join(__dirname, 'public/apks', finalApkFilename);
        const destPath = path.join(__dirname, '../FlowStudio_DemoApp_Signed.apk');
        fs.copyFileSync(sourcePath, destPath);
        console.log('Copied output APK to:', destPath);
      } else if (currentJob.status === 'failed') {
        clearInterval(interval);
        console.error('\nBuild failed:', currentJob.error);
      }
    }, 200);

  } catch (err) {
    console.error('Error during demo build:', err);
  }
}

run();
