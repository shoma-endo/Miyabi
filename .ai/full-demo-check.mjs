import { chromium } from 'playwright';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendEvent(eventData) {
  await fetch('http://localhost:3001/api/agent-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:5173');
  await sleep(3000);
  
  console.log('📸 Taking full screenshot before starting agent');
  await page.screenshot({ path: '.ai/full-before.png', fullPage: false });
  
  // Start CodeGenAgent
  console.log('💻 Starting CodeGenAgent...');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      taskDescription: 'Implement proper validation',
      priority: 'P1-High',
      estimatedDuration: '1.5 hours'
    }
  });
  
  await sleep(3000);
  
  console.log('📸 Taking screenshot after agent started');
  await page.screenshot({ path: '.ai/full-after-start.png', fullPage: false });
  
  // Send progress
  console.log('📈 Progress 60%...');
  await sendEvent({
    eventType: 'progress',
    agentId: 'codegen',
    issueNumber: 58,
    progress: 60
  });
  
  await sleep(2000);
  
  console.log('📸 Taking screenshot with progress 60%');
  await page.screenshot({ path: '.ai/full-progress-60.png', fullPage: false });
  
  // Try to manually zoom into CodeGenAgent using ReactFlow controls
  console.log('🔍 Attempting to zoom in on CodeGenAgent...');
  
  // Click the zoom in button in ReactFlow controls (usually on bottom-left)
  await page.click('.react-flow__controls-zoomin').catch(() => console.log('Zoom button not found'));
  await sleep(500);
  await page.click('.react-flow__controls-zoomin').catch(() => {});
  await sleep(500);
  
  console.log('📸 Taking zoomed screenshot');
  await page.screenshot({ path: '.ai/full-zoomed.png', fullPage: false });
  
  await sleep(3000);
  await browser.close();
})();
