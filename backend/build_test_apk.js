const { startApkBuild, getJobStatus } = require('./src/services/apkService');

async function run() {
  try {
    console.log('Starting APK build for FlowBuilderTest pointing to https://www.google.com...');
    const job = await startApkBuild({
      siteId: 'test_site',
      appName: 'FlowBuilderTest',
      packageId: 'com.flowbuilder.test',
      siteUrl: 'https://www.google.com',
      siteData: {}
    });

    console.log('Build queued. Monitoring progress...');
    
    // Poll the job status until it succeeds or fails
    const interval = setInterval(() => {
      const currentJob = getJobStatus(job.id);
      console.log(`Status: ${currentJob.status} | Progress: ${currentJob.progress}% | Message: ${currentJob.message}`);
      
      if (currentJob.status === 'completed') {
        clearInterval(interval);
        console.log('\nSUCCESS! APK generated successfully.');
        console.log('Download path:', currentJob.downloadUrl);
        console.log('File is located at backend/public/apks/');
      } else if (currentJob.status === 'failed') {
        clearInterval(interval);
        console.error('\nBuild failed:', currentJob.error);
      }
    }, 150);

  } catch (err) {
    console.error('Error during test build:', err);
  }
}

run();
