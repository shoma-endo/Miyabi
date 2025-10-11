# Claude Code Instructions for Miyabi

**IMPORTANT: This file provides output style guidelines for Claude Code when using Miyabi CLI.**

## Core Principles

When executing Miyabi commands, Claude Code must:

1. **Always use `--json` flag** for machine-readable output
2. **Always use `--yes` flag** to skip interactive prompts
3. **Always check exit codes** before parsing output
4. **Parse JSON responses** to extract error codes and suggestions
5. **Communicate results concisely** to the human user

## Output Style Guidelines

### When Reporting Miyabi Command Execution

**DO:**
```markdown
Checking project status...

Command: `miyabi status --json`
Exit Code: 0 (Success)

Status Summary:
- Total Open Issues: 15
- Pending Issues: 3 (requires IssueAgent)
- Implementing: 4 (in progress)
- Active Agents: 7

Next Action: Running IssueAgent for 3 pending issues.
```

**DON'T:**
```markdown
🎉 Yay! I'm checking the status now! 🚀✨

Running: miyabi status

OMG there are so many issues! Let me explain everything in great detail about what each state means and the history of the Miyabi label system...
```

### When Reporting Errors

**DO:**
```markdown
Error executing miyabi command.

Command: `miyabi status --json`
Exit Code: 2 (CONFIG_ERROR)

Error: MISSING_GITHUB_TOKEN
Message: GITHUB_TOKEN not found in environment

Solution: Set GITHUB_TOKEN environment variable
```

**DON'T:**
```markdown
😱 Oh no! Something went wrong! 💥

The command failed and I'm not sure why but maybe it's because of a token issue? Let me try again in different ways...
```

### When Parsing JSON Output

**Always parse JSON first, then summarize:**

```typescript
// Good practice
const result = JSON.parse(stdout);
if (result.success) {
  console.log(`Status: ${result.data.summary.totalOpen} open issues`);
} else {
  console.log(`Error: ${result.error.code}`);
  console.log(`Suggestion: ${result.error.suggestion}`);
}
```

### Communication Style Rules

1. **Be Concise**: Summarize results in 2-3 sentences
2. **No Emojis**: Miyabi output may contain emojis, but Claude Code's explanations should not
3. **Technical Focus**: Report exit codes, error codes, and data
4. **Action-Oriented**: State what was done and what's next
5. **Error-First**: If command failed, report error immediately

## Command Execution Pattern

### Standard Workflow

```bash
# 1. Set environment (if needed)
export GITHUB_TOKEN=ghp_xxx

# 2. Execute with --json and --yes
miyabi status --json > output.json
EXIT_CODE=$?

# 3. Check exit code first
if [ $EXIT_CODE -eq 0 ]; then
  # Success - parse JSON
  jq . output.json
else
  # Error - report error code and suggestion
  jq -r '.error | "Error: \(.code)\nMessage: \(.message)\nSuggestion: \(.suggestion)"' output.json
fi
```

### For AI Agent Commands

```bash
# Always use --json for agent commands
miyabi agent run codegen --issue=123 --json

# Always use --json for agent list
miyabi agent list --json

# Parse JSON output immediately
```

## Error Handling Guidelines

### Exit Code Meanings

```
0 = SUCCESS               ✓ Command succeeded
1 = GENERAL_ERROR         ✗ Unknown error
2 = CONFIG_ERROR          ✗ Missing GITHUB_TOKEN or config issue
3 = VALIDATION_ERROR      ✗ Invalid arguments or preconditions
4 = NETWORK_ERROR         ✗ GitHub API unreachable
5 = AUTH_ERROR            ✗ Authentication failed
```

### Error Response Template

When miyabi command fails, report to user:

```
Command failed: miyabi [command]
Exit Code: [code] ([meaning])
Error: [error.code]
Message: [error.message]
[Only if recoverable] Suggestion: [error.suggestion]
```

## Examples of Good Output

### Example 1: Status Check

```
Executed: miyabi status --json
Exit: 0

Project: username/repo-name
Open Issues: 15 (3 pending, 4 implementing, 1 reviewing)
Active Agents: 7

Next: Analyzing 3 pending issues with IssueAgent.
```

### Example 2: Agent Execution

```
Executed: miyabi agent run codegen --issue=123 --json
Exit: 0

Agent: CodeGenAgent
Status: Success
Duration: 1000ms

Result: Code generated and tests created for issue #123.
```

### Example 3: Error Reporting

```
Executed: miyabi status --json
Exit: 2

Error: MISSING_GITHUB_TOKEN
GITHUB_TOKEN not found in environment

Action Required: Set GITHUB_TOKEN environment variable
Command: export GITHUB_TOKEN=ghp_xxx
```

## Examples of Bad Output

### Bad Example 1: Too Verbose

```
🎉 Hey there! I'm going to check the status of your amazing project! This is going to be so exciting! 🚀

First, let me tell you about what Miyabi is. Miyabi is a beautiful autonomous development framework that uses AI agents to automate your development workflow. It has 7 different agents including CoordinatorAgent, IssueAgent, CodeGenAgent, and more! Each agent has specific responsibilities...

[300 more lines of explanation]

Oh by the way, here's the status: you have some issues.
```

### Bad Example 2: No Error Details

```
Command failed. ❌

Something went wrong when running miyabi status. Maybe try again?
```

### Bad Example 3: Emoji Overload

```
🤖✨ Running Miyabi! 🚀

Status: 📊
Issues: 📝 15 total! 😮
Pending: 📥 3 issues waiting! ⏳
Implementing: 🏗️ 4 in progress! ⚡
Reviewing: 👀 1 needs review! 🔍

Next: 🤖 Running IssueAgent! 🎯✨
```

## Integration with Miyabi Documentation

Refer to these files for technical details:
- `/packages/cli/AI_AGENT_USAGE.md` - Complete AI agent usage guide
- `/packages/cli/CLAUDE.md` - Quick start for Claude Code
- `/packages/cli/src/utils/agent-output.ts` - JSON output schema

## Summary

**Claude Code should be:**
- Technical and precise
- Concise and action-oriented
- JSON-first in execution
- Exit-code aware
- Error-informative

**Claude Code should NOT be:**
- Overly friendly or emoji-heavy
- Verbose or explanatory by default
- Assuming success without checking exit codes
- Ignoring error.suggestion in JSON responses

---

*This instruction file is automatically loaded by Claude Code when executing miyabi commands.*
