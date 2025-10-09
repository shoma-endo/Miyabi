# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities via:
- GitHub Security Advisories: https://github.com/ShunsukeHayashi/Miyabi/security/advisories
- Email: security@miyabi-ai.dev

**Response Time**: Within 48 hours

## Security Best Practices

### GitHub Token Management

**✅ Recommended: Use gh CLI**
```bash
gh auth login
```
The application automatically uses `gh auth token` for secure authentication.

**⚠️ Not Recommended: Storing token in .env**
```bash
# Avoid storing tokens in .env files
GITHUB_TOKEN=ghp_xxxxx  # ❌ Not secure
```

**Acceptable for CI/CD only:**
- GitHub Actions secrets
- Environment variables in secure CI/CD systems

### Token Scopes

Minimum required scopes for GitHub Personal Access Token:
- `repo` - Full control of private repositories
- `workflow` - Update GitHub Action workflows
- `read:project`, `write:project` - Access projects

### .gitignore Protection

Ensure the following files are in `.gitignore`:
- `.env`
- `.env.local`
- `.env.*.local`
- `.miyabi.yml`
- `.claude/.env*`

### Secret Scanning

This repository uses:
- ✅ GitHub secret scanning
- ✅ Gitleaks integration (optional)
- ✅ Dependabot security updates

Run security audit:
```bash
npm run security:audit
npm run security:scan
```
