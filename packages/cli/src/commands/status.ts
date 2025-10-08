/**
 * status command - Check agent status and activity
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { Octokit } from '@octokit/rest';

export interface StatusOptions {
  watch?: boolean;
}

export async function status(options: StatusOptions = {}) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error(chalk.red('\n❌ GITHUB_TOKEN not found in environment\n'));
    console.log(chalk.gray('Please set GITHUB_TOKEN:'));
    console.log(chalk.white('  export GITHUB_TOKEN=ghp_your_token\n'));
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  // Get current repository
  const repo = await getCurrentRepo();

  if (!repo) {
    console.error(chalk.red('\n❌ Not in a git repository\n'));
    process.exit(1);
  }

  // Fetch status
  await displayStatus(octokit, repo.owner, repo.name);

  if (options.watch) {
    console.log(chalk.gray('\n👀 Watch mode active (refreshing every 10s)...'));
    console.log(chalk.gray('Press Ctrl+C to exit\n'));

    setInterval(async () => {
      console.clear();
      await displayStatus(octokit, repo.owner, repo.name);
    }, 10000);
  }
}

async function getCurrentRepo(): Promise<{ owner: string; name: string } | null> {
  try {
    const { execSync } = await import('child_process');
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();

    const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/);

    if (match) {
      return { owner: match[1], name: match[2] };
    }
  } catch {
    return null;
  }

  return null;
}

async function displayStatus(octokit: Octokit, owner: string, repo: string) {
  console.log(chalk.cyan.bold(`\n📊 Agentic OS Status - ${owner}/${repo}\n`));

  // Fetch open issues
  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  // Count by state
  const states = {
    pending: 0,
    analyzing: 0,
    implementing: 0,
    reviewing: 0,
    blocked: 0,
    paused: 0,
  };

  for (const issue of issues) {
    for (const label of issue.labels) {
      const labelName = typeof label === 'string' ? label : label.name || '';

      if (labelName.includes('state:pending')) states.pending++;
      else if (labelName.includes('state:analyzing')) states.analyzing++;
      else if (labelName.includes('state:implementing')) states.implementing++;
      else if (labelName.includes('state:reviewing')) states.reviewing++;
      else if (labelName.includes('state:blocked')) states.blocked++;
      else if (labelName.includes('state:paused')) states.paused++;
    }
  }

  // Display table
  const table = new Table({
    head: ['State', 'Count', 'Status'],
    style: { head: ['cyan'] },
  });

  table.push(
    ['📥 Pending', states.pending.toString(), states.pending > 0 ? '⏳ Waiting' : '✓ Clear'],
    [
      '🔍 Analyzing',
      states.analyzing.toString(),
      states.analyzing > 0 ? '🔄 Active' : '✓ Clear',
    ],
    [
      '🏗️  Implementing',
      states.implementing.toString(),
      states.implementing > 0 ? '⚡ Working' : '✓ Clear',
    ],
    [
      '👀 Reviewing',
      states.reviewing.toString(),
      states.reviewing > 0 ? '🔍 Checking' : '✓ Clear',
    ],
    ['🚫 Blocked', states.blocked.toString(), states.blocked > 0 ? '⚠️  Needs help' : '✓ Clear'],
    ['⏸️  Paused', states.paused.toString(), states.paused > 0 ? '💤 Sleeping' : '✓ Clear']
  );

  console.log(table.toString());

  // Recent activity
  const { data: recentPRs } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    sort: 'created',
    direction: 'desc',
    per_page: 5,
  });

  if (recentPRs.length > 0) {
    console.log(chalk.cyan('\n📝 Recent Pull Requests:\n'));

    for (const pr of recentPRs) {
      console.log(chalk.white(`  #${pr.number} ${pr.title}`));
      console.log(chalk.gray(`    ${pr.html_url}\n`));
    }
  }

  // Summary
  const totalActive = states.analyzing + states.implementing + states.reviewing;
  console.log(chalk.cyan('📈 Summary:\n'));
  console.log(chalk.white(`  Total open Issues: ${issues.length}`));
  console.log(chalk.white(`  Active agents: ${totalActive}`));
  console.log(chalk.white(`  Blocked: ${states.blocked}`));
  console.log();
}
