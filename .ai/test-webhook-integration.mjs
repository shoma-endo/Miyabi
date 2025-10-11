#!/usr/bin/env node
/**
 * Webhook統合テスト
 * 実際のタスク実行をシミュレートしてWebhookイベントをテスト
 */

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3001';

/**
 * イベント送信関数
 */
async function sendEvent(eventData) {
  const url = `${DASHBOARD_URL}/api/agent-event`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Event sent: ${eventData.eventType} - ${eventData.agentId} #${eventData.issueNumber}`);
      return true;
    } else {
      console.error(`❌ Event failed:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Network error:`, error.message);
    return false;
  }
}

/**
 * Sleep helper
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * メインテスト
 */
async function main() {
  console.log('\n🧪 Webhook統合テスト開始\n');
  console.log(`Dashboard URL: ${DASHBOARD_URL}`);
  console.log(`─────────────────────────────────────\n`);

  // Test 1: CoordinatorAgent workflow
  console.log('📋 Test 1: CoordinatorAgent ワークフロー');
  await sendEvent({
    eventType: 'started',
    agentId: 'coordinator',
    issueNumber: 1001,
    timestamp: new Date().toISOString(),
    parameters: {
      taskTitle: 'Integration Test Task',
      priority: 'P1-High',
      source: 'test-webhook-integration',
    },
  });

  await sleep(500);

  await sendEvent({
    eventType: 'progress',
    agentId: 'coordinator',
    issueNumber: 1001,
    progress: 30,
    message: 'Analyzing dependencies...',
    timestamp: new Date().toISOString(),
  });

  await sleep(500);

  await sendEvent({
    eventType: 'progress',
    agentId: 'coordinator',
    issueNumber: 1001,
    progress: 60,
    message: 'Building DAG...',
    timestamp: new Date().toISOString(),
  });

  await sleep(500);

  await sendEvent({
    eventType: 'completed',
    agentId: 'coordinator',
    issueNumber: 1001,
    timestamp: new Date().toISOString(),
    result: {
      success: true,
      subTasks: 3,
      duration: 1500,
    },
  });

  console.log('✅ Test 1: 完了\n');

  await sleep(1000);

  // Test 2: CodeGenAgent workflow
  console.log('📋 Test 2: CodeGenAgent ワークフロー');
  await sendEvent({
    eventType: 'started',
    agentId: 'codegen',
    issueNumber: 1002,
    timestamp: new Date().toISOString(),
    parameters: {
      taskTitle: 'Generate test components',
      context: 'React components for testing',
    },
  });

  await sleep(500);

  await sendEvent({
    eventType: 'progress',
    agentId: 'codegen',
    issueNumber: 1002,
    progress: 50,
    message: 'Generating components...',
    timestamp: new Date().toISOString(),
  });

  await sleep(500);

  await sendEvent({
    eventType: 'completed',
    agentId: 'codegen',
    issueNumber: 1002,
    timestamp: new Date().toISOString(),
    result: {
      success: true,
      filesGenerated: 5,
      linesOfCode: 234,
    },
  });

  console.log('✅ Test 2: 完了\n');

  await sleep(1000);

  // Test 3: Error handling
  console.log('📋 Test 3: エラーハンドリング');
  await sendEvent({
    eventType: 'started',
    agentId: 'review',
    issueNumber: 1003,
    timestamp: new Date().toISOString(),
  });

  await sleep(500);

  await sendEvent({
    eventType: 'error',
    agentId: 'review',
    issueNumber: 1003,
    timestamp: new Date().toISOString(),
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Code quality below threshold',
      details: 'Score: 45/100 (minimum: 70)',
    },
  });

  console.log('✅ Test 3: 完了\n');

  await sleep(1000);

  // Test 4: Multiple agents in parallel
  console.log('📋 Test 4: 並列Agent実行');

  const agents = ['codegen', 'review', 'test'];
  const promises = agents.map((agentId, index) =>
    sendEvent({
      eventType: 'started',
      agentId,
      issueNumber: 1004 + index,
      timestamp: new Date().toISOString(),
    })
  );

  await Promise.all(promises);

  await sleep(500);

  const progressPromises = agents.map((agentId, index) =>
    sendEvent({
      eventType: 'progress',
      agentId,
      issueNumber: 1004 + index,
      progress: 100,
      message: 'Completed',
      timestamp: new Date().toISOString(),
    })
  );

  await Promise.all(progressPromises);

  console.log('✅ Test 4: 完了\n');

  console.log('─────────────────────────────────────');
  console.log('🎉 全テスト完了！\n');
  console.log('👀 Dashboard (http://localhost:5173) でリアルタイム更新を確認してください。');
}

main().catch(console.error);
