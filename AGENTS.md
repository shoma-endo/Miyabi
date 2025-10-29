# Repository Guidelines

## Project Structure & Module Organization
- `crates/` hosts the Rust workspace: `miyabi-types` (model DTOs), `miyabi-core` (planning and execution), `miyabi-agents` (agent orchestrators), and `miyabi-cli` (user entrypoint).
- `services/context-api/` exposes a FastAPI bridge for external context; load credentials via `.env`.
- `workflow-automation/` offers the Streamlit console with agent scripts in `agents/` and shared logic in `core/`.
- Docs live in `docs/`; assets in `assets/`; release bundles in `releases/`.

## Build, Test, and Development Commands
- `cargo fmt && cargo clippy --workspace --all-targets` keeps Rust code formatted and linted.
- `cargo test --workspace` runs Rust suites; scope with `-p miyabi-agents` (or similar) when iterating.
- `cargo run -p miyabi-cli -- status` smoke-tests the CLI binary.
- `pip install -r services/context-api/requirements.txt` then `uvicorn main:app --reload --app-dir services/context-api` starts the context API.
- `pip install -r workflow-automation/requirements.txt` then `streamlit run workflow-automation/app.py` launches the automation UI.

## Coding Style & Naming Conventions
- Let `rustfmt` rule: 4-space indent, 100-column wrap; keep APIs snake_case and types PascalCase.
- Prefer structured errors (`anyhow::Result`, `thiserror`) for actionable diagnostics.
- Python modules follow `black` defaults; files and functions stay snake_case, classes PascalCase.
- CLI subcommands, agent IDs, and config keys stay lowercase with hyphens (e.g., `agent-workflow-runner`).

## Testing Guidelines
- Co-locate Rust tests inside `#[cfg(test)] mod tests` with clear names such as `test_plan_happy_path`; exercise success and failure branches.
- Use schema fixtures in `docs/schemas/` when validating CLI JSON output; refresh snapshots with `cargo test -p miyabi-cli`.
- Automation code uses `pytest`; name files `test_*.py`, mark async cases with `@pytest.mark.asyncio`, and replace network calls with fixtures.
- Run `cargo test --workspace` and `pytest` before every PR; mention skipped suites in the description.

## Commit & Pull Request Guidelines
- Follow Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) with optional scope; reference GitHub issues inline (`(#156)`).
- Keep commits English-first and task-focused; split sweeping refactors from behavioral changes.
- Pull requests need a crisp summary, verification command list, updated docs references, and screenshots or CLI transcripts for UX changes.
- Request review from CODEOWNERS and document new config knobs or secrets alongside the change.

## Security & Configuration Notes
- Treat credentials as secrets: store them in ignored `.env` files and note required variables in the service README.
- Redact marketplace or customer data; sanitized examples live in `examples/` with `_sample` suffixes.
- When adding integrations, extend `SECURITY.md` with threat notes and describe toggles in `discord-config.json` or service configs.
