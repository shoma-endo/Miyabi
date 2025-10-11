/**
 * Simple UI Verification Script
 *
 * 新しいUIコンポーネントが正しく表示されているか検証
 */

import { chromium } from 'playwright';

async function verifyUI() {
  console.log('🔍 Starting UI Verification...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // ゆっくり動かして確認しやすく
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ダッシュボードにアクセス
  console.log('📡 Connecting to dashboard: http://localhost:5173');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);

  console.log('\n========== INITIAL STATE VERIFICATION ==========\n');

  // 初期状態のスクリーンショット
  await page.screenshot({ path: '.ai/verify-0-initial.png', fullPage: false });
  console.log('📸 Initial screenshot saved\n');

  // 1. ワークフローステージインジケーターの確認
  console.log('1️⃣  Checking for Workflow Stage Indicator...');
  const hasWorkflow = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasTitle: body.includes('自律ワークフロー') || body.includes('Autonomous Workflow'),
      hasDiscovery: body.includes('タスク発見') || body.includes('Task Discovery'),
      hasAnalysis: body.includes('分析') || body.includes('Analysis'),
      hasDecomposition: body.includes('タスク分解') || body.includes('Task Decomposition'),
      hasAssignment: body.includes('Agent割り当て') || body.includes('Agent Assignment'),
      hasExecution: body.includes('実行') || body.includes('Execution'),
    };
  });

  console.log('   Workflow Title:', hasWorkflow.hasTitle ? '✅' : '❌');
  console.log('   Discovery Stage:', hasWorkflow.hasDiscovery ? '✅' : '❌');
  console.log('   Analysis Stage:', hasWorkflow.hasAnalysis ? '✅' : '❌');
  console.log('   Decomposition Stage:', hasWorkflow.hasDecomposition ? '✅' : '❌');
  console.log('   Assignment Stage:', hasWorkflow.hasAssignment ? '✅' : '❌');
  console.log('   Execution Stage:', hasWorkflow.hasExecution ? '✅' : '❌');

  // 2. リアルタイム解説パネルの確認
  console.log('\n2️⃣  Checking for Explanation Panel...');
  const hasExplanation = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasTitle: body.includes('リアルタイム解説'),
      hasSubtitle: body.includes('今何が起こっているか'),
      hasHistory: body.includes('履歴') || body.includes('History'),
    };
  });

  console.log('   Panel Title:', hasExplanation.hasTitle ? '✅' : '❌');
  console.log('   Subtitle:', hasExplanation.hasSubtitle ? '✅' : '❌');
  console.log('   History Section:', hasExplanation.hasHistory ? '✅' : '❌');

  // 3. 凡例パネルボタンの確認
  console.log('\n3️⃣  Checking for Legend Panel...');
  const hasLegend = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return {
      hasButton: body.includes('凡例を表示') || body.includes('凡例'),
    };
  });

  console.log('   Legend Button:', hasLegend.hasButton ? '✅' : '❌');

  if (hasLegend.hasButton) {
    console.log('   🔽 Clicking Legend Button...');
    try {
      await page.click('text=凡例');
      await page.waitForTimeout(1000);

      const legendOpen = await page.evaluate(() => {
        const body = document.body.textContent || '';
        return {
          hasNodeTypes: body.includes('ノードの種類'),
          hasAgentStatus: body.includes('Agentの状態'),
          hasIssueNode: body.includes('Issue Node'),
          hasIDLE: body.includes('IDLE'),
          hasRUNNING: body.includes('RUNNING'),
        };
      });

      console.log('   Node Types Section:', legendOpen.hasNodeTypes ? '✅' : '❌');
      console.log('   Agent Status Section:', legendOpen.hasAgentStatus ? '✅' : '❌');
      console.log('   Issue Node:', legendOpen.hasIssueNode ? '✅' : '❌');
      console.log('   IDLE Status:', legendOpen.hasIDLE ? '✅' : '❌');
      console.log('   RUNNING Status:', legendOpen.hasRUNNING ? '✅' : '❌');

      await page.screenshot({ path: '.ai/verify-1-legend-open.png', fullPage: false });
      console.log('   📸 Legend panel screenshot saved\n');
    } catch (e) {
      console.log('   ❌ Failed to open legend panel:', e.message);
    }
  }

  // 4. 全体の確認
  console.log('\n4️⃣  Taking final screenshots...');
  await page.screenshot({ path: '.ai/verify-2-full-page.png', fullPage: true });
  console.log('   📸 Full page screenshot saved\n');

  console.log('\n========== VERIFICATION SUMMARY ==========\n');

  const allChecks = [
    hasWorkflow.hasTitle,
    hasWorkflow.hasDiscovery,
    hasExplanation.hasTitle,
    hasLegend.hasButton,
  ];

  const passedChecks = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;

  console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);

  if (passedChecks === totalChecks) {
    console.log('🎉 All UI components are present!');
  } else {
    console.log('⚠️  Some UI components may be missing');
  }

  console.log('\n📁 Screenshots saved in .ai/ directory:');
  console.log('   - verify-0-initial.png');
  console.log('   - verify-1-legend-open.png');
  console.log('   - verify-2-full-page.png');

  console.log('\n🖥️  Browser window will stay open for manual inspection...');
  console.log('   Press Ctrl+C in terminal to close.\n');

  // 永続的に待機
  await new Promise(() => {});
}

verifyUI().catch(console.error);
