/**
 * Test Real Workflow with UI Verification
 *
 * 実際にイベントを発生させて、UIが更新されるか確認
 */

import { chromium } from 'playwright';

async function sendEvent(eventData) {
  const response = await fetch('http://localhost:3001/api/agent-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  return response.json();
}

async function testWorkflow() {
  console.log('🧪 Starting Real Workflow Test\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('📡 Connecting to dashboard...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  console.log('\n========== STEP 1: Task Discovery ==========\n');
  console.log('📥 Sending task discovery event...');
  await sendEvent({
    eventType: 'task:discovered',
    timestamp: new Date().toISOString(),
    tasks: [
      { issueNumber: 100, title: 'Test Task 1', priority: 'P1-High' },
      { issueNumber: 101, title: 'Test Task 2', priority: 'P2-Medium' },
    ]
  });
  await page.waitForTimeout(2000);

  // Check if explanation panel updated
  const step1Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasDiscoveryStage: body.includes('タスク発見') && body.includes('Discovery'),
      hasTaskCount: body.includes('2個'),
      hasExplanation: body.includes('GitHubから') || body.includes('読み込みました'),
    };
  });

  console.log('✅ Discovery stage active:', step1Check.hasDiscoveryStage);
  console.log('✅ Task count displayed:', step1Check.hasTaskCount);
  console.log('✅ Explanation updated:', step1Check.hasExplanation);

  await page.screenshot({ path: '.ai/test-1-discovery.png', fullPage: false });
  console.log('📸 Screenshot saved: test-1-discovery.png\n');

  console.log('\n========== STEP 2: Coordinator Analyzing ==========\n');
  console.log('🔍 Sending coordinator analyzing event...');
  await sendEvent({
    eventType: 'coordinator:analyzing',
    timestamp: new Date().toISOString(),
    issueNumber: 100,
    analysis: {
      type: 'Bug Fix',
      priority: 'P1-High',
      complexity: 'Medium'
    }
  });
  await page.waitForTimeout(2000);

  const step2Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasAnalysisStage: body.includes('分析') && body.includes('Analysis'),
      hasIssueNumber: body.includes('100') || body.includes('#100'),
      hasBugFix: body.includes('Bug Fix'),
      hasExplanation: body.includes('分析中') || body.includes('analyzing'),
    };
  });

  console.log('✅ Analysis stage active:', step2Check.hasAnalysisStage);
  console.log('✅ Issue number displayed:', step2Check.hasIssueNumber);
  console.log('✅ Bug Fix type shown:', step2Check.hasBugFix);
  console.log('✅ Explanation updated:', step2Check.hasExplanation);

  await page.screenshot({ path: '.ai/test-2-analyzing.png', fullPage: false });
  console.log('📸 Screenshot saved: test-2-analyzing.png\n');

  console.log('\n========== STEP 3: Task Decomposition ==========\n');
  console.log('🧩 Sending decomposition event...');
  await sendEvent({
    eventType: 'coordinator:decomposing',
    timestamp: new Date().toISOString(),
    issueNumber: 100,
    subtasks: [
      { title: 'Investigate root cause', type: 'investigation' },
      { title: 'Implement fix', type: 'code-fix' },
      { title: 'Add tests', type: 'testing' }
    ]
  });
  await page.waitForTimeout(2000);

  const step3Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasDecompositionStage: body.includes('タスク分解') || body.includes('Decomposition'),
      hasSubtaskCount: body.includes('3個'),
      hasInvestigate: body.includes('Investigate') || body.includes('investigation'),
      hasExplanation: body.includes('分解') || body.includes('サブタスク'),
    };
  });

  console.log('✅ Decomposition stage active:', step3Check.hasDecompositionStage);
  console.log('✅ Subtask count displayed:', step3Check.hasSubtaskCount);
  console.log('✅ Subtask details shown:', step3Check.hasInvestigate);
  console.log('✅ Explanation updated:', step3Check.hasExplanation);

  await page.screenshot({ path: '.ai/test-3-decomposing.png', fullPage: false });
  console.log('📸 Screenshot saved: test-3-decomposing.png\n');

  console.log('\n========== STEP 4: Agent Assignment ==========\n');
  console.log('🎯 Sending assignment event...');
  await sendEvent({
    eventType: 'coordinator:assigning',
    timestamp: new Date().toISOString(),
    issueNumber: 100,
    assignments: [
      { agentId: 'codegen', reason: 'Best for code implementation' },
    ]
  });
  await page.waitForTimeout(2000);

  const step4Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasAssignmentStage: body.includes('Agent割り当て') || body.includes('Assignment'),
      hasCodegen: body.includes('codegen') || body.includes('CodeGen'),
      hasReason: body.includes('Best for') || body.includes('理由'),
      hasExplanation: body.includes('割り当て') || body.includes('Specialist'),
    };
  });

  console.log('✅ Assignment stage active:', step4Check.hasAssignmentStage);
  console.log('✅ Codegen assigned:', step4Check.hasCodegen);
  console.log('✅ Reason displayed:', step4Check.hasReason);
  console.log('✅ Explanation updated:', step4Check.hasExplanation);

  await page.screenshot({ path: '.ai/test-4-assigning.png', fullPage: false });
  console.log('📸 Screenshot saved: test-4-assigning.png\n');

  console.log('\n========== STEP 5: Agent Execution ==========\n');
  console.log('💻 Sending agent started event...');
  await sendEvent({
    eventType: 'started',
    timestamp: new Date().toISOString(),
    agentId: 'codegen',
    issueNumber: 100,
    parameters: {
      taskTitle: 'Fix bug in authentication',
      priority: 'P1-High',
      context: 'User login fails intermittently'
    }
  });
  await page.waitForTimeout(2000);

  const step5Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasExecutionStage: body.includes('実行') && body.includes('Execution'),
      hasRunningStatus: body.includes('実行開始') || body.includes('処理を開始'),
      hasTaskTitle: body.includes('Fix bug') || body.includes('authentication'),
      hasExplanation: body.includes('CodeGenAgent') && body.includes('Issue #100'),
    };
  });

  console.log('✅ Execution stage active:', step5Check.hasExecutionStage);
  console.log('✅ Running status shown:', step5Check.hasRunningStatus);
  console.log('✅ Task title displayed:', step5Check.hasTaskTitle);
  console.log('✅ Explanation updated:', step5Check.hasExplanation);

  await page.screenshot({ path: '.ai/test-5-executing.png', fullPage: false });
  console.log('📸 Screenshot saved: test-5-executing.png\n');

  console.log('\n========== TEST SUMMARY ==========\n');

  const allPassed = [
    step1Check.hasDiscoveryStage && step1Check.hasExplanation,
    step2Check.hasAnalysisStage && step2Check.hasExplanation,
    step3Check.hasDecompositionStage && step3Check.hasExplanation,
    step4Check.hasAssignmentStage && step4Check.hasExplanation,
    step5Check.hasExecutionStage && step5Check.hasExplanation,
  ];

  const passedCount = allPassed.filter(Boolean).length;
  console.log(`✅ Passed: ${passedCount}/5 workflow stages`);

  if (passedCount === 5) {
    console.log('🎉 All workflow stages working correctly!');
    console.log('✅ Real-time explanation panel updates properly');
    console.log('✅ Stage indicator transitions correctly');
  } else {
    console.log('⚠️  Some stages may need attention');
  }

  console.log('\n📁 Test screenshots saved in .ai/ directory');
  console.log('🖥️  Browser window will stay open for inspection...');
  console.log('   Press Ctrl+C to close.\n');

  await new Promise(() => {});
}

testWorkflow().catch(console.error);
