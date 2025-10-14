# Miyabi Plugin Context

## Project Overview

**Miyabi** is a fully autonomous AI development operations platform based on the "GitHub as OS" architecture. It automates the entire development lifecycle from Issue creation to code implementation, PR creation, and deployment.

## Architecture

### Core Components

1. **Agent System** (7 Agents)
   - **CoordinatorAgent**: Task orchestration and parallel execution control
   - **CodeGenAgent**: AI-driven code generation using Claude Sonnet 4
   - **ReviewAgent**: Code quality assessment with 100-point scoring
   - **IssueAgent**: Issue analysis and label management (53-label system)
   - **PRAgent**: Automatic Pull Request creation (Conventional Commits)
   - **DeploymentAgent**: CI/CD deployment automation
   - **TestAgent**: Automated test execution

2. **Label System** (53 Labels, 10 Categories)
   - STATE (8): Lifecycle management
   - AGENT (6): Agent assignment
   - PRIORITY (4): Priority management
   - TYPE (7): Issue classification
   - SEVERITY (4): Severity levels
   - PHASE (5): Project phases
   - SPECIAL (7): Special operations
   - TRIGGER (4): Automation triggers
   - QUALITY (4): Quality scores
   - COMMUNITY (4): Community labels

3. **GitHub OS Integration**
   - Projects V2: Data persistence layer
   - Webhooks: Event bus
   - Actions: Execution engine
   - Discussions: Message queue
   - Pages: Static site hosting
   - Packages: Package distribution

## Key Features

### Autonomous Development
- Issue → PR in 10-15 minutes (fully automated)
- 95%+ success rate for automatic PR creation
- 83.78% test coverage (target: 80%+)
- Quality score threshold: 80+ points for approval

### Parallel Execution
- Git Worktree-based isolation
- 72% efficiency improvement (36h → 26h)
- DAG-based task decomposition
- Conflict-free parallel execution

### Quality Assurance
- ESLint + TypeScript strict mode
- Security scanning (Gitleaks, CodeQL)
- Automated testing (Vitest/Jest/Playwright)
- Quality scoring (100-point scale)

## Workflow

```
Issue Created
    ↓
IssueAgent (Auto-labeling)
    ↓
CoordinatorAgent (DAG decomposition, parallel planning)
    ↓
CodeGenAgent (Code implementation)
    ↓
TestAgent (Test execution, 80%+ coverage)
    ↓
ReviewAgent (Quality check, 80+ points required)
    ↓
PRAgent (Draft PR creation)
    ↓
DeploymentAgent (Auto-deploy after merge)
```

## Technical Stack

- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript (Strict mode, ESM)
- **Package Manager**: npm
- **Testing**: Vitest
- **AI Model**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **GitHub Integration**: @octokit/rest
- **Git Strategy**: Worktree-based parallel execution

## File Structure

```
.
├── packages/
│   ├── cli/                    # CLI package (miyabi)
│   ├── coding-agents/          # Coding agents (7 agents)
│   └── business-agents/        # Business agents (14 agents)
├── .claude/
│   ├── agents/                 # Agent specifications
│   │   ├── specs/              # Agent role definitions
│   │   └── prompts/            # Execution prompts
│   ├── commands/               # Slash commands
│   └── prompts/                # General prompts
├── .github/
│   ├── workflows/              # 26 GitHub Actions workflows
│   └── labels.yml              # 53-label system definition
└── docs/                       # Documentation
    ├── ENTITY_RELATION_MODEL.md        # ⭐⭐⭐
    ├── TEMPLATE_MASTER_INDEX.md        # ⭐⭐⭐
    ├── LABEL_SYSTEM_GUIDE.md           # ⭐⭐⭐
    └── WORKTREE_PROTOCOL.md            # ⭐⭐⭐
```

## Entity-Relation Model

Miyabi uses a structured Entity-Relation model with 12 core entities:

1. **Issue** - GitHub Issue
2. **Task** - Decomposed task
3. **Agent** - Autonomous agent
4. **PR** - Pull Request
5. **Label** - GitHub Label (53 types)
6. **QualityReport** - Quality assessment
7. **Command** - Claude Code command
8. **Escalation** - Escalation record
9. **Deployment** - Deployment information
10. **LDDLog** - LDD (Language-Driven Development) log
11. **DAG** - Task dependency graph
12. **Worktree** - Git worktree

27 relationships connect these entities (see docs/ENTITY_RELATION_MODEL.md).

## Character Name System

All 21 agents have friendly Japanese character names for easy understanding:

- 🔴 **Leaders** (2): しきるん (Coordinator), あきんどさん (AIEntrepreneur)
- 🟢 **Executors** (12): つくるん (CodeGen), めだまん (Review), etc.
- 🔵 **Analysts** (5): みつけるん (Issue), しらべるん (MarketResearch), etc.
- 🟡 **Supporters** (3): まとめるん (PR), はこぶん (Deployment), etc.

## Performance Targets

- **Agent Execution**: < 5 minutes per Issue
- **Parallel Efficiency**: 70%+ (measured via Critical Path)
- **API Response Time**: < 2 seconds (95th percentile)
- **Test Coverage**: 80%+ minimum
- **Quality Score**: 80+ points for approval
- **Success Rate**: 95%+ for automatic PR creation

## Security Considerations

- CodeQL (GitHub Advanced Security)
- ESLint security rules
- Gitleaks integration (secret scanning)
- Dependabot automatic PRs
- SBOM generation (CycloneDX)
- OpenSSF Scorecard

## Best Practices

1. **Always check Issue labels** before executing agents
2. **Update STATE labels** as work progresses
3. **Use PRIORITY labels** to determine execution order
4. **Respect TRIGGER labels** for automation conditions
5. **Report QUALITY scores** after code generation/review
6. **Follow Conventional Commits** for all PRs
7. **Maintain 80%+ test coverage** as minimum quality bar

## Environment Variables

```bash
GITHUB_TOKEN=ghp_xxx        # GitHub access token
ANTHROPIC_API_KEY=sk-ant-xxx # Anthropic API key
REPOSITORY=owner/repo       # GitHub repository
DEVICE_IDENTIFIER=MacBook   # Device identifier
```

## Links

- **Repository**: https://github.com/ShunsukeHayashi/Miyabi
- **NPM CLI**: https://www.npmjs.com/package/miyabi
- **NPM SDK**: https://www.npmjs.com/package/miyabi-agent-sdk
- **Landing Page**: https://shunsukehayashi.github.io/Miyabi/landing.html

---

🌸 **Miyabi** - Beauty in Autonomous Development
