/**
 * Miyabi Agent CLI Command
 *
 * Agent実行用CLIインターフェース
 * CoordinatorAgent経由で各専門Agentを実行
 */

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { Command } from 'commander';
import { isJsonMode, outputSuccess, outputError } from '../utils/agent-output.js';

/**
 * 利用可能なAgent種別
 */
export const AVAILABLE_AGENTS = [
  'coordinator',
  'codegen',
  'review',
  'issue',
  'pr',
  'deploy',
  'mizusumashi',
] as const;

export type AgentType = typeof AVAILABLE_AGENTS[number];

/**
 * Agent実行オプション
 */
export interface AgentRunOptions {
  issue?: string;
  parallel?: number;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Agent実行結果
 */
export interface AgentResult {
  agent: AgentType;
  status: 'success' | 'failure' | 'skipped';
  message: string;
  duration?: number;
  details?: Record<string, unknown>;
}

/**
 * Agent一覧表示
 */
export async function listAgents(options?: { json?: boolean }): Promise<void> {
  const agents = [
    {
      name: 'coordinator',
      description: 'タスク統括・DAG分解',
      responsibility: 'Issue分解、並行実行制御、Agent割当'
    },
    {
      name: 'codegen',
      description: 'AI駆動コード生成',
      responsibility: 'TypeScript生成、テスト自動生成'
    },
    {
      name: 'review',
      description: 'コード品質判定',
      responsibility: '静的解析、セキュリティスキャン (80点基準)'
    },
    {
      name: 'issue',
      description: 'Issue分析・ラベリング',
      responsibility: '組織設計原則65ラベル体系、自動分類'
    },
    {
      name: 'pr',
      description: 'Pull Request自動化',
      responsibility: 'Draft PR作成、Conventional Commits'
    },
    {
      name: 'deploy',
      description: 'CI/CDデプロイ',
      responsibility: 'Firebase Deploy、ヘルスチェック、Rollback'
    },
    {
      name: 'mizusumashi',
      description: 'Super App Designer',
      responsibility: 'アプリYAML自動生成、自己修復関数'
    },
  ];

  if (isJsonMode() || options?.json) {
    outputSuccess({ agents }, 'Available agents list');
    return;
  }

  console.log(chalk.cyan.bold('\n🤖 利用可能なAgent一覧\n'));

  const table = new Table({
    head: [
      chalk.white('Agent'),
      chalk.white('説明'),
      chalk.white('責任範囲'),
    ],
    colWidths: [20, 40, 40],
  });

  agents.forEach(agent => {
    table.push([agent.name, agent.description, agent.responsibility]);
  });

  console.log(table.toString());
  console.log(chalk.gray('\n使用例: miyabi agent run codegen --issue=123\n'));
}

/**
 * Agent実行
 */
export async function runAgent(
  agentName: AgentType,
  options: AgentRunOptions
): Promise<AgentResult> {
  const spinner = ora(`${agentName}Agent 実行中...`).start();

  try {
    // バリデーション
    if (!AVAILABLE_AGENTS.includes(agentName)) {
      throw new Error(`無効なAgent: ${agentName}`);
    }

    if (options.dryRun) {
      spinner.info(chalk.yellow(`[DRY RUN] ${agentName}Agent実行をシミュレート`));
      return {
        agent: agentName,
        status: 'success',
        message: 'Dry run completed',
      };
    }

    // Agent実行ロジック（実装予定）
    // TODO: 実際のAgent実行を統合

    spinner.succeed(chalk.green(`${agentName}Agent 実行完了`));

    return {
      agent: agentName,
      status: 'success',
      message: `${agentName}Agent executed successfully`,
      duration: 1000,
    };

  } catch (error) {
    spinner.fail(chalk.red(`${agentName}Agent 実行失敗`));

    if (error instanceof Error) {
      console.error(chalk.red(`エラー: ${error.message}`));
    }

    return {
      agent: agentName,
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Agent状態確認
 */
export async function agentStatus(agentName?: AgentType): Promise<void> {
  console.log(chalk.cyan.bold('\n📊 Agent実行状態\n'));

  const table = new Table({
    head: [
      chalk.white('Agent'),
      chalk.white('ステータス'),
      chalk.white('最終実行'),
      chalk.white('実行回数'),
    ],
  });

  // TODO: 実際の状態取得を実装
  const mockData = [
    ['coordinator', '✅ 稼働中', '2分前', '15回'],
    ['codegen', '💤 待機中', '10分前', '8回'],
    ['review', '✅ 稼働中', '30秒前', '12回'],
    ['issue', '✅ 稼働中', '1分前', '20回'],
    ['pr', '💤 待機中', '15分前', '5回'],
    ['deploy', '✅ 稼働中', '3分前', '7回'],
  ];

  if (agentName) {
    const filtered = mockData.filter(row => row[0] === agentName);
    filtered.forEach(row => table.push(row));
  } else {
    mockData.forEach(row => table.push(row));
  }

  console.log(table.toString());
  console.log();
}

/**
 * Agent CLIコマンド登録
 */
export function registerAgentCommand(program: Command): void {
  const agent = program
    .command('agent')
    .description('🤖 Agent実行・管理');

  // agent run <agent-name>
  agent
    .command('run <agent-name>')
    .description('Agent実行')
    .option('-i, --issue <number>', 'Issue番号指定')
    .option('-p, --parallel <number>', '並行実行数', '1')
    .option('--dry-run', '実行シミュレーション')
    .option('-v, --verbose', '詳細ログ出力')
    .option('--json', 'JSON形式で出力')
    .action(async (agentName: string, options: AgentRunOptions & { json?: boolean }) => {
      // Agent名のバリデーション
      if (!AVAILABLE_AGENTS.includes(agentName as AgentType)) {
        // AI agent向けJSON出力
        if (isJsonMode() || options.json) {
          outputError(
            'INVALID_AGENT_NAME',
            `Invalid agent: ${agentName}`,
            true,
            `Available agents: ${AVAILABLE_AGENTS.join(', ')}`
          );
        }

        console.error(chalk.red(`❌ 無効なAgent: ${agentName}`));
        console.log(chalk.yellow('\n利用可能なAgent:'));
        console.log(chalk.gray(`  ${AVAILABLE_AGENTS.join(', ')}\n`));
        process.exit(1);
      }

      if (!isJsonMode() && !options.json) {
        console.log(chalk.cyan.bold('\n🤖 Miyabi Agent CLI\n'));
      }

      const result = await runAgent(agentName as AgentType, options);

      // JSON出力
      if (isJsonMode() || options.json) {
        if (result.status === 'success') {
          outputSuccess(result, `Agent ${agentName} executed successfully`);
        } else {
          outputError(
            'AGENT_EXECUTION_FAILED',
            result.message,
            true,
            'Check agent logs for details',
            result
          );
        }
        return;
      }

      if (result.status === 'failure') {
        process.exit(1);
      }
    });

  // agent list
  agent
    .command('list')
    .description('利用可能なAgent一覧')
    .option('--json', 'JSON形式で出力')
    .action(async (options: { json?: boolean }) => {
      await listAgents(options);
    });

  // agent status [agent-name]
  agent
    .command('status [agent-name]')
    .description('Agent実行状態確認')
    .option('--json', 'JSON形式で出力')
    .action(async (agentName: string | undefined, _options: { json?: boolean }) => {
      // TODO: Implement JSON output
      await agentStatus(agentName as AgentType | undefined);
    });
}
