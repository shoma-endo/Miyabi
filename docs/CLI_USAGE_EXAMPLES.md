# Miyabi CLI - Usage Examples

**Version**: v0.1.1 (Rust Edition)
**Updated**: 2025-10-20

**Real-world examples of using Miyabi - the autonomous development framework.**

---

## Example 1: New Web App

```bash
# Create project (interactive mode)
miyabi init my-web-app --interactive

? プロジェクトタイプは？ 🌐 Web Application
? GitHubリポジトリを作成しますか？ Yes

# Create Issues for features
cd my-web-app

gh issue create --title "Add user registration" \
  --body "Users should be able to register with email/password"

gh issue create --title "Add login page" \
  --body "Login form with email/password. Redirect to dashboard after login."

gh issue create --title "Add user dashboard" \
  --body "Show user profile, settings, and recent activity"

# Process Issues with Miyabi
miyabi work-on 1  # Simple method
# Or: miyabi agent run coordinator --issue 1

# Wait 10-15 minutes per Issue
# PRs appear automatically ✅
```

---

## Example 2: Bug Fixes

```bash
# Method 1: Create Issue manually
gh issue create --title "Fix login redirect loop" \
  --body "After successful login, user gets stuck in redirect loop. Check session handling."

# Method 2: Commit with #auto tag
git commit -m "fix: Login redirect loop investigation #auto"
git push

# Both methods → Issue created → Agent fixes → PR appears
```

---

## Example 3: Documentation

```bash
# Create documentation Issue
gh issue create --title "Document API endpoints" \
  --body "Add Rustdoc comments to all API route handlers in src/api/"

# Let Miyabi handle it
miyabi work-on 3

# → Documentation Issue processed → Agent documents → New PR
```

---

## Example 4: Testing

```bash
# Create test coverage Issue
gh issue create --title "Increase test coverage to 80%" \
  --body "Add unit tests for authentication module. Use cargo test."

# Or let Miyabi work on it
miyabi work-on 4

# → Testing Issue processed → Agent adds tests → PR appears with tests
```

---

## Example 5: Refactoring

```bash
# Create refactoring Issue
gh issue create --title "Refactor auth module to use async/await" \
  --body "Convert synchronous authentication code to async/await pattern"

# Process with Miyabi
miyabi work-on 5

# → CodeGenAgent refactors
# → New PR with async/await implementation
```

---

## Example 6: Adding to Existing Project

```bash
cd existing-project

# Dry run first (no changes)
miyabi install --dry-run

# See what would be installed:
# ✓ 53 labels
# ✓ 10+ workflows
# ✓ Projects V2 integration
# ✓ Auto-label N existing Issues
# ✓ .claude/agents directory

# Install for real
miyabi install

# Now existing project has full automation ✅
```

---

## Example 7: Monitoring with Watch Mode 🆕

```bash
# Check agent status (basic)
miyabi status

# Output:
# 📊 Project Status
#
# Miyabi Installation:
#   ✅ Miyabi is installed
#
# Git Repository:
#   ✅ Git repository detected
#     Branch: main
#     Remote: https://github.com/user/my-web-app.git
#     ✓ Working directory clean
#
# Worktrees:
#   3 active worktree(s)
#     1. .worktrees/issue-1-105ba6ff  [feature/issue-1]
#     2. .worktrees/issue-2-abc123de  [feature/issue-2]
#     3. .worktrees/issue-3-xyz789gh  [feature/issue-3]
#
# GitHub Stats:
#   📋 7 open issue(s)
#   🔀 3 open pull request(s)

# Watch mode (auto-refresh every 3 seconds) 🆕
miyabi status --watch

# Press Ctrl+C to exit
```

---

## Example 8: Parallel Development 🆕

```bash
# Create multiple Issues at once
gh issue create --title "Feature A: User profile"
gh issue create --title "Feature B: Settings page"
gh issue create --title "Feature C: Notification system"

# Process all 3 in parallel with Worktrees
miyabi parallel --issues 1,2,3 --concurrency 3

# All 3 are processed simultaneously
# Independent Git worktrees for isolation
# PRs appear for all 3 within 15-20 minutes ✅
```

---

## Example 9: Priority Handling

```bash
# Critical bug (AI detects priority automatically)
gh issue create --title "URGENT: Production login failing" \
  --body "Critical bug: All users unable to login. 500 error in auth service."

# AI automatically assigns:
# - ✨ type:bug
# - 🔥 priority:P0-Critical
# - 🤖 agent:codegen
# → Highest priority processing

miyabi work-on 9
```

---

## Example 10: Custom Output Styles 🆕

```bash
# Standard output (default)
miyabi status

# YouTube Live-style output
miyabi status --output-style youtube

# Minimal output (for scripts)
miyabi status --output-style minimal

# JSON output (for automation)
miyabi status --json
```

---

## Example 11: Agent-Specific Execution

```bash
# Run specific Agent on an Issue
miyabi agent run coordinator --issue 1   # Task decomposition
miyabi agent run codegen --issue 2       # Code generation
miyabi agent run review --issue 3        # Code review
miyabi agent run pr --issue 4            # PR creation
miyabi agent run deployment --issue 5    # Deploy to staging

# CoordinatorAgent will automatically delegate
# So usually you just need:
miyabi work-on <issue-number>
```

---

## Example 12: Verbose Mode for Debugging

```bash
# Run with verbose output
miyabi -v agent run coordinator --issue 1

# See detailed logs:
# - Agent initialization
# - Task decomposition steps
# - API calls
# - Error details
```

---

## Tips

### For Best Results

1. **Be specific** in Issue descriptions
2. **Break down** large features into smaller Issues
3. **Use natural language** (AI understands context)
4. **Review PRs promptly** (keeps agents moving)
5. **Use parallel execution** for independent tasks

### Common Patterns

**Feature:**
```bash
gh issue create --title "Add [feature name]" \
  --body "Detailed description of what it should do"
```

**Bug:**
```bash
gh issue create --title "Fix [problem]" \
  --body "Steps to reproduce, expected vs actual behavior"
```

**Docs:**
```bash
gh issue create --title "Document [component]" \
  --body "What needs documentation and where"
```

**Test:**
```bash
gh issue create --title "Test [component]" \
  --body "Target coverage percentage and test scenarios"
```

**Refactor:**
```bash
gh issue create --title "Refactor [component]" \
  --body "Specific refactoring goals and patterns to use"
```

---

## Advanced Usage

### Interactive Mode

```bash
# Launch interactive wizard
miyabi init --interactive

# Guided setup with project type selection
# GitHub integration prompts
# Automatic configuration
```

### Dry Run Mode

```bash
# See what would happen without making changes
miyabi install --dry-run
miyabi init my-app --dry-run
```

### Configuration

```bash
# Set custom output style globally
export MIYABI_OUTPUT_STYLE=youtube

# Set log level
export MIYABI_LOG_LEVEL=debug

# Set parallel execution limit
export MIYABI_PARALLEL_AGENTS=5
```

### Rust-Specific Examples

```bash
# Rust-specific Issue examples
gh issue create --title "Add async/await to database layer" \
  --body "Convert blocking database calls to async using tokio"

gh issue create --title "Implement Error trait for custom errors" \
  --body "Add thiserror derive macro to error types"

gh issue create --title "Add #[cfg(test)] module" \
  --body "Create test module with unit tests for new feature"
```

---

## Troubleshooting Examples

### Check Logs

```bash
# View most recent log
cat logs/$(ls -t logs/ | head -1)

# Tail logs in real-time
tail -f logs/$(ls -t logs/ | head -1)
```

### Check Worktrees

```bash
# List all worktrees
git worktree list

# Remove stale worktree
git worktree remove .worktrees/issue-1-xxx

# Prune stale worktrees
git worktree prune
```

### Verify Installation

```bash
# Check Miyabi version
miyabi --version

# Verify all components
miyabi status

# Check environment variables
env | grep MIYABI
env | grep GITHUB_TOKEN
```

---

## Real-World Workflow Example

Complete workflow from project creation to PR merge:

```bash
# 1. Create project
miyabi init my-rust-api --interactive
cd my-rust-api

# 2. Check status
miyabi status

# 3. Create Issues
gh issue create --title "Add user registration endpoint" \
  --body "POST /api/users with email/password validation"

gh issue create --title "Add authentication middleware" \
  --body "JWT-based auth middleware for protected routes"

# 4. Process in parallel
miyabi parallel --issues 1,2 --concurrency 2

# 5. Monitor progress
miyabi status --watch

# 6. Review PRs (after 10-15 minutes)
gh pr list
gh pr view 1
gh pr review 1 --approve

# 7. Merge
gh pr merge 1

# 8. Verify deployment
# CI/CD automatically deploys after merge
```

---

## Performance Tips

1. **Use parallel execution** for independent Issues:
   ```bash
   miyabi parallel --issues 1,2,3,4,5 --concurrency 3
   ```

2. **Use Watch Mode** for real-time monitoring:
   ```bash
   miyabi status --watch
   ```

3. **Use JSON output** for automation:
   ```bash
   miyabi status --json | jq '.github_stats.open_issues'
   ```

4. **Set appropriate concurrency**:
   - Low-spec: `--concurrency 1`
   - Mid-spec: `--concurrency 2-3`
   - High-spec: `--concurrency 4-5`

---

## Additional Resources

- **Full CLI Guide**: [MIYABI_CLI_USER_GUIDE.md](MIYABI_CLI_USER_GUIDE.md)
- **Getting Started**: [GETTING_STARTED.md](GETTING_STARTED.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Agent Manual**: [../.claude/agents/README.md](../.claude/agents/README.md)

---

**Remember:** You don't need to memorize any of this. Just create Issues and run `miyabi work-on <issue>`.

🤖 Powered by Claude AI • 🦀 Built with Rust • 🔒 Apache 2.0 License

**[⬆ Back to README](../README.md)**
