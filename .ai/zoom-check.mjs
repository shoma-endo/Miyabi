import { chromium } from 'playwright';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendEvent(data) {
  await fetch('http://localhost:3001/api/agent-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:5173');
  await sleep(3000);
  
  console.log('💻 Starting agent...');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      taskDescription: 'Implement validation',
      priority: 'P1-High'
    }
  });
  
  await sleep(2000);
  
  console.log('📈 Progress 65%...');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 65 });
  await sleep(2000);
  
  console.log('📸 Screenshot at normal zoom');
  await page.screenshot({ path: '.ai/zoom-normal.png' });
  
  // Zoom in 3 times
  console.log('🔍 Zooming in...');
  for (let i = 0; i < 3; i++) {
    await page.click('.react-flow__controls-zoomin').catch(() => {});
    await sleep(300);
  }
  
  await sleep(1000);
  console.log('📸 Screenshot after zoom in');
  await page.screenshot({ path: '.ai/zoom-in.png' });
  
  // Try to scroll the CodeGenAgent card into full view
  await page.evaluate(() => {
    const card = document.querySelector('[data-id="agent-codegen"]');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await sleep(1000);
  console.log('📸 Screenshot after centering');
  await page.screenshot({ path: '.ai/zoom-centered.png' });
  
  await sleep(3000);
  await browser.close();
})();
