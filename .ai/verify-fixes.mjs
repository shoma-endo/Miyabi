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
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  console.log('📱 Opening dashboard...');
  await page.goto('http://localhost:5173');
  await sleep(3000);
  
  console.log('📸 Screenshot 1: Initial state');
  await page.screenshot({ path: '.ai/verify-1-initial.png', fullPage: false });
  
  console.log('💻 Starting CodeGenAgent with full details...');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      taskDescription: 'Implement proper validation and setup completion',
      priority: 'P1-High',
      estimatedDuration: '1.5 hours',
      complexity: 'Medium'
    }
  });
  
  await sleep(3000);
  
  console.log('📸 Screenshot 2: Agent started with parameters');
  await page.screenshot({ path: '.ai/verify-2-started.png', fullPage: false });
  
  console.log('📈 Progress 45%...');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 45 });
  await sleep(2000);
  
  console.log('📸 Screenshot 3: Progress 45%');
  await page.screenshot({ path: '.ai/verify-3-progress-45.png', fullPage: false });
  
  console.log('📈 Progress 85%...');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 85 });
  await sleep(2000);
  
  console.log('📸 Screenshot 4: Progress 85%');
  await page.screenshot({ path: '.ai/verify-4-progress-85.png', fullPage: false });
  
  console.log('✅ All screenshots saved! Check .ai/verify-*.png');
  
  await sleep(3000);
  await browser.close();
})();
