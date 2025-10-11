import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('📸 Opening dashboard...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // Wait for React to render
  await page.waitForTimeout(2000);
  
  console.log('📸 Taking screenshot...');
  await page.screenshot({ 
    path: '/Users/shunsuke/Dev/Autonomous-Operations/.ai/dashboard-initial.png',
    fullPage: true 
  });
  
  console.log('✅ Screenshot saved: .ai/dashboard-initial.png');
  
  await browser.close();
})();
