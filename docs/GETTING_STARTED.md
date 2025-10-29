# Getting Started with Miyabi (Rust Edition)

**Updated:** 2025-10-29  
**Setup Time:** ~10 minutes  
**Applies to:** `miyabi-cli` v0.1.0

---

## 1. Prerequisites

Install the following tools before you begin:

| Tool | Version | macOS/Linux | Windows |
|------|---------|-------------|---------|
| Rust toolchain | 1.75+ | `curl https://sh.rustup.rs -sSf \| sh` | Download from [rustup.rs](https://rustup.rs) |
| Cargo (bundled with Rust) | Latest | Included with rustup | Included with rustup |
| Git | 2.40+ | `brew install git` / `apt install git` | `winget install Git.Git` |

> 💡 Run `rustup update stable` to ensure your toolchain is up to date.

Optional:

- GitHub CLI (`gh`) for device-free authentication
- `cargo-binstall` for faster binary installation (`cargo install cargo-binstall`)

---

## 2. Install the CLI

```bash
# Install from crates.io
cargo install miyabi-cli --bin miyabi

# Confirm installation
miyabi --help
```

If you work with multiple versions, add `~/.cargo/bin` to your `PATH`.

---

## 3. Initialize a Project

### 3.1 Create a fresh repository

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO
```

### 3.2 Run the initializer

```bash
miyabi init \
  --name "My Autonomous Platform" \
  --repository "YOUR_ORG/YOUR_REPO" \
  --device "$(hostname)"
```

This command:

1. Creates `.miyabi/config.toml`
2. Generates log (`.miyabi/logs/actions.log`) and report directories
3. Stores metadata (project name, repository, device identifier)

You can edit `.miyabi/config.toml` manually at any time.

---

## 4. Verify the Environment

```bash
miyabi status
```

You should see output similar to:

```
📊 Miyabi ステータス
プロジェクト名: My Autonomous Platform
リポジトリ: YOUR_ORG/YOUR_REPO
作成日: 2025-10-29T05:01:23Z
デバイス: MacBook-Pro

ディレクトリ構成
 - /path/to/project/.miyabi
 - /path/to/project/.miyabi/logs
 - /path/to/project/.miyabi/reports
```

If `.miyabi/config.toml` is missing, the CLI recreates it with safe defaults.

---

## 5. Simulate an Issue Workflow

### 5.1 Run `work-on`

```bash
miyabi work-on --issue 123 \
  --title "Implement onboarding banner" \
  --description "Add a welcome banner displayed after login."
```

What happens:

1. The CLI emits a spinner while the CoordinatorAgent “plans” the work.
2. A deterministic plan is produced with high-level tasks (analysis, code-gen, test, review).
3. Results are logged to `.miyabi/logs/actions.log`.

Example output:

```
🤖 エージェント実行を開始します
対象: Implement onboarding banner
Issue: #123

✅ 実行結果
 - [Issue] Analyze issue context
   Task queued for specialist agents (simulated)
 - [CodeGen] Implement solution
   Task queued for specialist agents (simulated)
 ...
```

### 5.2 Inspect logs

```bash
cat .miyabi/logs/actions.log
```

Each entry is JSON-lines encoded for easy ingestion into dashboards.

---

## 6. Run a Specific Agent

Only the CoordinatorAgent is bundled by default in `miyabi-agents`. Execute it directly:

```bash
miyabi agent run coordinator \
  --title "Check repository health" \
  --description "Produce a synthetic report for repository readiness."
```

The command uses the same orchestration pipeline but labels the session explicitly for coordinator-only runs.

---

## 7. Project Structure

After initialization, the repository will contain:

```
.miyabi/
├── config.toml          # Project metadata
├── logs/
│   └── actions.log      # JSON-line execution log
└── reports/             # Reserved for future artifacts
Cargo.toml               # Workspace definition
crates/
├── miyabi-cli/          # CLI binary crate
├── miyabi-agents/       # Coordinator + execution registry
├── miyabi-core/         # Config, filesystem helpers, logging utilities
└── miyabi-types/        # Shared models (tasks, outcomes, metadata)
```

---

## 8. Next Steps

- **Extend agents:** Add new implementations in `crates/miyabi-agents` and register them in `AgentRegistry`.
- **Integrate GitHub:** Store a fine-grained personal access token in `.miyabi/config.toml` under `github_token`.
- **Automate reports:** Write generators that drop artifacts into `.miyabi/reports` for dashboards.
- **CI integration:** Add a GitHub Actions workflow that runs `cargo fmt --check`, `cargo clippy`, and `cargo test`.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `command not found: miyabi` | `$HOME/.cargo/bin` not on PATH | Add `export PATH="$HOME/.cargo/bin:$PATH"` to your shell profile |
| `failed to read .miyabi/config.toml` | File removed or unreadable | Re-run `miyabi init` or create the file manually |
| `Coordinator agent not registered` | Binary out of date | Reinstall with `cargo install miyabi-cli --force` |

Need more help? Reach out on Discord or open a GitHub Discussion.

---

Happy autonomous building! 🦀
