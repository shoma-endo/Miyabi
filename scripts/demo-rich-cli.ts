#!/usr/bin/env tsx
/**
 * Rich CLI Output Demo
 *
 * Demonstrates the capabilities of the Agentic OS UI system
 * Addresses Issue #4 - Rich CLI Output Styling
 *
 * Usage:
 *   npx tsx scripts/demo-rich-cli.ts
 */

import { logger, theme } from '../agents/ui/index.js';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Clear screen
  logger.clear();

  // ===== HEADER DEMO =====
  logger.header('🌍 Agentic OS — UI System Demo', true);

  logger.muted('Demonstrating rich CLI output capabilities...');
  logger.newline();

  // ===== STATUS MESSAGES =====
  logger.section('✨', 'Status Messages');
  logger.success('Operation completed successfully');
  logger.error('Something went wrong', new Error('Example error'));
  logger.warning('This is a warning message');
  logger.info('Informational message');
  logger.newline();

  // ===== AGENT MESSAGES =====
  logger.section('🤖', 'Agent Messages');
  logger.agent('CoordinatorAgent', 'Analyzing Issue #123...');
  logger.agent('CodeGenAgent', 'Generating code for login component');
  logger.agent('ReviewAgent', 'Running quality checks...');
  logger.agent('IssueAgent', 'Auto-labeling Issue #456');
  logger.agent('PRAgent', 'Creating Draft PR #789');
  logger.agent('DeploymentAgent', 'Deploying to production...');
  logger.newline();

  // ===== HUMAN MESSAGES =====
  logger.section('👤', 'Human/Guardian Messages');
  logger.human('Guardian approval required');
  logger.human('PR #3 approved for merge');
  logger.newline();

  // ===== BOXES =====
  logger.section('📦', 'Boxes & Containers');

  logger.box(
    `🤖 CoordinatorAgent v1.0.0\nTask: Analyze Issue #123\nStatus: In Progress`,
    {
      title: 'Agent Status',
      borderStyle: 'round',
      padding: 1,
    }
  );

  logger.newline();

  logger.box(
    `Total Cost: $245.50 / $500.00\nConsumption Rate: 49.1%\nStatus: ✅ Healthy`,
    {
      title: '💰 Economic Circuit Breaker',
      borderStyle: 'double',
      borderColor: theme.colors.success,
      padding: 1,
    }
  );

  logger.newline();

  // ===== SPINNERS =====
  logger.section('⏳', 'Spinners & Progress');

  const spinner1 = logger.startSpinner('Analyzing issue structure...');
  await sleep(2000);
  logger.stopSpinnerSuccess(spinner1, 'Issue analysis complete (2.3s)');

  const spinner2 = logger.startSpinner('Generating code...');
  await sleep(1500);
  logger.stopSpinnerSuccess(spinner2, 'Code generation complete (1.5s)');

  const spinner3 = logger.startSpinner('Running tests...');
  await sleep(1000);
  logger.stopSpinnerWarn(spinner3, '2 warnings found');

  logger.newline();

  // ===== PROGRESS BARS =====
  logger.section('📊', 'Progress Bars');

  logger.log('Overall Progress: ' + logger.progressBar(75, 100, 40));
  logger.log('CodeGenAgent:     ' + logger.progressBar(100, 100, 40));
  logger.log('ReviewAgent:      ' + logger.progressBar(60, 100, 40));
  logger.log('TestAgent:        ' + logger.progressBar(30, 100, 40));

  logger.newline();

  // ===== KEY-VALUE PAIRS =====
  logger.section('🔑', 'Key-Value Pairs');

  logger.keyValue('Issue Number', '#123', theme.colors.primary);
  logger.keyValue('Agent', 'CoordinatorAgent', theme.colors.agent);
  logger.keyValue('Status', 'Completed', theme.colors.success);
  logger.keyValue('Duration', '5m 32s', theme.colors.info);
  logger.keyValue('Quality Score', '87/100', theme.colors.warning);

  logger.newline();

  // ===== STATUS INDICATORS =====
  logger.section('🚦', 'Status Indicators');

  logger.status('ESLint passed', 'success');
  logger.status('TypeScript passed', 'success');
  logger.status('Security scan passed', 'success');
  logger.status('Test coverage: 87.5%', 'warning');
  logger.status('Deployment pending', 'pending');

  logger.newline();

  // ===== LISTS & BULLETS =====
  logger.section('📝', 'Lists & Bullets');

  logger.bullet('Task 1: Generate login component');
  logger.bullet('Task 2: Implement JWT auth');
  logger.bullet('Task 3: Write tests');
  logger.indent();
  logger.bullet('Subtask 3.1: Unit tests');
  logger.bullet('Subtask 3.2: Integration tests');
  logger.outdent();

  logger.newline();

  // ===== DIVIDERS =====
  logger.section('➖', 'Dividers');

  logger.divider('light');
  logger.muted('Light divider');
  logger.divider('heavy');
  logger.muted('Heavy divider');
  logger.divider('double');
  logger.muted('Double divider');

  logger.newline();

  // ===== GRADIENT TEXT =====
  logger.section('🌈', 'Gradient Text');

  logger.gradient('Agentic OS — The Future of Development');

  logger.newline();

  // ===== FINAL BOX =====
  logger.box(
    `✅ Demo Complete!\n\nAll UI components demonstrated successfully.\nReady for integration into Agent systems.`,
    {
      title: '🎉 Success',
      borderStyle: 'bold',
      borderColor: theme.colors.success,
      padding: 1,
      align: 'center',
    }
  );

  logger.newline();
  logger.muted('Run with: npx tsx scripts/demo-rich-cli.ts');
  logger.newline();
}

main().catch((error) => {
  logger.error('Demo failed', error);
  process.exit(1);
});
