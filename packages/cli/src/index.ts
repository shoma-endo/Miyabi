#!/usr/bin/env node

/**
 * @agentic-os/cli - Zero-learning-cost CLI for Agentic OS
 *
 * Commands:
 * - init <project-name>  : Create new project with Agentic OS
 * - install              : Install Agentic OS into existing project
 * - status               : Check agent status and activity
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { install } from './commands/install.js';
import { status } from './commands/status.js';

const program = new Command();

program
  .name('agentic-os')
  .description('Zero-learning-cost autonomous development framework')
  .version('0.1.0');

// ============================================================================
// Command: init
// ============================================================================

program
  .command('init <project-name>')
  .description('Create a new project with Agentic OS (5 min setup)')
  .option('-p, --private', 'Create private repository', false)
  .option('--skip-install', 'Skip npm install', false)
  .action(async (projectName: string, options) => {
    try {
      console.log(chalk.cyan.bold('\n🚀 Agentic OS - Zero Learning Cost Setup\n'));
      await init(projectName, options);
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Setup failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Command: install
// ============================================================================

program
  .command('install')
  .description('Install Agentic OS into existing project')
  .option('--dry-run', 'Show what would be installed without making changes', false)
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🔍 Agentic OS - Project Analysis\n'));
      await install(options);
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Installation failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Command: status
// ============================================================================

program
  .command('status')
  .description('Check agent status and recent activity')
  .option('-w, --watch', 'Watch mode (auto-refresh every 10s)', false)
  .action(async (options) => {
    try {
      await status(options);
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Status check failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Parse and execute
// ============================================================================

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log('\n💡 Quick start:');
  console.log(chalk.cyan('  npx agentic-os init my-project'));
  console.log(chalk.gray('  → Creates new project with full automation\n'));
  console.log(chalk.cyan('  cd existing-project && npx agentic-os install'));
  console.log(chalk.gray('  → Adds automation to existing project\n'));
}
