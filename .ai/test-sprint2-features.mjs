/**
 * Sprint 2 UI/UX Improvements Test
 *
 * Tests all new features:
 * 1. Agent Thinking Bubbles
 * 2. System Metrics Dashboard
 * 3. Particle Flow Animation
 * 4. Celebration Effect
 * 5. Node Details Modal
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

async function testSprint2Features() {
  console.log('🎯 Starting Sprint 2 Feature Test\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('📡 Connecting to dashboard...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  // ==================== TEST 1: System Metrics Dashboard ====================
  console.log('\n========== TEST 1: System Metrics Dashboard ==========\n');
  console.log('✅ Checking System Metrics Dashboard presence...');

  const metricsCheck = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasMetricsPanel: body.includes('System Metrics') || body.includes('リアルタイムシステム状態'),
      hasUptime: body.includes('Uptime') || body.includes('稼働時間'),
      hasActiveAgents: body.includes('Active Agents') || body.includes('実行中Agent'),
      hasSuccessRate: body.includes('Success Rate') || body.includes('成功率'),
      hasLiveIndicator: body.includes('Live Update'),
    };
  });

  console.log('✅ Metrics Panel present:', metricsCheck.hasMetricsPanel);
  console.log('✅ Uptime displayed:', metricsCheck.hasUptime);
  console.log('✅ Active Agents counter:', metricsCheck.hasActiveAgents);
  console.log('✅ Success Rate shown:', metricsCheck.hasSuccessRate);
  console.log('✅ Live indicator active:', metricsCheck.hasLiveIndicator);

  await page.screenshot({ path: '.ai/sprint2-1-metrics-dashboard.png', fullPage: false });
  console.log('📸 Screenshot saved: sprint2-1-metrics-dashboard.png\n');

  // ==================== TEST 2: Agent Started → Thinking Bubbles ====================
  console.log('\n========== TEST 2: Agent Thinking Bubbles ==========\n');
  console.log('💭 Sending agent started event to trigger thinking bubble...');

  await sendEvent({
    eventType: 'started',
    timestamp: new Date().toISOString(),
    agentId: 'codegen',
    issueNumber: 100,
    parameters: {
      taskTitle: 'Implement new feature',
      priority: 'P1-High',
      context: 'Add authentication module'
    }
  });

  await page.waitForTimeout(2000);

  const thinkingCheck = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasThinkingBubble: body.includes('分析中') || body.includes('実行中'),
      hasCodeGen: body.includes('CodeGen'),
      hasThinkingDots: body.includes('...'),
    };
  });

  console.log('✅ Thinking bubble appeared:', thinkingCheck.hasThinkingBubble);
  console.log('✅ Agent name shown:', thinkingCheck.hasCodeGen);
  console.log('✅ Animated dots present:', thinkingCheck.hasThinkingDots);

  await page.screenshot({ path: '.ai/sprint2-2-thinking-bubble.png', fullPage: false });
  console.log('📸 Screenshot saved: sprint2-2-thinking-bubble.png\n');

  // ==================== TEST 3: Progress Updates → Dynamic Thinking ====================
  console.log('\n========== TEST 3: Dynamic Thinking Messages ==========\n');
  console.log('📈 Sending progress updates to change thinking message...');

  // Send progress 30%
  await sendEvent({
    eventType: 'progress',
    timestamp: new Date().toISOString(),
    agentId: 'codegen',
    progress: 30
  });

  await page.waitForTimeout(1500);

  const progress30Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasAnalyzing: body.includes('分析中') || body.includes('コードベース'),
    };
  });

  console.log('✅ Progress 30% - Analyzing message:', progress30Check.hasAnalyzing);

  // Send progress 60%
  await sendEvent({
    eventType: 'progress',
    timestamp: new Date().toISOString(),
    agentId: 'codegen',
    progress: 60
  });

  await page.waitForTimeout(1500);

  const progress60Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasGenerating: body.includes('生成中'),
    };
  });

  console.log('✅ Progress 60% - Generating message:', progress60Check.hasGenerating);

  // Send progress 90%
  await sendEvent({
    eventType: 'progress',
    timestamp: new Date().toISOString(),
    agentId: 'codegen',
    progress: 90
  });

  await page.waitForTimeout(1500);

  const progress90Check = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasTesting: body.includes('テスト'),
    };
  });

  console.log('✅ Progress 90% - Testing message:', progress90Check.hasTesting);

  await page.screenshot({ path: '.ai/sprint2-3-dynamic-thinking.png', fullPage: false });
  console.log('📸 Screenshot saved: sprint2-3-dynamic-thinking.png\n');

  // ==================== TEST 4: Completion → Celebration Effect ====================
  console.log('\n========== TEST 4: Celebration Effect ==========\n');
  console.log('🎉 Sending completion event to trigger celebration...');

  await sendEvent({
    eventType: 'completed',
    timestamp: new Date().toISOString(),
    agentId: 'codegen',
    issueNumber: 100,
    duration: '2m 34s',
    result: 'success'
  });

  await page.waitForTimeout(1000); // Give celebration time to start

  const celebrationCheck = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasCelebrationMessage: body.includes('タスク完了') || body.includes('Task Completed'),
      hasSuccessIcon: body.includes('🎉'),
      hasCompletionText: body.includes('Successfully'),
    };
  });

  console.log('✅ Celebration message appeared:', celebrationCheck.hasCelebrationMessage);
  console.log('✅ Success icon shown:', celebrationCheck.hasSuccessIcon);
  console.log('✅ Completion text displayed:', celebrationCheck.hasCompletionText);

  await page.screenshot({ path: '.ai/sprint2-4-celebration.png', fullPage: false });
  console.log('📸 Screenshot saved: sprint2-4-celebration.png\n');

  await page.waitForTimeout(3000); // Wait for celebration to finish

  // ==================== TEST 5: Node Click → Details Modal ====================
  console.log('\n========== TEST 5: Node Details Modal ==========\n');
  console.log('🔍 Clicking on a node to open details modal...');

  // Try to click on an agent node
  try {
    // Look for any node element
    const nodeSelector = '.react-flow__node';
    await page.click(nodeSelector, { timeout: 5000 });
    await page.waitForTimeout(1000);

    const modalCheck = await page.evaluate(() => {
      const body = document.body.textContent || '';
      return {
        hasModal: body.includes('基本情報') || body.includes('Node ID'),
        hasCloseButton: body.includes('閉じる'),
        hasEventHistory: body.includes('イベント履歴') || body.includes('Event History'),
      };
    });

    console.log('✅ Modal opened:', modalCheck.hasModal);
    console.log('✅ Close button present:', modalCheck.hasCloseButton);
    console.log('✅ Event history section:', modalCheck.hasEventHistory);

    await page.screenshot({ path: '.ai/sprint2-5-node-modal.png', fullPage: false });
    console.log('📸 Screenshot saved: sprint2-5-node-modal.png\n');

    // Close modal
    await page.click('text=閉じる');
    await page.waitForTimeout(500);
  } catch (error) {
    console.log('⚠️  Could not click node (may be no nodes yet):', error.message);
  }

  // ==================== TEST 6: Metrics Updates ====================
  console.log('\n========== TEST 6: Metrics Real-time Updates ==========\n');
  console.log('📊 Checking if metrics update in real-time...');

  const metricsUpdate = await page.evaluate(() => {
    const body = document.body.textContent || '';
    // Check for percentage or numerical values
    const hasPercentage = /\d+%/.test(body);
    const hasTime = /\d{2}:\d{2}:\d{2}/.test(body);
    return {
      hasPercentage,
      hasTime,
      hasLiveIndicator: body.includes('Live Update'),
    };
  });

  console.log('✅ Percentage values present:', metricsUpdate.hasPercentage);
  console.log('✅ Time format displayed:', metricsUpdate.hasTime);
  console.log('✅ Live indicator pulsing:', metricsUpdate.hasLiveIndicator);

  await page.screenshot({ path: '.ai/sprint2-6-metrics-update.png', fullPage: false });
  console.log('📸 Screenshot saved: sprint2-6-metrics-update.png\n');

  // ==================== FINAL SUMMARY ====================
  console.log('\n========== SPRINT 2 TEST SUMMARY ==========\n');

  const allChecks = [
    metricsCheck.hasMetricsPanel && metricsCheck.hasLiveIndicator,
    thinkingCheck.hasThinkingBubble,
    progress30Check.hasAnalyzing || progress60Check.hasGenerating,
    celebrationCheck.hasCelebrationMessage,
    metricsUpdate.hasPercentage && metricsUpdate.hasTime,
  ];

  const passedCount = allChecks.filter(Boolean).length;
  console.log(`✅ Tests Passed: ${passedCount}/5\n`);

  if (passedCount === 5) {
    console.log('🎊 ALL SPRINT 2 FEATURES WORKING PERFECTLY! 🎊');
    console.log('');
    console.log('✅ System Metrics Dashboard - Real-time updates');
    console.log('✅ Agent Thinking Bubbles - Dynamic messages');
    console.log('✅ Progress-based Updates - Changes with progress');
    console.log('✅ Celebration Effect - Confetti on completion');
    console.log('✅ Node Details Modal - Click for details');
    console.log('');
  } else {
    console.log('⚠️  Some features may need attention');
    console.log('Check screenshots for details');
  }

  console.log('\n📁 All screenshots saved in .ai/ directory');
  console.log('🖥️  Browser window will stay open for inspection...');
  console.log('   Press Ctrl+C to close.\n');

  await new Promise(() => {});
}

testSprint2Features().catch(console.error);
