# Miyabi - AI Agent Usage Guide

**Target User: Claude Code and other AI coding agents**
**Human users should refer to README.md instead**

## Overview

Miyabi is designed as an **AI-friendly CLI tool** for autonomous development operations. All commands support machine-readable JSON output and non-interactive execution.

## Core Principles for AI Agents

1. **Always use `--json` flag** - Parse structured output, never scrape human-readable text
2. **Always use `--yes` flag** - Skip all interactive prompts
3. **Check exit codes** - 0=success, non-zero=failure (see Exit Codes section)
4. **Parse error objects** - Extract `error.code`, `error.message`, `error.suggestion`
5. **Never assume success** - Always verify `success: true` in JSON response

## Environment Variables

Set these before executing miyabi commands:

```bash
export GITHUB_TOKEN=ghp_xxx          # Required for GitHub API access
export MIYABI_JSON=1                 # Force JSON output (alternative to --json)
export MIYABI_AUTO_YES=1             # Force non-interactive mode (alternative to --yes)
export MIYABI_VERBOSE=1              # Enable verbose logging (optional)
```

## Exit Codes

```
0  SUCCESS               - Command completed successfully
1  GENERAL_ERROR         - Unknown or unexpected error
2  CONFIG_ERROR          - Missing GITHUB_TOKEN, invalid config
3  VALIDATION_ERROR      - Invalid arguments, directory exists, etc.
4  NETWORK_ERROR         - GitHub API unreachable, timeout
5  AUTH_ERROR            - Authentication failed, invalid token
```

## Command Reference for AI Agents

### 1. Check Status

**Use case:** Monitor project state before taking action

```bash
miyabi status --json
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "repository": {
      "owner": "username",
      "name": "repo-name",
      "url": "https://github.com/username/repo-name"
    },
    "issues": {
      "total": 15,
      "byState": {
        "pending": 3,
        "analyzing": 2,
        "implementing": 4,
        "reviewing": 1,
        "blocked": 0,
        "paused": 0
      }
    },
    "pullRequests": [
      {
        "number": 123,
        "title": "feat: Add new feature",
        "url": "https://github.com/username/repo-name/pull/123",
        "createdAt": "2025-10-11T00:00:00Z"
      }
    ],
    "summary": {
      "totalOpen": 15,
      "activeAgents": 7,
      "blocked": 0
    }
  },
  "message": "Status retrieved successfully",
  "timestamp": "2025-10-11T00:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_GITHUB_TOKEN",
    "message": "GITHUB_TOKEN not found in environment",
    "recoverable": true,
    "suggestion": "Set GITHUB_TOKEN environment variable: export GITHUB_TOKEN=ghp_xxx"
  },
  "timestamp": "2025-10-11T00:00:00Z"
}
```

**AI Agent Decision Tree:**
- If `success: false` and `error.code: "MISSING_GITHUB_TOKEN"` → Set GITHUB_TOKEN, retry
- If `success: false` and `error.code: "NO_GIT_REPOSITORY"` → Not a git repo, abort or init new project
- If `success: true` and `data.issues.byState.pending > 0` → Run IssueAgent to analyze pending issues
- If `success: true` and `data.issues.byState.implementing > 0` → Run ReviewAgent to check implementation status

### 2. Create New Project

**Use case:** Initialize a new autonomous development project

```bash
miyabi init my-project --json --yes --private
```

**Exit codes to check:**
- Exit 0 → Success, project created
- Exit 3 (VALIDATION_ERROR) → Project name invalid or directory exists
- Exit 2 (CONFIG_ERROR) → GITHUB_TOKEN missing
- Exit 5 (AUTH_ERROR) → GitHub authentication failed

**Current limitation:** Full JSON output not yet implemented (Phase 2)

**AI Agent should:**
1. Execute command
2. Check exit code (0 = success)
3. If exit code != 0, read stderr for error message
4. Verify project directory exists: `ls -la ./my-project`

### 3. Install into Existing Project

**Use case:** Add Miyabi to an existing repository

```bash
cd /path/to/existing/project
miyabi install --json --yes --non-interactive
```

**Exit codes to check:**
- Exit 0 → Success, Miyabi installed
- Exit 3 (VALIDATION_ERROR) → Not a git repository or missing remote
- Exit 2 (CONFIG_ERROR) → GITHUB_TOKEN missing
- Exit 4 (NETWORK_ERROR) → GitHub API unreachable

**Current limitation:** Full JSON output not yet implemented (Phase 2)

**AI Agent should:**
1. Verify git repository: `git rev-parse --is-inside-work-tree`
2. Execute `miyabi install --json --yes --non-interactive`
3. Check exit code
4. Verify `.claude/` directory created: `ls -la .claude`

### 4. Run Specific Agent

**Use case:** Execute a specific agent on an Issue

```bash
miyabi agent run codegen --issue=123 --json --dry-run
```

**Available agents:**
- `coordinator` - Task decomposition and DAG planning
- `codegen` - AI-driven code generation (Claude Sonnet 4)
- `review` - Code quality review (80+ score required)
- `issue` - Issue analysis and labeling
- `pr` - Pull Request creation
- `deploy` - CI/CD deployment
- `mizusumashi` - Water Spider (full autonomous mode)

**Current limitation:** Full JSON output not yet implemented (Phase 2)

**AI Agent should:**
1. Check exit code (0 = success)
2. Remove `--dry-run` for actual execution
3. Monitor agent execution via `miyabi status --json`

### 5. Auto Mode (Water Spider)

**Use case:** Full autonomous operation

```bash
miyabi auto --interval=10 --max-duration=60 --json --dry-run
```

**Options:**
- `--interval=<seconds>` - Monitoring interval (default: 10)
- `--max-duration=<minutes>` - Max runtime (default: 60)
- `--scan-todos` - Enable TODO comment detection
- `--dry-run` - Simulation mode

**Current limitation:** Full JSON output not yet implemented (Phase 2)

**AI Agent should:**
1. Start with `--dry-run` to verify configuration
2. Check exit code
3. Remove `--dry-run` for actual autonomous operation
4. Monitor via `miyabi status --json` in parallel

### 6. TODO Detection

**Use case:** Scan codebase for TODO comments and create Issues

```bash
miyabi todos --path=./src --create-issues --json --dry-run
```

**Current limitation:** Full JSON output not yet implemented (Phase 2)

## Error Handling Strategy for AI Agents

### Pattern 1: Recoverable Errors (error.recoverable: true)

```typescript
// Pseudo-code for AI agent
const result = await exec('miyabi status --json');
const parsed = JSON.parse(result.stdout);

if (!parsed.success && parsed.error.recoverable) {
  console.log(`Recoverable error: ${parsed.error.code}`);
  console.log(`Suggestion: ${parsed.error.suggestion}`);

  // Apply suggestion and retry
  if (parsed.error.code === 'MISSING_GITHUB_TOKEN') {
    await setGitHubToken();
    return retry();
  }
}
```

### Pattern 2: Non-recoverable Errors (error.recoverable: false)

```typescript
if (!parsed.success && !parsed.error.recoverable) {
  console.error(`Fatal error: ${parsed.error.message}`);
  throw new Error(parsed.error.message);
}
```

### Pattern 3: Exit Code Checking

```bash
# Always check exit codes in bash
miyabi status --json
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "Success"
elif [ $EXIT_CODE -eq 2 ]; then
  echo "Config error - check GITHUB_TOKEN"
elif [ $EXIT_CODE -eq 5 ]; then
  echo "Auth error - token invalid"
else
  echo "Unknown error - exit code $EXIT_CODE"
fi
```

## Recommended Workflows for AI Agents

### Workflow 1: Autonomous Issue Processing

```bash
# 1. Check status
miyabi status --json > status.json
EXIT_CODE=$?
[ $EXIT_CODE -ne 0 ] && exit $EXIT_CODE

# 2. Parse pending issues count
PENDING=$(jq -r '.data.issues.byState.pending' status.json)

# 3. If pending issues exist, run IssueAgent
if [ "$PENDING" -gt 0 ]; then
  miyabi agent run issue --json --yes
fi

# 4. Check implementing issues
IMPLEMENTING=$(jq -r '.data.issues.byState.implementing' status.json)

# 5. If implementing, run ReviewAgent
if [ "$IMPLEMENTING" -gt 0 ]; then
  miyabi agent run review --json --yes
fi
```

### Workflow 2: New Project Setup

```bash
# 1. Initialize project
miyabi init my-ai-project --json --yes --private
EXIT_CODE=$?

# 2. Check if successful
if [ $EXIT_CODE -eq 0 ]; then
  cd my-ai-project

  # 3. Verify installation
  miyabi status --json > status.json

  # 4. Start autonomous mode
  miyabi auto --interval=10 --max-duration=120 --json
fi
```

### Workflow 3: Existing Project Integration

```bash
# 1. Verify git repository
git rev-parse --is-inside-work-tree || exit 3

# 2. Install Miyabi
miyabi install --json --yes --non-interactive
EXIT_CODE=$?

# 3. If successful, verify
if [ $EXIT_CODE -eq 0 ]; then
  # Check .claude/ directory exists
  [ -d .claude ] || exit 1

  # Verify status works
  miyabi status --json > /dev/null
  [ $? -eq 0 ] && echo "Installation verified"
fi
```

## JSON Output Schema

### Success Response Schema

```typescript
interface AgentSuccessOutput<T> {
  success: true;
  data: T;                    // Command-specific data structure
  message?: string;           // Optional human-readable message
  timestamp: string;          // ISO 8601 format
}
```

### Error Response Schema

```typescript
interface AgentErrorOutput {
  success: false;
  error: {
    code: string;             // Error code (e.g., "MISSING_GITHUB_TOKEN")
    message: string;          // Error description
    recoverable: boolean;     // Can this error be recovered from?
    suggestion?: string;      // Suggested fix (if available)
    details?: any;            // Additional error context
  };
  timestamp: string;          // ISO 8601 format
}
```

## Performance Considerations

1. **Parallel Execution:** AI agents can run multiple `miyabi status --json` commands in parallel to monitor different projects
2. **Caching:** Status results can be cached for 5-10 seconds to avoid rate limiting
3. **Rate Limiting:** GitHub API has rate limits - check `X-RateLimit-Remaining` header
4. **Timeout:** Set command timeout to 120 seconds for safety

## Security Best Practices

1. **Never log GITHUB_TOKEN** - It's sensitive
2. **Use environment variables** - Don't pass tokens as CLI arguments
3. **Verify SSL/TLS** - GitHub API uses HTTPS
4. **Rotate tokens regularly** - Use fine-grained tokens with minimal scopes

## Debugging for AI Agents

Enable verbose mode to see detailed execution logs:

```bash
export MIYABI_VERBOSE=1
miyabi status --json
```

Enable debug mode for even more detail:

```bash
export MIYABI_DEBUG=1
miyabi status --json
```

## Version Compatibility

- **Current version:** 0.8.4
- **Status command:** Full JSON support ✅
- **Other commands:** JSON flag supported, full implementation in Phase 2 ⚠️

Check version:
```bash
miyabi --version
```

## Support & Issues

For AI agents encountering errors:

1. Check exit code first
2. Parse JSON error response
3. Apply suggested fix from `error.suggestion`
4. If persistent, report issue to: https://github.com/ShunsukeHayashi/Miyabi/issues

---

**Last Updated:** 2025-10-11
**For Human Users:** See [README.md](./README.md)
**For Developers:** See [CONTRIBUTING.md](./CONTRIBUTING.md)
