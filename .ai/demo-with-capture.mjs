import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
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
  console.log('🎬 Starting interactive demo with screenshots...');
  
  const browser = await chromium.launch({ 
    headless: false,  // 見えるようにする
    slowMo: 100 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('📸 Opening dashboard...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await sleep(2000);
  
  // Initial state
  console.log('📸 Step 0: Initial state');
  await page.screenshot({ path: '.ai/demo-0-initial.png', fullPage: false });
  await sleep(1000);
  
  // Step 1: Task Discovery
  console.log('📥 Step 1: Task Discovery');
  await sendEvent({
    eventType: 'task:discovered',
    tasks: [
      { issueNumber: 47, title: 'Security Audit Report', priority: 'P3-Low', labels: ['security'] },
      { issueNumber: 58, title: 'Bug: miyabi init incomplete', priority: 'P1-High', labels: ['bug'] },
      { issueNumber: 56, title: 'Strategic: SaaS Platform', priority: 'P2-Medium', labels: ['enhancement'] }
    ]
  });
  await sleep(2000);
  await page.screenshot({ path: '.ai/demo-1-tasks-discovered.png', fullPage: false });
  
  // Step 2: Coordinator Analyzing
  console.log('🔍 Step 2: Coordinator Analyzing Issue #58');
  await sendEvent({
    eventType: 'coordinator:analyzing',
    issueNumber: 58,
    title: 'Bug: miyabi init incomplete',
    analysis: {
      type: 'Bug Fix',
      priority: 'P1-High',
      complexity: 'Medium',
      estimatedTime: '2-3 hours'
    }
  });
  await sleep(3000);  // ズーム・パンを確認するため長めに待機
  await page.screenshot({ path: '.ai/demo-2-analyzing.png', fullPage: false });
  
  // Step 3: Coordinator Decomposing
  console.log('🧩 Step 3: Coordinator Decomposing');
  await sendEvent({
    eventType: 'coordinator:decomposing',
    issueNumber: 58,
    subtasks: [
      { id: 'task-1', title: 'Analyze init command', type: 'investigation', dependencies: [] },
      { id: 'task-2', title: 'Fix setup logic', type: 'code-fix', dependencies: ['task-1'] },
      { id: 'task-3', title: 'Add validation tests', type: 'testing', dependencies: ['task-2'] }
    ]
  });
  await sleep(2000);
  await page.screenshot({ path: '.ai/demo-3-decomposing.png', fullPage: false });
  
  // Step 4: Coordinator Assigning
  console.log('🎯 Step 4: Coordinator Assigning');
  await sendEvent({
    eventType: 'coordinator:assigning',
    issueNumber: 58,
    assignments: [
      { agentId: 'codegen', taskId: 'task-2', reason: 'Best for code implementation' }
    ]
  });
  await sleep(3000);  // フォーカス確認
  await page.screenshot({ path: '.ai/demo-4-assigning.png', fullPage: false });
  
  // Step 5: CodeGenAgent Working
  console.log('💻 Step 5: CodeGenAgent Working');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      priority: 'P1-High'
    }
  });
  await sleep(2000);
  await page.screenshot({ path: '.ai/demo-5-codegen-started.png', fullPage: false });
  
  // Progress updates
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 30 });
  await sleep(800);
  await page.screenshot({ path: '.ai/demo-6-progress-30.png', fullPage: false });
  
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 60 });
  await sleep(800);
  await page.screenshot({ path: '.ai/demo-7-progress-60.png', fullPage: false });
  
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 90 });
  await sleep(800);
  await page.screenshot({ path: '.ai/demo-8-progress-90.png', fullPage: false });
  
  // Completion
  await sendEvent({
    eventType: 'completed',
    agentId: 'codegen',
    issueNumber: 58,
    result: { success: true }
  });
  await sleep(2000);
  await page.screenshot({ path: '.ai/demo-9-completed.png', fullPage: false });
  
  console.log('✅ Demo complete! Screenshots saved in .ai/');
  console.log('📸 Check files: demo-0-initial.png through demo-9-completed.png');
  
  await sleep(3000);
  await browser.close();
})();
