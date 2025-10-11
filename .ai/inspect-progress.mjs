import { chromium } from 'playwright';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendEvent(eventData) {
  const response = await fetch('http://localhost:3001/api/agent-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  return response.json();
}

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 
  });
  
  const page = await browser.newPage({ 
    viewport: { width: 1920, height: 1080 } 
  });
  
  await page.goto('http://localhost:5173');
  await sleep(2000);
  
  console.log('💻 Starting CodeGenAgent...');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      taskDescription: 'Implement proper validation',
      priority: 'P1-High'
    }
  });
  
  await sleep(2000);
  
  // Zoom into CodeGenAgent
  await page.evaluate(() => {
    const codegenCard = document.querySelector('[data-id="agent-codegen"]');
    if (codegenCard) {
      codegenCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await sleep(1000);
  await page.screenshot({ path: '.ai/inspect-codegen-started.png' });
  
  console.log('📈 Progress 20%');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 20 });
  await sleep(1500);
  await page.screenshot({ path: '.ai/inspect-progress-20.png' });
  
  console.log('📈 Progress 50%');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 50 });
  await sleep(1500);
  await page.screenshot({ path: '.ai/inspect-progress-50.png' });
  
  console.log('📈 Progress 80%');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 80 });
  await sleep(1500);
  await page.screenshot({ path: '.ai/inspect-progress-80.png' });
  
  console.log('✅ Completed');
  await sendEvent({
    eventType: 'completed',
    agentId: 'codegen',
    issueNumber: 58,
    result: { success: true }
  });
  await sleep(2000);
  await page.screenshot({ path: '.ai/inspect-completed.png' });
  
  console.log('📸 Screenshots saved');
  await sleep(3000);
  await browser.close();
})();
