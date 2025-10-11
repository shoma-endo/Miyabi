/**
 * Detailed UI Verification Script
 *
 * 新しいUIコンポーネントが正しく表示されているか詳細に検証
 */

import { chromium } from 'playwright';

async function verifyUI() {
  console.log('🔍 Starting Detailed UI Verification...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // ゆっくり動かして確認しやすく
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ダッシュボードにアクセス
  console.log('📡 Connecting to dashboard...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  console.log('\n========== UI Component Verification ==========\n');

  // 1. ワークフローステージインジケーターの確認
  console.log('1️⃣  Checking Workflow Stage Indicator...');
  const stageIndicator = await page.evaluate(() => {
    // Find element by text content instead of :has() selector
    const elements = Array.from(document.querySelectorAll('div'));
    const element = elements.find(el => el.textContent?.includes('自律ワークフロー'));
    if (!element) return null;

    return {
      exists: true,
      text: element.textContent,
      hasStages: element.textContent?.includes('タスク発見') &&
                 element.textContent?.includes('分析') &&
                 element.textContent?.includes('タスク分解'),
    };
  });

  if (stageIndicator?.exists) {
    console.log('   ✅ Workflow Stage Indicator is present');
    console.log('   ✅ Contains expected stages:', stageIndicator.hasStages);
  } else {
    console.log('   ❌ Workflow Stage Indicator NOT FOUND');
  }

  await page.screenshot({ path: '.ai/verify-1-stage-indicator.png', fullPage: false });
  console.log('   📸 Screenshot saved: verify-1-stage-indicator.png\n');

  // 2. リアルタイム解説パネルの確認
  console.log('2️⃣  Checking Explanation Panel...');
  const explanationPanel = await page.evaluate(() => {
    // 「リアルタイム解説」というテキストを含む要素を探す
    const panels = Array.from(document.querySelectorAll('div'));
    const panel = panels.find(div => div.textContent?.includes('リアルタイム解説'));

    if (!panel) return null;

    return {
      exists: true,
      hasTitle: panel.textContent?.includes('今何が起こっているか'),
      hasHistory: panel.textContent?.includes('履歴') || panel.textContent?.includes('History'),
      isVisible: panel.offsetParent !== null,
    };
  });

  if (explanationPanel?.exists) {
    console.log('   ✅ Explanation Panel is present');
    console.log('   ✅ Has title section:', explanationPanel.hasTitle);
    console.log('   ✅ Has history section:', explanationPanel.hasHistory);
    console.log('   ✅ Is visible:', explanationPanel.isVisible);
  } else {
    console.log('   ❌ Explanation Panel NOT FOUND');
  }

  await page.screenshot({ path: '.ai/verify-2-explanation-panel.png', fullPage: false });
  console.log('   📸 Screenshot saved: verify-2-explanation-panel.png\n');

  // 3. 凡例パネルの確認
  console.log('3️⃣  Checking Legend Panel...');
  const legendButton = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const legendBtn = buttons.find(btn => btn.textContent?.includes('凡例'));
    return {
      exists: !!legendBtn,
      text: legendBtn?.textContent,
      isVisible: legendBtn ? legendBtn.offsetParent !== null : false,
    };
  });

  if (legendButton.exists) {
    console.log('   ✅ Legend Button is present');
    console.log('   ✅ Button text:', legendButton.text);
    console.log('   ✅ Is visible:', legendButton.isVisible);

    // 凡例パネルを開く
    console.log('   🔽 Opening Legend Panel...');
    // Find and click button by text content
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const legendBtn = buttons.find(btn => btn.textContent?.includes('凡例'));
      if (legendBtn) legendBtn.click();
    });
    await page.waitForTimeout(1000);

    const legendPanel = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll('div'));
      const panel = panels.find(div =>
        div.textContent?.includes('ノードの種類') ||
        div.textContent?.includes('Agentの状態')
      );
      return {
        exists: !!panel,
        hasNodeTypes: panel?.textContent?.includes('Issue Node'),
        hasAgentStatus: panel?.textContent?.includes('IDLE'),
        hasAgentRoles: panel?.textContent?.includes('CoordinatorAgent'),
      };
    });

    console.log('   ✅ Legend Panel opened:', legendPanel.exists);
    console.log('   ✅ Has node types:', legendPanel.hasNodeTypes);
    console.log('   ✅ Has agent status:', legendPanel.hasAgentStatus);
    console.log('   ✅ Has agent roles:', legendPanel.hasAgentRoles);

    await page.screenshot({ path: '.ai/verify-3-legend-panel-open.png', fullPage: false });
    console.log('   📸 Screenshot saved: verify-3-legend-panel-open.png\n');
  } else {
    console.log('   ❌ Legend Button NOT FOUND');
  }

  // 4. Activity Logの確認
  console.log('4️⃣  Checking Activity Log...');
  const activityLog = await page.evaluate(() => {
    const logElement = document.querySelector('[class*="activity"]') ||
                      Array.from(document.querySelectorAll('div')).find(div =>
                        div.textContent?.includes('ACTIVITY LOG')
                      );
    return {
      exists: !!logElement,
      text: logElement?.textContent?.substring(0, 100),
    };
  });

  console.log('   ✅ Activity Log exists:', activityLog.exists);
  if (activityLog.text) {
    console.log('   ✅ Activity Log preview:', activityLog.text);
  }

  await page.screenshot({ path: '.ai/verify-4-activity-log.png', fullPage: false });
  console.log('   📸 Screenshot saved: verify-4-activity-log.png\n');

  // 5. 全体スクリーンショット
  console.log('5️⃣  Taking full page screenshot...');
  await page.screenshot({ path: '.ai/verify-5-full-dashboard.png', fullPage: true });
  console.log('   📸 Screenshot saved: verify-5-full-dashboard.png\n');

  console.log('\n========== Verification Complete ==========\n');
  console.log('📁 All screenshots saved in .ai/ directory');
  console.log('👀 Please review the screenshots to confirm UI improvements\n');

  // ブラウザを閉じずに待機（ユーザーが確認できるように）
  console.log('🖥️  Browser window will stay open for manual inspection...');
  console.log('   Press Ctrl+C to close when done.\n');

  // 永続的に待機
  await new Promise(() => {});
}

verifyUI().catch(console.error);
