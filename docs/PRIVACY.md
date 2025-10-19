# Privacy Policy

**Miyabi CLI - Privacy Policy**

**Version**: 1.0.0
**Effective Date**: 2025-10-20
**Last Updated**: 2025-10-20

---

## 📋 Overview

Shunsuke Hayashi ("we," "us," or "Licensor") is committed to protecting your privacy. This Privacy Policy explains how Miyabi CLI ("Software") collects, uses, discloses, and safeguards your information when you use our Software.

**Key Principles**:
- 🔒 **Privacy by Default**: Data collection requires explicit opt-in consent
- 🎯 **Minimal Data Collection**: We collect only what is necessary
- 🔍 **Transparency**: Full disclosure of what data we collect and why
- 🛡️ **User Control**: You control your data and can delete it at any time
- ⚖️ **Legal Compliance**: GDPR, CCPA, and international privacy law compliance

---

## 1. Information We Collect

### 1.1 Mandatory Data (Local Only) - NO CONSENT REQUIRED

The Software **automatically generates and stores** the following data **locally on your device only**. This data is **NEVER transmitted** to our servers without your explicit consent:

| Data Type | Purpose | Storage Location | Transmitted? |
|-----------|---------|------------------|--------------|
| Anonymous User ID (UUID v4) | Unique installation identifier | `~/.miyabi/config.json` | ❌ No |
| EULA Version | Track which EULA version you accepted | `~/.miyabi/consent.json` | ❌ No |
| EULA Acceptance Timestamp | Record when you accepted EULA | `~/.miyabi/consent.json` | ❌ No |
| Installation Date | Record when Software was first installed | `~/.miyabi/config.json` | ❌ No |
| Consent Preferences | Your opt-in/opt-out choices | `~/.miyabi/consent.json` | ❌ No |

**These files remain on your device and are never sent to external servers.**

### 1.2 Optional Data (Requires Opt-In Consent)

The following data is collected **ONLY IF YOU EXPLICITLY OPT IN**:

#### 1.2.1 User Registration (Optional)

When you choose to register your installation, we collect:

| Data Type | Purpose | How We Use It | Can Be Deleted? |
|-----------|---------|---------------|-----------------|
| Email Address | Product updates, security alerts, community newsletters | Sending notifications you requested | ✅ Yes |
| Registration Timestamp | Track when you registered | Account management | ✅ Yes |
| Marketing Opt-In Status | Whether you want marketing emails | Determine email eligibility | ✅ Yes |
| Beta Program Opt-In Status | Whether you want early access to features | Invite to beta programs | ✅ Yes |

**You can register using**:
```bash
miyabi register
```

**You can unregister and delete your data using**:
```bash
miyabi account delete
```

#### 1.2.2 Anonymous Usage Analytics (Optional)

If you opt in to usage analytics, we collect:

| Data Type | Example | Purpose | Can Be Deleted? |
|-----------|---------|---------|-----------------|
| Command Usage Frequency | "miyabi init" executed 5 times | Understand feature popularity | ✅ Yes |
| Error Types and Frequencies | "GitHub API timeout" occurred 2 times | Improve error handling | ✅ Yes |
| OS Version and Architecture | "macOS 14.0, ARM64" | Test compatibility | ✅ Yes |
| Software Version | "v0.2.0" | Track version adoption | ✅ Yes |
| Command Execution Duration | "miyabi agent run" took 12 seconds | Optimize performance | ✅ Yes |

**You can enable analytics using**:
```bash
miyabi config analytics --enable
```

**You can disable analytics using**:
```bash
miyabi config analytics --disable
```

#### 1.2.3 Crash Reports (Optional)

If you opt in to crash reporting, we collect:

| Data Type | Example | Purpose | Can Be Deleted? |
|-----------|---------|---------|-----------------|
| Error Stack Traces | Rust panic backtrace (anonymized) | Debug crashes | ✅ Yes |
| System Information | OS version, CPU architecture | Reproduce crashes | ✅ Yes |
| Configuration State | Active agents, concurrent tasks | Understand crash context | ✅ Yes |

**Stack traces are automatically sanitized to remove**:
- File paths containing personal information
- Environment variable values
- Any PII (personally identifiable information)

**You can enable crash reporting using**:
```bash
miyabi config crash-reports --enable
```

### 1.3 What We DO NOT Collect

We **explicitly do NOT collect** the following without your consent:

- ❌ **Project names or code content** - Your code is yours
- ❌ **File paths or directory structures** - Your filesystem layout is private
- ❌ **Environment variables** - Your secrets remain secret
- ❌ **Git commit messages or PR content** - Your development history is private
- ❌ **GitHub repository names** - Your projects are private
- ❌ **API keys or tokens** - Your credentials are never transmitted
- ❌ **Personal information** - Name, address, phone number (except optional email)
- ❌ **IP addresses** - We do not log your network location
- ❌ **Device identifiers** - MAC address, IMEI, etc.

---

## 2. How We Use Your Information

### 2.1 Local Data (No Consent Required)

The mandatory local data is used **only** for:
- ✅ Ensuring EULA compliance (checking if you accepted the agreement)
- ✅ Managing your consent preferences (opt-in/opt-out tracking)
- ✅ Providing basic Software functionality

### 2.2 User Registration Data (Opt-In Required)

If you choose to register, we use your email to:
- ✅ Send product update notifications (if you opt in)
- ✅ Send security alerts (critical vulnerabilities)
- ✅ Invite you to beta programs (if you opt in)
- ✅ Deliver community newsletters (if you opt in)

**You can unsubscribe from any email type at any time.**

### 2.3 Usage Analytics Data (Opt-In Required)

If you opt in to analytics, we use the data to:
- ✅ Identify the most popular features (to prioritize development)
- ✅ Detect common errors (to improve stability)
- ✅ Optimize performance (to reduce execution time)
- ✅ Test compatibility (to support more platforms)

**All analytics data is anonymized and cannot be linked back to you.**

### 2.4 Crash Reports (Opt-In Required)

If you opt in to crash reporting, we use the data to:
- ✅ Reproduce and fix bugs
- ✅ Improve error handling
- ✅ Prevent future crashes

---

## 3. Data Storage and Security

### 3.1 Local Storage

**Mandatory data** is stored locally in:
- `~/.miyabi/config.json` - Configuration settings
- `~/.miyabi/consent.json` - Consent preferences
- `~/.miyabi/logs/` - Local activity logs (never transmitted)

**Permissions**: These files are readable only by your user account (Unix permissions: `0600`).

### 3.2 Remote Storage (Opt-In Only)

If you opt in to data collection, **optional data** is stored in:

| Storage System | Data Type | Encryption | Retention Period |
|----------------|-----------|------------|------------------|
| PostgreSQL Database | User registration, consent records | AES-256 encryption at rest | Until account deletion |
| Time-Series Database | Usage analytics, error logs | AES-256 encryption at rest | 90 days (rolling window) |
| Object Storage | Crash reports (anonymized) | AES-256 encryption at rest | 30 days |

**Geographic Location**: All servers are located in **Tokyo, Japan** (AWS ap-northeast-1 region).

### 3.3 Security Measures

We implement industry-standard security measures:

- 🔐 **Encryption in Transit**: TLS 1.3 for all API communications
- 🔐 **Encryption at Rest**: AES-256 for database and object storage
- 🔐 **Access Control**: Role-based access control (RBAC) for internal systems
- 🔐 **Authentication**: Multi-factor authentication (MFA) for all administrative access
- 🔐 **Monitoring**: 24/7 security monitoring and intrusion detection
- 🔐 **Auditing**: Comprehensive audit logs for all data access
- 🔐 **Regular Backups**: Daily encrypted backups with 30-day retention

### 3.4 Data Breach Notification

In the event of a data breach affecting your information, we will:
1. Notify you via email within **72 hours** of discovery
2. Describe the nature of the breach and data affected
3. Provide steps to protect yourself
4. Report the breach to relevant authorities (as required by law)

**Security Contact**: security@miyabi.dev

---

## 4. Third-Party Services

### 4.1 Services You Control

The Software integrates with third-party services. Your use of these services is governed by their privacy policies:

| Service | Purpose | Data Shared | Your Consent Required? | Privacy Policy |
|---------|---------|-------------|------------------------|----------------|
| **GitHub API** | Repository management, issue tracking, PR creation | Your GitHub token (never sent to us) | ✅ Yes (you provide token) | [GitHub Privacy](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) |
| **Anthropic API** | AI-powered code generation and review | Your Anthropic API key (never sent to us) | ✅ Yes (you provide key) | [Anthropic Privacy](https://www.anthropic.com/legal/privacy) |

**IMPORTANT**: We do NOT have access to your GitHub tokens or Anthropic API keys. These are stored locally on your device and sent directly to the respective services.

### 4.2 Our Service Providers (Opt-In Only)

If you opt in to registration/analytics, we may share anonymized data with:

| Service Provider | Purpose | Data Shared | Privacy Policy |
|------------------|---------|-------------|----------------|
| **AWS** | Infrastructure hosting | Only if you opt in | [AWS Privacy](https://aws.amazon.com/privacy/) |
| **SendGrid** | Email delivery (if registered) | Email address only | [SendGrid Privacy](https://www.twilio.com/legal/privacy) |

**These providers are contractually bound to protect your data and cannot use it for other purposes.**

---

## 5. Data Sharing

### 5.1 We DO NOT Sell Your Data

**We do NOT sell, rent, or trade your personal information to third parties.**

### 5.2 Legal Requirements

We may disclose your information if required by law:
- Court orders or subpoenas
- Compliance with legal obligations
- Protection of our rights or safety of others
- Investigation of fraud or security issues

**We will notify you of legal requests unless prohibited by law.**

---

## 6. Your Privacy Rights

### 6.1 GDPR Rights (European Union)

If you are in the EU/EEA, you have the following rights under GDPR:

| Right | Description | How to Exercise |
|-------|-------------|-----------------|
| **Right to Access** | Request a copy of your personal data | `miyabi account export` or email privacy@miyabi.dev |
| **Right to Rectification** | Correct inaccurate data | `miyabi account update` or email privacy@miyabi.dev |
| **Right to Erasure** ("Right to be Forgotten") | Delete your data | `miyabi account delete` or email privacy@miyabi.dev |
| **Right to Restriction** | Limit how we process your data | Email privacy@miyabi.dev |
| **Right to Data Portability** | Receive your data in machine-readable format | `miyabi account export --format json` |
| **Right to Object** | Object to data processing | `miyabi config analytics --disable` or email privacy@miyabi.dev |
| **Right to Withdraw Consent** | Revoke consent at any time | `miyabi config analytics --disable` |
| **Right to Lodge a Complaint** | File complaint with supervisory authority | Contact your national Data Protection Authority |

**Data Protection Officer (DPO)**: privacy@miyabi.dev

### 6.2 CCPA Rights (California, USA)

If you are a California resident, you have the following rights under CCPA:

| Right | Description | How to Exercise |
|-------|-------------|-----------------|
| **Right to Know** | Request categories and specific pieces of data collected | `miyabi account export` or email privacy@miyabi.dev |
| **Right to Delete** | Request deletion of your personal information | `miyabi account delete` or email privacy@miyabi.dev |
| **Right to Opt-Out** | Opt out of data "sale" (we don't sell data, but you can opt out of analytics) | `miyabi config analytics --disable` |
| **Right to Non-Discrimination** | Use the Software without discrimination for exercising your rights | Automatic (no action required) |

**CCPA Contact**: privacy@miyabi.dev

### 6.3 Other Jurisdictions

We respect privacy rights under laws including:
- **PIPEDA** (Canada)
- **APPI** (Japan)
- **LGPD** (Brazil)
- **POPIA** (South Africa)

**If you are in another jurisdiction with privacy rights, contact us at privacy@miyabi.dev.**

---

## 7. Managing Your Data

### 7.1 View Your Data

```bash
# View all locally stored data
miyabi config show

# View consent preferences
miyabi consent show

# Export your data (if registered)
miyabi account export --format json --output my-data.json
```

### 7.2 Update Your Preferences

```bash
# Enable analytics
miyabi config analytics --enable

# Disable analytics
miyabi config analytics --disable

# Enable crash reports
miyabi config crash-reports --enable

# Disable crash reports
miyabi config crash-reports --disable

# Update email preferences (if registered)
miyabi account update-email new@example.com
```

### 7.3 Delete Your Data

#### Delete Local Data Only
```bash
# Delete all local configuration and logs
miyabi config reset

# This will prompt for confirmation:
# ⚠️  WARNING: This will delete all local data, including:
#   - Configuration (~/.miyabi/config.json)
#   - Consent preferences (~/.miyabi/consent.json)
#   - Local logs (~/.miyabi/logs/)
#
# Your account on our servers (if registered) will NOT be deleted.
# To delete your account, run: miyabi account delete
#
# Are you sure? (y/N):
```

#### Delete Your Account and All Data
```bash
# Delete your account and ALL data (local + remote)
miyabi account delete

# This will:
# 1. Delete your account from our servers
# 2. Delete all usage analytics and crash reports
# 3. Unsubscribe you from all emails
# 4. Delete all local data
#
# This action is IRREVERSIBLE.
#
# Type your email to confirm: _
```

**Data Deletion Timeline**:
- **Immediate**: Local data deleted instantly
- **Within 30 days**: Remote data deleted from active databases
- **Within 90 days**: Data deleted from all backups

### 7.4 Export Your Data

```bash
# Export your data to JSON
miyabi account export --format json --output my-data.json

# Export your data to CSV
miyabi account export --format csv --output my-data.csv
```

**Exported data includes**:
- User registration information (email, timestamps)
- Consent preferences (analytics opt-in, marketing opt-in)
- Usage statistics (if you opted in)
- Crash report metadata (if you opted in)

---

## 8. Children's Privacy

The Software is **not intended for children under 13 years of age** (or the applicable age in your jurisdiction).

We do **not knowingly collect personal information from children**. If you believe a child has provided us with personal information, contact us at privacy@miyabi.dev and we will delete it immediately.

**Parents/Guardians**: If you discover your child is using the Software, please contact us.

---

## 9. International Data Transfers

If you are located outside Japan, your data may be transferred to and processed in Japan.

**We comply with international data transfer requirements**:
- **EU-Japan Adequacy Decision**: Japan is recognized by the EU as providing adequate data protection
- **Standard Contractual Clauses (SCCs)**: We use SCCs for transfers to countries without adequacy decisions
- **Data Transfer Impact Assessments (DTIAs)**: We conduct DTIAs for high-risk transfers

**Your consent to this Privacy Policy constitutes consent to international data transfers.**

---

## 10. Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| **Local Mandatory Data** | Until you uninstall or run `miyabi config reset` | Required for Software functionality |
| **User Registration Data** | Until you delete your account | Required for account management |
| **Usage Analytics** | 90 days (rolling window) | Sufficient for trend analysis |
| **Crash Reports** | 30 days | Sufficient for debugging |
| **Email Logs** | 90 days | Required for compliance |
| **Audit Logs** | 1 year | Required for security monitoring |
| **Backups** | 90 days | Disaster recovery |

**After the retention period, data is permanently deleted.**

---

## 11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be communicated through:

1. **Software Notification**: A message when you run `miyabi` after an update
2. **Email Notification**: If you registered with email (for material changes)
3. **Website Announcement**: Posted on our GitHub repository

**Continued use of the Software after changes constitutes acceptance.**

**You can view the current Privacy Policy version at any time**:
```bash
miyabi privacy --show
```

**Version History**:
- **v1.0.0** (2025-10-20): Major update - Added opt-in consent system, GDPR/CCPA compliance, customer management
- **v0.1.0** (2025-10-10): Initial version - No data collection

---

## 12. Contact Us

For privacy-related questions, requests, or concerns, contact:

| Purpose | Contact |
|---------|---------|
| **General Privacy Questions** | privacy@miyabi.dev |
| **Data Access/Deletion Requests** | privacy@miyabi.dev |
| **GDPR/CCPA Requests** | privacy@miyabi.dev |
| **Security Issues** | security@miyabi.dev |
| **General Support** | support@miyabi.dev |
| **Discord Community** | https://discord.gg/Urx8547abS |

**Mailing Address**:
```
Shunsuke Hayashi
Miyabi Privacy Office
[Address to be added]
Tokyo, Japan
```

**Response Time**: We will respond to privacy requests within **30 days** (or as required by applicable law).

---

## 13. Consent

By using the Software, you acknowledge that:

1. ✅ You have read and understood this Privacy Policy
2. ✅ You consent to the collection and use of mandatory local data (as described in Section 1.1)
3. ✅ You understand that optional data collection requires explicit opt-in consent
4. ✅ You can withdraw consent at any time using `miyabi config analytics --disable`
5. ✅ You have the right to access, correct, and delete your data

**IF YOU DO NOT ACCEPT THIS PRIVACY POLICY, DO NOT USE THE SOFTWARE.**

---

## 14. Legal Review Notice

⚖️ **IMPORTANT FOR LICENSOR**:

This Privacy Policy is a **draft template** and should be reviewed by a qualified legal professional before production use. Considerations include:

- Jurisdiction-specific privacy laws (GDPR, CCPA, PIPEDA, APPI, LGPD, POPIA, etc.)
- Data transfer mechanisms (SCCs, adequacy decisions)
- Data protection impact assessments (DPIAs)
- Data processing agreements (DPAs) with service providers
- Breach notification procedures
- Cookie consent mechanisms (for website)

**Recommended**: Consult with a lawyer specializing in privacy law and data protection.

---

**© 2025 Shunsuke Hayashi. All rights reserved.**

**Version**: 1.0.0
**Last Updated**: 2025-10-20
**Privacy Policy ID**: MIYABI-PRIVACY-20251020-v1
