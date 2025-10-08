## GitHub Pages Dashboard

Real-time KPI dashboard for Autonomous Operations.

**OS Mapping**: `GitHub Pages → GUI / Display Server`

---

## Setup

1. Enable GitHub Pages:
   - Repository → Settings → Pages
   - Source: "GitHub Actions"

2. Set Project Number (optional):
   - Repository → Settings → Variables → Actions
   - New variable: `GITHUB_PROJECT_NUMBER` = `1`

3. Deploy:
   ```bash
   git push origin main
   # Or manual trigger:
   gh workflow run deploy-pages.yml
   ```

4. Access:
   - https://YOUR_USERNAME.github.io/Autonomous-Operations/

---

## Features

- **Real-time KPI**: Total issues, completion rate, avg duration, cost, quality
- **Weekly Trends**: Line chart showing completed/in-progress tasks
- **Cost Distribution**: Doughnut chart by agent
- **Agent Performance**: Table with metrics per agent
- **Auto-refresh**: Updates every 6 hours
- **Dark Mode**: GitHub-themed UI

---

## Manual Update

```bash
npm run generate:dashboard-data
git add docs/dashboard-data.json
git commit -m "chore: update dashboard data"
git push
```

---

Related: Issue #5 Phase E
