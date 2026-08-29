const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const TEMPLATE_DIR = path.join(__dirname, '../../templates');
const TEMPLATE_ANDROID_DIR = path.join(__dirname, '../../templates/android');
const TEMPLATE_WWW_DIR = path.join(__dirname, '../../templates/www');
const ASSETS_PUBLIC_DIR = path.join(__dirname, '../../templates/android/app/src/main/assets/public');
const COMPILED_APK_PATH = path.join(__dirname, '../../templates/android/app/build/outputs/apk/debug/app-debug.apk');
const PUBLIC_APKS_DIR = path.join(__dirname, '../../public/apks');
const BUILDS_DIR = path.join(__dirname, '../../builds');

// Ensure required directories exist
[PUBLIC_APKS_DIR, BUILDS_DIR, TEMPLATE_WWW_DIR, ASSETS_PUBLIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// In-memory store for build jobs
const buildJobs = new Map();

/**
 * Generate native-feeling HTML container for website config
 */
function generateStandaloneHtml(siteData, siteUrl = '') {
  const { businessName = 'FlowStudio AI', sections = [], theme = {}, features = [], pricing = [] } = siteData || {};

  const primary = theme.primary || '#d4f000';
  const secondary = theme.secondary || '#121318';
  const background = theme.background || '#090a0f';
  const textColor = theme.text || '#ffffff';

  if (siteUrl) {
    // Native Webview Container for target URL
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${businessName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body {
      width: 100%;
      height: 100%;
      background-color: ${background};
      color: ${textColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
    }

    #splash-screen {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: ${background};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.4s ease, visibility 0.4s ease;
    }
    #splash-screen.hidden {
      opacity: 0;
      visibility: hidden;
    }
    .app-icon {
      width: 84px;
      height: 84px;
      background: linear-gradient(135deg, ${primary}, #000000);
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: bold;
      color: #000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      margin-bottom: 20px;
    }
    .app-title {
      font-size: 22px;
      font-weight: 700;
      color: ${textColor};
      letter-spacing: -0.5px;
      margin-bottom: 30px;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: ${primary};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    #web-container {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
    }
  </style>
</head>
<body>
  <div id="splash-screen">
    <div class="app-icon">${(businessName[0] || 'A').toUpperCase()}</div>
    <div class="app-title">${businessName}</div>
    <div class="spinner"></div>
  </div>

  <iframe id="web-container" src="${siteUrl}" allow="camera; microphone; geolocation" onload="hideSplash()"></iframe>

  <script>
    function hideSplash() {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        setTimeout(() => { splash.classList.add('hidden'); }, 300);
      }
    }
    setTimeout(hideSplash, 3000);
  </script>
</body>
</html>`;
  }

  // Standalone Full Mobile Web App Template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${businessName}</title>
  <style>
    :root {
      --primary: ${primary};
      --secondary: ${secondary};
      --bg: ${background};
      --text: ${textColor};
      --card-bg: rgba(255, 255, 255, 0.04);
      --card-border: rgba(255, 255, 255, 0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      overflow-x: hidden;
    }

    /* Header & Navigation */
    header {
      background: rgba(18, 19, 24, 0.85);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid var(--card-border);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 34px;
      height: 34px;
      background: var(--primary);
      color: #000;
      font-weight: 900;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .cta-btn-sm {
      background: var(--primary);
      color: #000;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(212, 240, 0, 0.25);
    }

    /* Hero Section */
    .hero {
      padding: 60px 20px 40px;
      text-align: center;
      position: relative;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(212, 240, 0, 0.1);
      border: 1px solid rgba(212, 240, 0, 0.25);
      color: var(--primary);
      padding: 6px 14px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .hero h1 {
      font-size: 36px;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -1px;
      background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      max-width: 600px;
      margin: 0 auto 28px;
    }
    .hero-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 0 20px;
    }
    .btn-main {
      background: var(--primary);
      color: #000;
      font-size: 16px;
      font-weight: 800;
      padding: 16px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 8px 25px rgba(212, 240, 0, 0.3);
      transition: transform 0.2s ease;
    }
    .btn-main:active { transform: scale(0.98); }
    .btn-sec {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      padding: 16px;
      border-radius: 14px;
      border: 1px solid var(--card-border);
      cursor: pointer;
      text-decoration: none;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 40px 20px 20px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px 10px;
      text-align: center;
    }
    .stat-num {
      font-size: 20px;
      font-weight: 800;
      color: var(--primary);
    }
    .stat-label {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      margin-top: 4px;
    }

    /* Section Styling */
    .section-title {
      font-size: 24px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 8px;
    }
    .section-sub {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      margin-bottom: 30px;
    }

    /* Feature Cards */
    .features-container {
      padding: 40px 20px;
    }
    .feature-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 16px;
      transition: transform 0.2s ease;
    }
    .feature-icon {
      width: 46px;
      height: 46px;
      background: rgba(212, 240, 0, 0.12);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin-bottom: 16px;
    }
    .feature-card h3 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .feature-card p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.65);
    }

    /* Pricing Section */
    .pricing-container {
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.015);
    }
    .price-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 28px 24px;
      margin-bottom: 20px;
      position: relative;
    }
    .price-card.featured {
      border-color: var(--primary);
      box-shadow: 0 0 30px rgba(212, 240, 0, 0.15);
    }
    .popular-tag {
      position: absolute;
      top: -12px; right: 20px;
      background: var(--primary);
      color: #000;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 12px;
      text-transform: uppercase;
    }
    .price-amount {
      font-size: 32px;
      font-weight: 900;
      margin: 12px 0 6px;
    }
    .price-period {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
    .price-features {
      list-style: none;
      margin: 20px 0 24px;
    }
    .price-features li {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .price-features li::before {
      content: "✓";
      color: var(--primary);
      font-weight: bold;
    }

    /* Footer */
    footer {
      padding: 40px 20px;
      border-top: 1px solid var(--card-border);
      text-align: center;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
    }

    /* Toast Notification */
    #toast {
      position: fixed;
      bottom: 30px; left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--primary);
      color: #000;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 30px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 9999;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    #toast.show { transform: translateX(-50%) translateY(0); }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="brand">
      <div class="brand-logo">${(businessName[0] || 'F').toUpperCase()}</div>
      <div class="brand-title">${businessName}</div>
    </div>
    <button class="cta-btn-sm" onclick="showToast('Welcome to ${businessName}!')">Get Started</button>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="badge">🚀 Native Mobile Experience</div>
    <h1>Build Beautiful Mobile Apps Instantly</h1>
    <p>Transform your web applications into lightning-fast, high-performance native Android apps with a single click.</p>
    <div class="hero-actions">
      <button class="btn-main" onclick="showToast('⚡ Launching Mobile Builder...')">Create App Now</button>
      <button class="btn-sec" onclick="showToast('📘 Opening Documentation...')">View Features</button>
    </div>
  </section>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <div>
      <div class="stat-num">99.9%</div>
      <div class="stat-label">Uptime</div>
    </div>
    <div>
      <div class="stat-num">100k+</div>
      <div class="stat-label">Downloads</div>
    </div>
    <div>
      <div class="stat-num">4.9★</div>
      <div class="stat-label">Rating</div>
    </div>
  </div>

  <!-- Features Container -->
  <section class="features-container">
    <h2 class="section-title">Why Choose ${businessName}?</h2>
    <p class="section-sub">Everything you need for native mobile success.</p>

    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>Instant APK Build Pipeline</h3>
      <p>Cryptographically compiled and signed Android packages delivered directly to your device.</p>
    </div>

    <div class="feature-card">
      <div class="feature-icon">🎨</div>
      <h3>Pixel Perfect UI</h3>
      <p>Responsive mobile viewports tailored with native safe-area inset support and smooth animations.</p>
    </div>

    <div class="feature-card">
      <div class="feature-icon">🔒</div>
      <h3>Security & Compliance</h3>
      <p>Compliant with modern Android OS standards (API Level 34/36) and Play Protect verification.</p>
    </div>
  </section>

  <!-- Pricing Container -->
  <section class="pricing-container">
    <h2 class="section-title">Simple Pricing</h2>
    <p class="section-sub">Choose the perfect plan for your application.</p>

    <div class="price-card">
      <h3>Starter</h3>
      <div class="price-amount">$0 <span class="price-period">/ forever</span></div>
      <ul class="price-features">
        <li>Unlimited Web Previews</li>
        <li>Standard Build Speed</li>
        <li>Community Support</li>
      </ul>
      <button class="btn-sec" style="width: 100%;" onclick="showToast('Starter Plan Selected')">Get Started</button>
    </div>

    <div class="price-card featured">
      <div class="popular-tag">Most Popular</div>
      <h3>Pro Studio</h3>
      <div class="price-amount">$29 <span class="price-period">/ month</span></div>
      <ul class="price-features">
        <li>Fast Dedicated Gradle Builds</li>
        <li>Custom Package ID & Icons</li>
        <li>Offline Asset Bundling</li>
        <li>24/7 Priority Support</li>
      </ul>
      <button class="btn-main" style="width: 100%;" onclick="showToast('🎉 Pro Studio Plan Activated!')">Upgrade to Pro</button>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <p>© 2026 ${businessName}. All rights reserved.</p>
  </footer>

  <!-- Interactive Toast -->
  <div id="toast">Notification Message</div>

  <script>
    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => { toast.classList.remove('show'); }, 2500);
    }
  </script>
</body>
</html>`;
}

/**
 * Native APK Builder (Compiles & Signs via Gradle)
 */
async function startApkBuild({ siteId, appName, packageId, siteUrl, siteData }) {
  const buildId = `build_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sanitizedAppName = (appName || 'MyApp').replace(/[^a-zA-Z0-9_]/g, '');
  const cleanPackageId = (packageId || 'com.flowbuilder.app').toLowerCase().replace(/[^a-z0-9_.]/g, '');
  const outputApkName = `${sanitizedAppName}_${buildId}.apk`;
  const finalApkPath = path.join(PUBLIC_APKS_DIR, outputApkName);

  const job = {
    id: buildId,
    appName: sanitizedAppName,
    packageId: cleanPackageId,
    status: 'queued',
    progress: 10,
    message: 'Starting native APK build pipeline...',
    downloadUrl: null,
    error: null,
    createdAt: new Date()
  };

  buildJobs.set(buildId, job);

  // Process build natively in background
  setTimeout(async () => {
    try {
      job.status = 'generating_assets';
      job.progress = 30;
      job.message = 'Injecting web application code and native UI assets...';

      const htmlContent = generateStandaloneHtml(siteData, siteUrl);

      // Write HTML to www and android assets
      const wwwIndexPath = path.join(TEMPLATE_WWW_DIR, 'index.html');
      const androidAssetsIndexPath = path.join(ASSETS_PUBLIC_DIR, 'index.html');

      fs.writeFileSync(wwwIndexPath, htmlContent, 'utf8');
      fs.writeFileSync(androidAssetsIndexPath, htmlContent, 'utf8');

      job.status = 'compiling_native_apk';
      job.progress = 60;
      job.message = 'Compiling and cryptographically signing native APK with Gradle...';

      // Execute Gradle assembleDebug to build & sign a 100% valid Android APK
      const gradlewCmd = process.platform === 'win32' ? 'cmd.exe /c .\\gradlew.bat assembleDebug' : './gradlew assembleDebug';
      
      await execPromise(gradlewCmd, {
        cwd: TEMPLATE_ANDROID_DIR,
        timeout: 180000 // 3 minutes timeout
      });

      if (!fs.existsSync(COMPILED_APK_PATH)) {
        throw new Error('Gradle build finished but output APK was not found.');
      }

      // Copy signed debug APK to public download directory
      fs.copyFileSync(COMPILED_APK_PATH, finalApkPath);

      job.status = 'completed';
      job.progress = 100;
      job.message = 'Native APK compiled and signed successfully!';
      job.downloadUrl = `/api/apk/download/${outputApkName}`;

    } catch (err) {
      console.error(`Native APK build failed [${buildId}]:`, err);
      job.status = 'failed';
      job.error = err.message || 'Gradle build failed';
      job.message = 'Build failed.';
    }
  }, 100);

  return job;
}

function getJobStatus(buildId) {
  return buildJobs.get(buildId) || null;
}

module.exports = {
  startApkBuild,
  getJobStatus
};
