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
  
  await page.screenshot({ path: '.ai/final-1-before.png' });
  
  console.log('Starting CodeGenAgent...');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      taskDescription: 'Implement validation',
      priority: 'P1-High',
      estimatedDuration: '1.5h'
    }
  });
  
  await sleep(3000);
  await page.screenshot({ path: '.ai/final-2-started.png' });
  
  console.log('Progress 50%');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 50 });
  await sleep(2000);
  await page.screenshot({ path: '.ai/final-3-progress50.png' });
  
  console.log('Complete!');
  await sleep(2000);
  await browser.close();
})();
