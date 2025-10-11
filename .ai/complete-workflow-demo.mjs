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
  console.log('🎬 Starting Complete Workflow Demonstration');
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50,
    args: ['--start-fullscreen']
  });
  
  const page = await browser.newPage({ 
    viewport: null // Use full screen
  });
  
  await page.goto('http://localhost:5173');
  await sleep(3000);
  
  console.log('\n📸 Step 0: Initial Dashboard');
  await page.screenshot({ path: '.ai/workflow-0-initial.png' });
  
  // Step 1: Task Discovery
  console.log('\n📥 Step 1: Task Discovery');
  await sendEvent({
    eventType: 'task:discovered',
    tasks: [
      { issueNumber: 47, title: 'Security Audit Report', priority: 'P3-Low', labels: ['security'] },
      { issueNumber: 58, title: 'Bug: miyabi init incomplete', priority: 'P1-High', labels: ['bug'] },
      { issueNumber: 56, title: 'Strategic: SaaS Platform', priority: 'P2-Medium', labels: ['enhancement'] }
    ]
  });
  await sleep(3000);
  await page.screenshot({ path: '.ai/workflow-1-discovery.png' });
  
  // Step 2: Coordinator Analyzing
  console.log('\n🔍 Step 2: Coordinator Analyzing Issue #58');
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
  await sleep(4000); // Wait for zoom/pan animation
  await page.screenshot({ path: '.ai/workflow-2-analyzing.png' });
  
  // Step 3: Decomposing
  console.log('\n🧩 Step 3: Coordinator Decomposing Task');
  await sendEvent({
    eventType: 'coordinator:decomposing',
    issueNumber: 58,
    subtasks: [
      { id: 'task-1', title: 'Analyze init command', type: 'investigation', dependencies: [] },
      { id: 'task-2', title: 'Fix setup logic', type: 'code-fix', dependencies: ['task-1'] },
      { id: 'task-3', title: 'Add validation tests', type: 'testing', dependencies: ['task-2'] }
    ]
  });
  await sleep(3000);
  await page.screenshot({ path: '.ai/workflow-3-decomposing.png' });
  
  // Step 4: Assigning
  console.log('\n🎯 Step 4: Coordinator Assigning to Agents');
  await sendEvent({
    eventType: 'coordinator:assigning',
    issueNumber: 58,
    assignments: [
      { agentId: 'codegen', taskId: 'task-2', reason: 'Best for code implementation' }
    ]
  });
  await sleep(4000);
  await page.screenshot({ path: '.ai/workflow-4-assigning.png' });
  
  // Step 5: CodeGenAgent Working
  console.log('\n💻 Step 5: CodeGenAgent Executing Task');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 58,
    parameters: {
      taskTitle: 'Fix incomplete setup logic',
      taskDescription: 'Implement proper validation and setup completion',
      priority: 'P1-High',
      estimatedDuration: '1.5 hours'
    }
  });
  await sleep(3000);
  await page.screenshot({ path: '.ai/workflow-5-executing.png' });
  
  // Progress updates
  console.log('  📈 Progress: 25%');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 25 });
  await sleep(1500);
  await page.screenshot({ path: '.ai/workflow-6-progress-25.png' });
  
  console.log('  📈 Progress: 50%');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 50 });
  await sleep(1500);
  await page.screenshot({ path: '.ai/workflow-7-progress-50.png' });
  
  console.log('  📈 Progress: 75%');
  await sendEvent({ eventType: 'progress', agentId: 'codegen', issueNumber: 58, progress: 75 });
  await sleep(1500);
  await page.screenshot({ path: '.ai/workflow-8-progress-75.png' });
  
  console.log('  ✅ Completed!');
  await sendEvent({
    eventType: 'completed',
    agentId: 'codegen',
    issueNumber: 58,
    result: { success: true }
  });
  await sleep(3000);
  await page.screenshot({ path: '.ai/workflow-9-completed.png' });
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Complete Workflow Demo Finished!');
  console.log('📁 Screenshots saved in .ai/workflow-*.png');
  console.log('='.repeat(50));
  
  await sleep(3000);
  await browser.close();
})();
