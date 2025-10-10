/**
 * GitHub API Response Fixtures
 * Mock responses for GitHub API calls used in tests
 */

export const mockProjectInfo = {
  projectId: 'PVT_test123',
  title: 'Test Project',
  number: 1,
  fields: [
    {
      id: 'PVTF_field1',
      name: 'Status',
      dataType: 'SINGLE_SELECT',
      options: [
        { id: 'opt1', name: 'Todo' },
        { id: 'opt2', name: 'In Progress' },
        { id: 'opt3', name: 'Done' },
      ],
    },
    {
      id: 'PVTF_field2',
      name: 'Priority',
      dataType: 'SINGLE_SELECT',
      options: [
        { id: 'opt4', name: 'High' },
        { id: 'opt5', name: 'Medium' },
        { id: 'opt6', name: 'Low' },
      ],
    },
  ],
};

export const mockWeeklyReport = `# Weekly Project Report

**Project**: Test Project (#1)
**Generated**: 2025-10-10

## Summary
- Total Items: 10
- Completed: 5
- In Progress: 3
- Todo: 2

## Activity
- Issues Opened: 3
- Issues Closed: 2
- Pull Requests: 4
`;

export const mockIssue = {
  id: 1,
  number: 123,
  title: 'Test Issue',
  body: 'Test description for the issue',
  state: 'open',
  labels: [
    { name: 'bug', color: 'd73a4a' },
    { name: 'priority:high', color: 'e99695' },
  ],
  user: { login: 'test-user', id: 456 },
  created_at: '2025-10-10T00:00:00Z',
  updated_at: '2025-10-10T00:00:00Z',
  html_url: 'https://github.com/test-owner/test-repo/issues/123',
};

export const mockPullRequest = {
  id: 2,
  number: 456,
  title: 'Test PR',
  body: 'Test pull request',
  state: 'open',
  head: { ref: 'feature/test', sha: 'abc123' },
  base: { ref: 'main', sha: 'def456' },
  user: { login: 'test-user', id: 456 },
  created_at: '2025-10-10T00:00:00Z',
  updated_at: '2025-10-10T00:00:00Z',
  html_url: 'https://github.com/test-owner/test-repo/pull/456',
};

export const mockRepository = {
  id: 789,
  name: 'test-repo',
  full_name: 'test-owner/test-repo',
  owner: { login: 'test-owner', id: 101 },
  private: false,
  description: 'Test repository',
  html_url: 'https://github.com/test-owner/test-repo',
  default_branch: 'main',
};

export const mockWorkflow = {
  id: 'workflow-123',
  type: 'feature',
  steps: [
    { id: 'step-1', name: 'Analyze', status: 'pending' },
    { id: 'step-2', name: 'Implement', status: 'pending' },
    { id: 'step-3', name: 'Review', status: 'pending' },
    { id: 'step-4', name: 'Deploy', status: 'pending' },
  ],
  createdAt: '2025-10-10T00:00:00Z',
};

export const mockMetrics = {
  timestamp: '2025-10-10T00:00:00Z',
  summary: {
    totalIssues: 50,
    openIssues: 10,
    closedIssues: 40,
    totalPRs: 30,
    mergedPRs: 25,
  },
  agents: {
    CoordinatorAgent: { executions: 100, successRate: 0.95 },
    CodeGenAgent: { executions: 80, successRate: 0.90 },
    ReviewAgent: { executions: 75, successRate: 0.92 },
  },
  states: {
    pending: 5,
    analyzing: 2,
    implementing: 3,
    reviewing: 1,
    done: 40,
  },
};

export const mockDiscussion = {
  id: 'D_disc123',
  number: 10,
  title: 'Knowledge Base Entry',
  body: 'Test discussion content',
  category: { id: 'CAT_kb1', name: 'Knowledge Base' },
  createdAt: '2025-10-10T00:00:00Z',
  url: 'https://github.com/test-owner/test-repo/discussions/10',
};

export const mockWorkflowRun = {
  id: 123456789,
  name: 'CI/CD Pipeline',
  status: 'completed',
  conclusion: 'success',
  html_url: 'https://github.com/test-owner/test-repo/actions/runs/123456789',
  created_at: '2025-10-10T00:00:00Z',
  updated_at: '2025-10-10T00:05:00Z',
};

export const mockSecurityScan = {
  timestamp: '2025-10-10T00:00:00Z',
  findings: [],
  summary: {
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 0,
  },
};

export const mockJSDocComment = {
  name: 'testFunction',
  description: 'A test function',
  params: [
    { name: 'param1', type: 'string', description: 'First parameter' },
    { name: 'param2', type: 'number', description: 'Second parameter' },
  ],
  returns: { type: 'boolean', description: 'Result value' },
};
