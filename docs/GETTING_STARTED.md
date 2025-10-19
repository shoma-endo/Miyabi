# Getting Started with Miyabi (5 minutes)

**Version**: v0.1.1 (Rust Edition)
**Updated**: 2025-10-20

**Zero configuration. Zero learning curve. Just run one command.**

---

## Prerequisites

Before you begin, ensure you have:

- **Rust** (1.70+): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Git** (2.30+): For version control
- **GitHub Account**: With a Personal Access Token
- **GitHub CLI** (optional but recommended): `brew install gh` (macOS) or see [GitHub CLI](https://cli.github.com/)

### Set Up GitHub Token

```bash
# Option 1: GitHub CLI (Recommended)
gh auth login

# Option 2: Manual Environment Variable
export GITHUB_TOKEN=ghp_your_token_here
```

**Required Scopes**: `repo`, `workflow`, `read:project`, `write:project`

---

## Installation

### 🦀 Rust Edition (Recommended)

```bash
# Install from crates.io
cargo install miyabi-cli

# Verify installation
miyabi --version
```

### 📦 TypeScript Edition (Legacy)

```bash
# Run directly with npx
npx miyabi

# Or install globally
npm install -g miyabi
```

---

## Step 1: Create Project (2 min)

### Interactive Mode (Recommended)

```bash
# Start interactive setup
miyabi init my-awesome-app --interactive

? プロジェクトタイプは？
  > 🌐 Web Application
    🔌 API Backend
    🛠️ CLI Tool
    📚 Library

? GitHubリポジトリを作成しますか？ Yes
? プライベートリポジトリにしますか？ No

🚀 セットアップ開始...
✓ GitHubリポジトリ作成
✓ ラベル設定（53個）
✓ ワークフロー配置（10+個）
✓ Projects V2設定
✓ ローカルにクローン

🎉 完了！
```

### Traditional Mode

```bash
miyabi init my-awesome-app
```

This command:
1. Creates GitHub repository
2. Sets up 53 labels (automated state machine)
3. Deploys 10+ GitHub Actions workflows
4. Creates Projects V2 for tracking
5. Clones repository locally
6. Configures AI Agents

---

## Step 2: Check Project Status (30 sec)

```bash
cd my-awesome-app

# Basic status check
miyabi status

# Watch mode (auto-refresh every 3 seconds)
miyabi status --watch
```

**Output includes**:
- ✅ Miyabi installation status
- ✅ Environment variables (GITHUB_TOKEN)
- ✅ Git repository info (branch, remote)
- ✅ Active worktrees
- ✅ Recent activity (logs, reports)
- ✅ **GitHub Stats** (Open Issues, Open PRs) 🆕

---

## Step 3: Create Your First Issue (30 sec)

```bash
gh issue create --title "Add login page" --body "Email/password authentication"
```

**Or via GitHub web interface**: [Create Issue](https://github.com)

---

## Step 4: Let Miyabi Work (2 min)

### Simple Method (New! ⭐)

```bash
# Work on Issue #1
miyabi work-on 1
```

### Traditional Method

```bash
# Run Coordinator Agent on Issue #1
miyabi agent run coordinator --issue 1
```

**What happens automatically**:
1. AI automatically labels your Issue
2. CoordinatorAgent decomposes into tasks
3. CodeGenAgent implements code
4. TestAgent writes tests
5. ReviewAgent reviews quality
6. PRAgent creates Pull Request

**You literally do nothing else.**

---

## Step 5: Monitor Progress

### Watch Mode (Real-time)

```bash
miyabi status --watch

🔄 Watch Mode Active
  (Auto-refresh every 3 seconds. Press Ctrl+C to exit)

📊 Project Status

Miyabi Installation:
  ✅ Miyabi is installed

Git Repository:
  ✅ Git repository detected
    Branch: main
    ✓ Working directory clean

Worktrees:
  3 active worktree(s)
    1. .worktrees/issue-1-105ba6ff  [feature/issue-1]

GitHub Stats:
  📋 7 open issue(s)
  🔀 3 open pull request(s)
```

### JSON Output (for scripts)

```bash
miyabi status --json
```

---

## Step 6: Review and Merge PR

1. **Review PR**: Check the auto-generated Pull Request on GitHub
2. **Review Code**: Ensure quality meets your standards
3. **Run Tests**: CI/CD automatically runs tests
4. **Merge**: If all checks pass, merge the PR

```bash
gh pr list
gh pr view 1
gh pr merge 1
```

---

## That's It!

You now know everything needed to use Miyabi.

**Time spent**: ~5 minutes
**Code written**: 0 lines (AI did it all)
**Result**: Production-ready feature with tests

---

## Advanced Features (Optional)

### Parallel Execution

Process multiple Issues simultaneously:

```bash
# Process Issues #1, #2, #3 in parallel
miyabi parallel --issues 1,2,3 --concurrency 2
```

### Custom Output Styles

```bash
# YouTube Live-style output
miyabi status --output-style youtube

# Minimal output
miyabi status --output-style minimal
```

### Agent Types

**Coding Agents (6)**:
- `coordinator` - Task orchestration & decomposition
- `codegen` - AI-driven code generation
- `review` - Code quality review
- `issue` - Issue analysis & labeling
- `pr` - Pull Request creation
- `deployment` - CI/CD deployment

**Business Agents (14)** - Coming in v0.2.0:
- `ai-entrepreneur` - Business plan generation
- `market-research` - Market analysis
- And 12 more...

---

## FAQ

**Q: Do I need to learn about agents?**
A: No. They work automatically.

**Q: Do I need to label Issues?**
A: No. IssueAgent does it automatically with AI.

**Q: Do I need to assign agents?**
A: No. CoordinatorAgent does it automatically.

**Q: What if something breaks?**
A: Agents escalate issues with detailed error messages.

**Q: Which edition should I use?**
A: Rust Edition (recommended) is faster and has more features. TypeScript Edition is for legacy projects.

**Q: How much does it cost?**
A: Free and open-source. You only need a GitHub account.

---

## Troubleshooting

### "GITHUB_TOKEN not found"

```bash
# Set token manually
export GITHUB_TOKEN=ghp_your_token_here

# Or use GitHub CLI
gh auth login
```

### "Miyabi not found"

```bash
# Ensure Cargo bin is in PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Or use full path
~/.cargo/bin/miyabi
```

### Agent Execution Fails

```bash
# Check logs
cat logs/$(ls -t logs/ | head -1)

# Re-run with verbose output
miyabi -v agent run coordinator --issue 1
```

**For more help**: See [Troubleshooting Guide](TROUBLESHOOTING.md)

---

## Next Steps

1. **Learn More**: [Full User Guide](MIYABI_CLI_USER_GUIDE.md)
2. **Explore Agents**: [Agent Overview](../.claude/agents/README.md)
3. **Join Community**: [Discord Community](https://discord.gg/Urx8547abS)
4. **Read Architecture**: [System Architecture](../CLAUDE.md)

---

**For detailed documentation, see:**
- [CLI User Guide](MIYABI_CLI_USER_GUIDE.md) - Complete command reference
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues & solutions
- [Agent Manual](../.claude/agents/README.md) - All 21 Agents explained

**But honestly, you don't need them. Just create Issues and let Miyabi work.**

---

🤖 Powered by Claude AI • 🦀 Built with Rust • 🔒 Apache 2.0 License

**[⬆ Back to README](../README.md)**
