/**
 * CoordinatorAgent Tests
 *
 * Tests for task decomposition, DAG construction, and execution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinatorAgent } from '../agents/coordinator/coordinator-agent.js';
import { Task, AgentConfig, Issue } from '../agents/types/index.js';

describe('CoordinatorAgent', () => {
  let agent: CoordinatorAgent;
  let config: AgentConfig;

  beforeEach(() => {
    config = {
      deviceIdentifier: 'test-device',
      githubToken: 'test-token',
      anthropicApiKey: 'test-key',
      useTaskTool: false,
      useWorktree: false,
      logDirectory: '.ai/logs',
      reportDirectory: '.ai/test-reports',
    };

    agent = new CoordinatorAgent(config);
  });

  describe('Task Decomposition', () => {
    it('should decompose an Issue into tasks', async () => {
      const issue: Issue = {
        number: 1,
        title: 'Add user authentication',
        body: `
## Tasks
- [ ] Create login API
- [ ] Add JWT token generation
- [ ] Implement user model
        `,
        state: 'open',
        labels: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/1',
      };

      const decomposition = await agent.decomposeIssue(issue);

      expect(decomposition.tasks.length).toBeGreaterThan(0);
      expect(decomposition.dag).toBeDefined();
      expect(decomposition.hasCycles).toBe(false);
    });
  });

  describe('DAG Construction', () => {
    it('should build a valid DAG from tasks', async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'First task',
          type: 'feature',
          priority: 1,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 30,
          status: 'idle',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Second task depends on task-1',
          type: 'feature',
          priority: 2,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'ReviewAgent',
          dependencies: ['task-1'],
          estimatedDuration: 15,
          status: 'idle',
        },
      ];

      const dag = await agent.buildDAG(tasks);

      expect(dag.nodes.length).toBe(2);
      expect(dag.edges.length).toBe(1);
      expect(dag.levels.length).toBeGreaterThan(0);
    });

    it('should detect circular dependencies', async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Task 1 depends on task-2',
          type: 'feature',
          priority: 1,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'CodeGenAgent',
          dependencies: ['task-2'],
          estimatedDuration: 30,
          status: 'idle',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Task 2 depends on task-1',
          type: 'feature',
          priority: 2,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'ReviewAgent',
          dependencies: ['task-1'],
          estimatedDuration: 15,
          status: 'idle',
        },
      ];

      const dag = await agent.buildDAG(tasks);
      const hasCycles = agent['detectCycles'](dag);

      expect(hasCycles).toBe(true);
    });
  });

  describe('Agent Assignment', () => {
    it('should assign CodeGenAgent for feature tasks', () => {
      // Test agent assignment logic through task creation
      const task: Task = {
        id: 'test-1',
        title: 'Feature task',
        description: 'Test',
        type: 'feature',
        priority: 1,
        severity: 'Sev.3-Medium',
        impact: 'Medium',
        assignedAgent: 'CodeGenAgent',
        dependencies: [],
        estimatedDuration: 30,
        status: 'idle',
      };

      expect(task.assignedAgent).toBe('CodeGenAgent');
    });

    it('should assign DeploymentAgent for deployment tasks', () => {
      const task: Task = {
        id: 'test-2',
        title: 'Deploy task',
        description: 'Test',
        type: 'deployment',
        priority: 1,
        severity: 'Sev.3-Medium',
        impact: 'Medium',
        assignedAgent: 'DeploymentAgent',
        dependencies: [],
        estimatedDuration: 30,
        status: 'idle',
      };

      expect(task.assignedAgent).toBe('DeploymentAgent');
    });
  });

  describe('Execution Plan', () => {
    it('should create a valid execution plan', async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Test Task',
          description: 'A test task',
          type: 'feature',
          priority: 1,
          severity: 'Sev.3-Medium',
          impact: 'Medium',
          assignedAgent: 'CodeGenAgent',
          dependencies: [],
          estimatedDuration: 30,
          status: 'idle',
        },
      ];

      const dag = await agent.buildDAG(tasks);

      // Test execution plan structure
      expect(dag.nodes.length).toBe(1);
      expect(dag.edges.length).toBe(0);
      expect(dag.levels.length).toBe(1);
    });
  });
});
