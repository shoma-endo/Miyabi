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
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:5173');
  await sleep(2000);
  
  // Start CodeGenAgent
  console.log('💻 Starting CodeGenAgent with full parameters...');
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
  
  await sleep(2000);
  
  // Check if currentIssue and progress are in the DOM
  const agentInfo = await page.evaluate(() => {
    const codegenCard = document.querySelector('[data-id="agent-codegen"]');
    return {
      hasCard: !!codegenCard,
      innerHTML: codegenCard?.innerHTML?.substring(0, 500) || 'NOT FOUND',
      currentTaskText: codegenCard?.textContent?.includes('Current Task'),
      runningText: codegenCard?.textContent?.includes('RUNNING'),
    };
  });
  
  console.log('📋 Agent Card Info:', JSON.stringify(agentInfo, null, 2));
  
  // Take a zoomed screenshot of just the CodeGenAgent card
  const element = await page.$('[data-id="agent-codegen"]');
  if (element) {
    await element.screenshot({ path: '.ai/codegen-card-zoom.png' });
    console.log('📸 Zoomed card screenshot saved');
  }
  
  // Send progress update
  console.log('📈 Sending progress 70%...');
  await sendEvent({
    eventType: 'progress',
    agentId: 'codegen',
    issueNumber: 58,
    progress: 70,
    message: 'Implementing validation logic'
  });
  
  await sleep(2000);
  
  // Check again
  const progressInfo = await page.evaluate(() => {
    const progressBar = document.querySelector('[data-id="agent-codegen"] .h-3.rounded-full.bg-gray-800');
    const progressText = document.querySelector('[data-id="agent-codegen"]')?.textContent;
    return {
      hasProgressBar: !!progressBar,
      progressBarHTML: progressBar?.outerHTML || 'NOT FOUND',
      containsProgress: progressText?.includes('Progress') || false,
      contains70: progressText?.includes('70') || false,
    };
  });
  
  console.log('📊 Progress Info:', JSON.stringify(progressInfo, null, 2));
  
  if (element) {
    await element.screenshot({ path: '.ai/codegen-card-progress.png' });
    console.log('📸 Progress screenshot saved');
  }
  
  await sleep(5000);
  await browser.close();
})();
