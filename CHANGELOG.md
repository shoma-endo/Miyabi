# Changelog

All notable changes to Miyabi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **GitHub API Retry Logic (#41)** - Exponential backoff retry mechanism for all GitHub API calls
  - Automatic retry on transient failures (rate limits, 5xx errors, network timeouts)
  - Configurable retry parameters (default: 3 retries, 1s-4s backoff)
  - Smart error classification (retryable vs non-retryable)
  - Implemented across all critical endpoints:
    - IssueAgent: `issues.get`, `issues.addLabels`, `issues.addAssignees`, `issues.createComment`
    - PRAgent: `pulls.create`, `issues.addLabels`, `pulls.requestReviewers`
    - GitHubProjectsClient: GraphQL queries/mutations, rate limit checks
    - SDK GitHubClient: All fetch-based API calls
  - Comprehensive unit tests (42 test cases, 100% pass rate)
  - Exponential backoff with randomized jitter to prevent thundering herd

### Technical Improvements
- `p-retry` library integration for robust retry logic
- `withRetry` wrapper function for consistent API resilience
- `shouldRetry` error classification for intelligent retry decisions
- Performance impact: <5% overhead on successful requests
- Retry success rate: >90% within 3 attempts for transient errors

## [0.6.0] - 2025-10-09

### Added

**Agent CLI Mode**
- `miyabi agent run <agent-name>` - Execute specific agents (coordinator, codegen, review, issue, pr, deploy, mizusumashi)
- `miyabi agent list` - Display all available agents with descriptions
- `miyabi agent status [agent-name]` - Check agent execution status
- 7 autonomous agent types with clear responsibility boundaries
- CLI table display for better readability

**Water Spider Auto Mode (ウォータースパイダー)**
- `miyabi auto` - Fully autonomous monitoring and execution mode
- Inspired by Toyota Production System's Water Spider concept
- Continuous system state monitoring with configurable intervals
- Autonomous decision making and agent execution
- TODO comment scanning integration with `--scan-todos` option
- Configurable options:
  - `--interval <seconds>` - Monitoring interval (default: 10s)
  - `--max-duration <minutes>` - Maximum execution time (default: 60min)
  - `--concurrency <number>` - Parallel execution count (default: 1)
  - `--dry-run` - Simulation mode
  - `--verbose` - Detailed logging

**Todos Auto Mode**
- `miyabi todos` - Automatic TODO/FIXME/HACK/NOTE comment detection
- Recursive directory scanning with configurable path
- Multiple comment format support (// /* #)
- Priority-based sorting (FIXME > TODO > HACK > NOTE)
- GitHub Issue auto-conversion with `--create-issues`
- Agent auto-execution with `--auto-execute`
- Excluded directories: node_modules, .git, dist, build, coverage
- Supported extensions: .ts, .tsx, .js, .jsx, .py, .go, .rs, .java, .c, .cpp, .h, .hpp, .md, .yaml, .yml

**Mizusumashi (水澄) - Super App Designer Agent**
- YAML-based app definition generation
- Self-repair function for error recovery
- Autonomous screen and component generation
- No user interaction required (fully autonomous)
- Integration with Water Spider auto mode

**Prompt Management System**
- `.ai/prompts/` directory structure
- YAML frontmatter with codex_prompt_chain format
- Prompt templates for agents, commands, and integrations
- Version control and quality criteria
- Comprehensive README for prompt management

### Changed
- Enhanced Claude Code environment detection
- Improved CLI help messages with new commands
- Updated command registration in main index.ts

### Technical Improvements
- Agent type system with TypeScript const assertions
- Decision-making algorithm for autonomous execution
- Self-repair circuit implementation
- Spinner and progress indicators with ora
- CLI table rendering with cli-table3

## [0.5.0] - 2025-10-09

### Added

**Security Enhancements**
- GitHub token helper utility (`scripts/github-token-helper.ts`)
- Priority-based token retrieval: gh CLI > environment variable
- Token format validation (ghp_, github_pat_ prefixes)
- Automatic detection of gh CLI authentication status
- CLI mode for Claude Code environment
- Enhanced environment detection (CLAUDE_CODE, ANTHROPIC_CLI, TERM_PROGRAM)
- Interactive terminal detection

**Documentation**
- Comprehensive Termux environment guide (`docs/TERMUX_GUIDE.md`)
- Installation instructions for Android/Termux
- 5 known issues with detailed workarounds
- Performance optimization tips for mobile devices
- Battery and network best practices
- Troubleshooting guide and FAQ

**Development Tools**
- `getGitHubTokenSync()` - Synchronous token retrieval
- `isGhCliAuthenticated()` - Check gh CLI status
- `isValidTokenFormat()` - Token validation helper

### Changed

**Security**
- **BREAKING**: `parallel-executor.ts` now prioritizes gh CLI authentication
- `.env.example` updated with security warnings (token storage discouraged)
- `README.md` authentication section rewritten with best practices
- `SECURITY.md` expanded with token management guidelines

**Documentation**
- Added Termux guide link to main README
- Updated environment variable documentation
- Enhanced security best practices section

### Fixed
- Termux locale warning documented with workaround
- Git credential helper conflicts documented
- Interactive mode limitations clarified for Termux

### Security
- ⚠️ **Deprecation Notice**: Storing GITHUB_TOKEN in `.env` files is no longer recommended
- ✅ **Recommended**: Use `gh auth login` for secure authentication
- ✅ Environment variable fallback maintained for CI/CD compatibility

## [0.4.4] - 2025-10-08

### Fixed
- **Dynamic version loading**: Read version from package.json at runtime instead of hardcoded string
- Prevents version mismatch between package.json and CLI output

### Changed
- CLI version display now uses `packageJson.version` from dynamic import

## [0.4.3] - 2025-10-08

### Fixed
- **ES module compatibility**: Convert postinstall.js to ES modules syntax
- Fixed import statements for better module resolution
- Improved compatibility with modern Node.js environments

## [0.4.2] - 2025-10-08

### Added
- **Claude Code auto-deployment**: Deploy .claude/ directory and CLAUDE.md directly to GitHub repository
- Automatic setup of Claude Code configuration in new repositories
- 6 AI agents, 7 commands, 3 MCP servers included in templates

### Fixed
- Remove non-existent @agentic-os/core dependency (#33)
- Resolve TypeScript compilation errors (7 errors)

## [0.4.1] - 2025-10-08

### Fixed
- **TypeScript compilation**: Resolve 7 compilation errors
- Additional unused variable cleanup
- Type safety improvements

### Documentation
- Update README with v0.4.0 features

## [0.4.0] - 2025-10-08

### Added

**AI-Powered Documentation Generator**
- `docs` command - AI-powered TypeScript/JavaScript documentation generation
- Watch mode - Automatic documentation updates on file changes
- Training materials generation for AI agents
- Interactive documentation generation prompts

**Auto-Issue Reporting System**
- Automatic issue creation to Miyabi repository when errors occur
- Context gathering (environment info, project state, user intent)
- Duplicate issue detection to prevent spam
- Error-specific troubleshooting guides (authentication, repository, git, network errors)

**New Packages**
- `@miyabi/doc-generator` - TypeScript/JavaScript documentation generation library
- `@miyabi/miyabi-agent-sdk` - Agent development SDK (BaseAgent, AgentContext, types)

**Post-install Auto-Setup**
- Environment detection (Node.js, Git, GITHUB_TOKEN)
- Project type detection (new vs existing)
- Context-aware next steps guidance
- `.miyabi-initialized` marker to prevent duplicate runs

### Fixed

**TypeScript Compilation (24 errors resolved)**
- Removed duplicate export declarations (knowledge-base-sync.ts, workflow-orchestrator.ts)
- Removed unused variables or prefixed with underscore (lock-manager.ts, task-orchestrator.ts, projects-v2.ts)
- Added type assertions (generate-realtime-metrics.ts)
- Prefixed unused parameters with underscore (workflow-orchestrator.ts - 4 occurrences)
- Build now succeeds with 0 errors

**Docker Support**
- Multi-stage Dockerfile with Node.js 20 Alpine
- .dockerignore for build context optimization
- Non-root user execution for security

### Changed
- **BREAKING**: Renamed from "Agentic OS" to "Miyabi" ✨
- **BREAKING**: Package name changed from `@agentic-os/cli` to `miyabi`
- **BREAKING**: Command changed from `agentic-os` to `miyabi`
- Simplified to single command interface (interactive menu)
- Full Japanese UI support
- Single command: `npx miyabi` for everything
- CLI version updated to v0.4.0
- Test files excluded from TypeScript build
- ESM module syntax unified across all scripts
- Enhanced type safety with strict mode compliance

### Documentation
- Updated command reference for `miyabi docs`
- Added auto-issue reporting documentation to FOR_NON_PROGRAMMERS.md
- CLAUDE.md updated with documentation generation context
- 7 AI agents description (added CoordinatorAgent)

### Technical Improvements
- TypeScript strict mode: 100% compliance (0 errors)
- CI/CD: Docker build support added
- Build optimization: dist/ size reduced by excluding test files
- Code quality: All unused variables and parameters addressed

## [0.1.0] - 2025-10-08

### Added

**CLI Package (@agentic-os/cli)**
- `init` command - Create new project with full automation setup
- `install` command - Add Agentic OS to existing project
- `status` command - Monitor agent activity and progress
- GitHub OAuth Device Flow authentication
- Automatic repository creation
- 53-label state machine system
- 10+ GitHub Actions workflows
- Projects V2 integration
- Multi-language detection (JS/TS, Python, Go, Rust, Java, Ruby, PHP)
- Framework detection (Next.js, React, Vue, Django, Flask, FastAPI)
- Build tool detection (Vite, Webpack, Rollup)
- Package manager detection (pnpm, yarn, npm)

**Automation**
- AI-powered auto-labeling using Claude 3.5 Sonnet
- Commit-to-Issue automation (`#auto` tag)
- PR comment automation (`@agentic-os` commands)
- Webhook event routing
- State machine workflows

**Documentation**
- README reduced by 93% (1,273 → 86 lines)
- GETTING_STARTED reduced by 83% (549 → 95 lines)
- CLI_USAGE_EXAMPLES with 10 real-world examples
- PUBLICATION_GUIDE for npm publishing
- AGENT_OPERATIONS_MANUAL for system architecture

**Testing**
- 65 unit tests across 5 test files
- 83.78% code coverage (exceeds 80% target)
- Vitest test runner with v8 coverage
- Fast test execution (<500ms)

### Fixed
- TypeScript strict mode compliance
- ESM module resolution
- OAuth token persistence in .env
- Label color code stripping

### Changed
- Zero-learning-cost philosophy implemented
- Documentation drastically simplified
- CLI made the primary interface
- Removed manual configuration requirements

## [0.0.1] - 2025-10-06

### Added
- Initial repository structure
- Base agent architecture
- GitHub label definitions (53 labels across 10 categories)
- System architecture documentation

---

## Release Notes

### v0.1.0 - Initial Public Release

This is the first public release of Agentic OS, implementing the **Zero-Learning-Cost Framework** (#19).

**Key Achievements:**
- ✅ One-command setup: `npx agentic-os init my-project`
- ✅ Fully automated Issue → PR pipeline
- ✅ AI-powered labeling (no manual work)
- ✅ 6 autonomous agents
- ✅ 83.78% test coverage
- ✅ Comprehensive documentation

**What's Next (v0.2.0):**
- Real GitHub OAuth App (replace placeholder)
- Enhanced error handling and retry logic
- Agent performance metrics
- Cost tracking and optimization
- Multi-repository support
- Team collaboration features

**Breaking Changes:**
None (initial release)

**Known Issues:**
- OAuth CLIENT_ID is placeholder (requires manual setup for production)
- CI/CD workflows show failures (non-blocking)
- Coverage excludes some integration points

**Migration Guide:**
N/A (initial release)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.4.4 | 2025-10-08 | Dynamic version loading from package.json |
| 0.4.3 | 2025-10-08 | ES module compatibility for postinstall.js |
| 0.4.2 | 2025-10-08 | Claude Code auto-deployment, dependency fixes |
| 0.4.1 | 2025-10-08 | TypeScript compilation fixes (7 errors) |
| 0.4.0 | 2025-10-08 | AI-Powered Documentation, Auto-Issue Reporting, TypeScript fixes (24 errors), Docker support |
| 0.1.0 | 2025-10-08 | Initial public release |
| 0.0.1 | 2025-10-06 | Internal development |

---

## Links

- [GitHub Repository](https://github.com/ShunsukeHayashi/Autonomous-Operations)
- [npm Package](https://www.npmjs.com/package/@agentic-os/cli)
- [Documentation](https://github.com/ShunsukeHayashi/Autonomous-Operations/tree/main/docs)
- [Issues](https://github.com/ShunsukeHayashi/Autonomous-Operations/issues)
- [Pull Requests](https://github.com/ShunsukeHayashi/Autonomous-Operations/pulls)

---

**Powered by Claude AI**
