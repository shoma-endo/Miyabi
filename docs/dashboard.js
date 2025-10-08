/**
 * Dashboard JavaScript
 * Loads KPI data and renders charts
 */

let trendsChart = null;
let costChart = null;

async function loadDashboard() {
  try {
    const response = await fetch('dashboard-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Hide loading, show dashboard
    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Render data
    renderSummary(data.summary);
    renderTrendsChart(data.trends);
    renderCostChart(data.agents);
    renderAgentTable(data.agents);
    renderTimestamp(data.generated);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById('loading').style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.textContent = `Error loading dashboard data: ${error.message}. Make sure dashboard-data.json exists.`;
    errorEl.style.display = 'block';
  }
}

function renderSummary(summary) {
  document.getElementById('total-issues').textContent = summary.totalIssues;
  document.getElementById('completion-rate').textContent = summary.completionRate + '%';
  document.getElementById('completed-issues').textContent = summary.completedIssues;
  document.getElementById('avg-duration').textContent = summary.avgDuration + ' min';
  document.getElementById('total-cost').textContent = '$' + summary.totalCost.toFixed(2);
  document.getElementById('avg-quality').textContent = summary.avgQualityScore + '/100';

  // Update progress bar
  document.getElementById('completion-progress').style.width = summary.completionRate + '%';
}

function renderTrendsChart(trends) {
  const ctx = document.getElementById('trends-chart').getContext('2d');

  if (trendsChart) {
    trendsChart.destroy();
  }

  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trends.map(t => {
        const date = new Date(t.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Completed',
          data: trends.map(t => t.completed),
          borderColor: '#3fb950',
          backgroundColor: 'rgba(63, 185, 80, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'In Progress',
          data: trends.map(t => t.inProgress),
          borderColor: '#58a6ff',
          backgroundColor: 'rgba(88, 166, 255, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#c9d1d9',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#8b949e',
            stepSize: 1,
          },
          grid: {
            color: '#30363d',
          },
        },
        x: {
          ticks: {
            color: '#8b949e',
          },
          grid: {
            color: '#30363d',
          },
        },
      },
    },
  });
}

function renderCostChart(agents) {
  const ctx = document.getElementById('cost-chart').getContext('2d');

  if (costChart) {
    costChart.destroy();
  }

  costChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: agents.map(a => a.name),
      datasets: [{
        data: agents.map(a => a.avgCost * a.tasksCompleted),
        backgroundColor: [
          '#58a6ff',
          '#3fb950',
          '#d29922',
          '#f85149',
        ],
        borderColor: '#161b22',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#c9d1d9',
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              return `${label}: $${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

function renderAgentTable(agents) {
  const tbody = document.getElementById('agent-tbody');
  tbody.innerHTML = '';

  // Sort by tasks completed (descending)
  agents.sort((a, b) => b.tasksCompleted - a.tasksCompleted);

  for (const agent of agents) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td class="agent-name">${agent.name}</td>
      <td>${agent.tasksCompleted}</td>
      <td>${agent.avgDuration} min</td>
      <td>$${agent.avgCost.toFixed(2)}</td>
      <td>
        ${agent.avgQuality.toFixed(1)}/100
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${agent.avgQuality}%"></div>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  }
}

function renderTimestamp(generated) {
  const date = new Date(generated);
  const formatted = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  document.getElementById('timestamp').textContent = `Last updated: ${formatted}`;
}

// Load dashboard on page load
window.addEventListener('DOMContentLoaded', loadDashboard);
