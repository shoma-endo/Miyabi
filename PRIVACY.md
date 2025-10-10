# Privacy Policy

**Last Updated**: October 10, 2025

## Overview

**Miyabi** is a local CLI tool that prioritizes user privacy. This document explains what data we collect, how we use it, and your rights.

## Our Commitment

- ❌ **NO telemetry** - We don't track usage
- ❌ **NO analytics** - No data collection for statistics
- ❌ **NO user tracking** - We don't monitor your activity
- ✅ **Local-first** - All data stays on your device

## Data Collection

### What We Collect

Miyabi operates entirely on your local machine and collects **zero** data. However, you provide:

1. **API Credentials** (stored locally only)
   - GitHub Personal Access Token (`GITHUB_TOKEN`)
   - Anthropic API Key (`ANTHROPIC_API_KEY`)
   - Device Identifier (`DEVICE_IDENTIFIER`)

2. **Project Configuration** (stored locally only)
   - `.miyabi.yml` - Project settings
   - `.env` - Environment variables

### What We DO NOT Collect

- ❌ Personal information (name, email, etc.)
- ❌ Usage statistics or analytics
- ❌ Error reports (unless you manually share them)
- ❌ Code you write or generate
- ❌ IP addresses or device fingerprints

## Third-Party Services

When you use Miyabi, your credentials are used to communicate with third-party services **on your behalf**:

### GitHub API

- **Data Sent**: Repository data, Issues, Pull Requests, Projects
- **Your Control**: Via your GitHub Personal Access Token
- **Privacy Policy**: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- **How to Revoke**: Delete your token at https://github.com/settings/tokens

### Anthropic Claude API

- **Data Sent**: Code snippets, prompts (only if you provide an API key)
- **Your Control**: Via your Anthropic API Key
- **Privacy Policy**: https://www.anthropic.com/legal/privacy
- **How to Revoke**: Delete your API key from `.env`

**Important**: Miyabi does not have access to these services without your explicit credentials. You maintain full control.

## Data Storage

### Local Storage Only

All data is stored **only on your device**:

- `.env` - API keys and environment variables
- `.miyabi.yml` - Project configuration
- `.ai/logs/` - Local execution logs (if enabled)

**No data is sent to Miyabi servers** because we don't operate any servers.

### No Cloud Storage

Miyabi does **not**:
- Upload your code to our servers
- Store your credentials remotely
- Maintain a database of users

## User Responsibilities

### Protecting Your Data

You are responsible for:

- ✅ **Securing API keys** - Keep your `.env` file safe
- ✅ **Adding `.env` to `.gitignore`** - Prevent accidental commits
- ✅ **Rotating credentials** - Regularly update your tokens
- ✅ **Complying with third-party terms** - Follow GitHub and Anthropic policies

### Recommended Security Practices

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".miyabi.yml" >> .gitignore

# Use environment variables instead of config files
export GITHUB_TOKEN=ghp_xxxxx
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## Data Retention

- **Retention Period**: Indefinite (on your local device)
- **Deletion**: Delete `.env` and `.miyabi.yml` files anytime
- **No Server-Side Retention**: We don't store any data

## Your Rights

Under GDPR (EU) and CCPA (California), you have the following rights:

### Right to Access

- ✅ All data is on your device
- ✅ View files: `.env`, `.miyabi.yml`, `.ai/logs/`

### Right to Deletion

- ✅ Delete `.env` file
- ✅ Delete `.miyabi.yml` file
- ✅ Uninstall: `npm uninstall -g miyabi`

### Right to Portability

- ✅ All data is in plain text files
- ✅ Copy or transfer freely

### Right to Object

- ✅ Don't use the tool if you disagree with third-party policies

## Children's Privacy

Miyabi is not intended for users under 13 years old. We do not knowingly collect data from children.

## International Users

### GDPR Compliance (EU)

- **Data Controller**: Shunsuke Hayashi
- **Legal Basis**: User consent (via API key provision)
- **Data Processing**: Local only
- **Contact**: Via GitHub profile

### CCPA Compliance (California)

- **Personal Information Collected**: API credentials (user-provided)
- **Purpose**: CLI tool operation
- **Third Parties**: GitHub, Anthropic (user-controlled)
- **Sale of Data**: We do **NOT** sell your data

## Security

### How We Protect Your Data

Since all data is local:

- ✅ **File Permissions**: Respect OS-level permissions
- ✅ **No Transmission**: API keys never sent to Miyabi servers
- ✅ **Encrypted Communication**: HTTPS for GitHub/Anthropic APIs
- ✅ **No Logging**: No server-side logs

### Your Responsibility

- 🔐 Use strong, unique API keys
- 🔐 Enable two-factor authentication (2FA) on GitHub
- 🔐 Regularly review authorized apps: https://github.com/settings/applications

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be:

- ✅ Posted on this page
- ✅ Announced via GitHub releases
- ✅ Effective immediately upon posting

**Version History**:
- v1.0 - 2025-10-10: Initial privacy policy

## Open Source

Miyabi is open source (Apache 2.0 License):

- 📖 Source Code: https://github.com/ShunsukeHayashi/Miyabi
- 📖 Audit the code to verify privacy claims
- 📖 Report security issues: [SECURITY.md](SECURITY.md)

## Contact

For privacy-related questions:

- **GitHub Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues
- **X (Twitter)**: [@The_AGI_WAY](https://x.com/The_AGI_WAY)
- **Website**: https://note.ambitiousai.co.jp/

For security vulnerabilities: See [SECURITY.md](SECURITY.md)

---

## Summary

**TL;DR**:
- ✅ Miyabi runs locally on your device
- ✅ We collect **zero** data
- ✅ You control all API keys
- ✅ No telemetry, analytics, or tracking
- ✅ All data stays on your computer

**Questions?** Open an issue on GitHub: https://github.com/ShunsukeHayashi/Miyabi/issues

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
