import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { IssueNode } from './nodes/IssueNode';
import { AgentNode } from './nodes/AgentNode';
import { StateNode } from './nodes/StateNode';
import { StatsPanel } from './StatsPanel';
import { Sidebar } from './Sidebar';
import { ActivityLog, type ActivityLogEntry } from './ActivityLog';
import { FilterPanel, type FilterOptions } from './FilterPanel';
import { WorkflowStageIndicator } from './WorkflowStageIndicator';
import { ExplanationPanel, type ExplanationEntry } from './ExplanationPanel';
import { LegendPanel } from './LegendPanel';
import { AgentThinkingBubbles } from './AgentThinkingBubble';
import { SystemMetricsDashboard } from './SystemMetricsDashboard';
import { ParticleFlow, useParticleFlow } from './ParticleFlow';
import { CelebrationEffect, useCelebration } from './CelebrationEffect';
import { NodeDetailsModal } from './NodeDetailsModal';
import { useWebSocket } from '../hooks/useWebSocket';
import type { GraphNode, GraphEdge } from '../types';

const nodeTypes: NodeTypes = {
  issue: IssueNode,
  agent: AgentNode,
  state: StateNode,
};

export function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    states: [],
    agents: [],
    priorities: [],
    showOnlyActive: false,
  });
  const reactFlowInstance = useRef<any>(null);

  // Workflow stage tracking
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  // Explanation entries
  const [explanations, setExplanations] = useState<ExplanationEntry[]>([]);

  // NEW: System start time for metrics
  const [systemStartTime] = useState(new Date());

  // NEW: Agent thinking state
  const [agentThinking, setAgentThinking] = useState<
    Record<string, { thinking: string; position: { x: number; y: number }; status: string }>
  >({});

  // NEW: Node details modal
  const [detailsNode, setDetailsNode] = useState<GraphNode | null>(null);

  // NEW: Celebration and particle flow hooks
  const { celebrationTrigger, celebrate } = useCelebration();
  const { activeEdgeIds, activateEdgesForNode } = useParticleFlow();

  // Helper to add activity log entry
  const addActivity = useCallback((entry: Omit<ActivityLogEntry, 'id'>) => {
    setActivities((prev) => [
      {
        ...entry,
        id: `${Date.now()}-${Math.random()}`,
      },
      ...prev,
    ]);
  }, []);

  // Helper to add explanation entry
  const addExplanation = useCallback((entry: Omit<ExplanationEntry, 'id'>) => {
    setExplanations((prev) => [
      {
        ...entry,
        id: `${Date.now()}-${Math.random()}`,
      },
      ...prev,
    ]);
  }, []);

  // Auto-focus on a specific node with smooth animation
  const focusOnNode = useCallback((nodeId: string) => {
    if (!reactFlowInstance.current) return;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    reactFlowInstance.current.setCenter(
      node.position.x + 150,
      node.position.y + 100,
      { zoom: 1.2, duration: 800 }
    );
  }, [nodes]);

  // WebSocket connection
  const { connected } = useWebSocket(
    // onGraphUpdate
    (event) => {
      console.log('📊 Graph updated:', event);
      setNodes(event.nodes as any);
      setEdges(event.edges as any);
      setLoading(false);
      addActivity({
        type: 'graph:update',
        message: 'Graph data refreshed',
        timestamp: event.timestamp || new Date().toISOString(),
        icon: '🔄',
        color: '#3B82F6',
      });
    },
    // onAgentStarted
    (event) => {
      console.log('🤖 Agent started:', event);

      // Update workflow stage
      setCurrentStage('execution');
      setCompletedStages(['discovery', 'analysis', 'decomposition', 'assignment']);

      // Build activity message with parameters
      let message = `${event.agentId} started working on Issue #${event.issueNumber}`;
      if (event.parameters?.taskTitle) {
        message += ` - ${event.parameters.taskTitle}`;
      }

      addActivity({
        type: 'agent:started',
        message,
        timestamp: event.timestamp || new Date().toISOString(),
        icon: '🤖',
        color: '#10B981',
      });

      // Add explanation
      const agentName = event.agentId === 'codegen' ? 'CodeGenAgent'
        : event.agentId === 'review' ? 'ReviewAgent'
        : event.agentId === 'pr' ? 'PRAgent'
        : event.agentId === 'deployment' ? 'DeploymentAgent'
        : event.agentId;

      addExplanation({
        timestamp: event.timestamp || new Date().toISOString(),
        title: `💻 ${agentName}が実行開始`,
        explanation: `${agentName}がIssue #${event.issueNumber}の処理を開始しました。進捗状況はプログレスバーで確認できます。`,
        details: event.parameters ? [
          `タスク: ${event.parameters.taskTitle || '未設定'}`,
          `優先度: ${event.parameters.priority || '通常'}`,
          `コンテキスト: ${event.parameters.context || '自動判定'}`,
        ] : [],
        type: 'success',
        icon: '💻',
      });

      // Update agent node status with parameters
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'agent' && (node.data as any).agentId === event.agentId) {
            // Auto-focus on the agent that started
            setTimeout(() => focusOnNode(node.id), 100);

            // NEW: Set thinking message
            const thinkingMessages: Record<string, string> = {
              codegen: 'コード構造を分析中...',
              review: 'コード品質をレビュー中...',
              pr: 'Pull Requestを作成中...',
              deployment: 'デプロイ準備中...',
            };

            setAgentThinking((prev) => ({
              ...prev,
              [event.agentId]: {
                thinking: thinkingMessages[event.agentId] || 'タスクを実行中...',
                position: node.position,
                status: 'running',
              },
            }));

            // NEW: Activate particle flow for this node
            setTimeout(() => {
              activateEdgesForNode(node.id, edges as GraphEdge[], 5000);
            }, 100);

            return {
              ...node,
              data: {
                ...node.data,
                status: 'running',
                currentIssue: event.issueNumber,
                progress: 0,
                parameters: event.parameters || {},
              },
            };
          }
          return node;
        })
      );
    },
    // onAgentProgress
    (event) => {
      console.log('📈 Agent progress:', event);

      // NEW: Update thinking message based on progress
      const getProgressMessage = (agentId: string, progress: number): string => {
        if (agentId === 'codegen') {
          if (progress < 30) return 'コードベースを分析中...';
          if (progress < 60) return 'コードを生成中...';
          return 'テストを実行中...';
        }
        if (agentId === 'review') {
          if (progress < 40) return 'コード品質を分析中...';
          if (progress < 70) return 'セキュリティスキャン実行中...';
          return 'レビューコメント作成中...';
        }
        if (agentId === 'pr') {
          if (progress < 50) return 'コミットメッセージ作成中...';
          return 'Pull Request作成中...';
        }
        if (agentId === 'deployment') {
          if (progress < 30) return 'ビルドを実行中...';
          if (progress < 70) return 'テストを実行中...';
          return 'デプロイ中...';
        }
        return `処理中... ${progress}%`;
      };

      setAgentThinking((prev) => {
        if (prev[event.agentId]) {
          return {
            ...prev,
            [event.agentId]: {
              ...prev[event.agentId],
              thinking: getProgressMessage(event.agentId, event.progress),
            },
          };
        }
        return prev;
      });

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'agent' && (node.data as any).agentId === event.agentId) {
            return {
              ...node,
              data: {
                ...node.data,
                progress: event.progress,
              },
            };
          }
          return node;
        })
      );
    },
    // onAgentCompleted
    (event) => {
      console.log('✅ Agent completed:', event);

      // Update workflow stage to completed
      setCompletedStages(['discovery', 'analysis', 'decomposition', 'assignment', 'execution']);
      setCurrentStage(null);

      // NEW: Trigger celebration! 🎉
      celebrate();

      // NEW: Clear thinking message after delay
      setTimeout(() => {
        setAgentThinking((prev) => {
          const newThinking = { ...prev };
          delete newThinking[event.agentId];
          return newThinking;
        });
      }, 2000);

      addActivity({
        type: 'agent:completed',
        message: `${event.agentId} completed Issue #${event.issueNumber}`,
        timestamp: event.timestamp || new Date().toISOString(),
        icon: '✅',
        color: '#22C55E',
      });

      // Add explanation
      const agentName = event.agentId === 'codegen' ? 'CodeGenAgent'
        : event.agentId === 'review' ? 'ReviewAgent'
        : event.agentId === 'pr' ? 'PRAgent'
        : event.agentId === 'deployment' ? 'DeploymentAgent'
        : event.agentId;

      addExplanation({
        timestamp: event.timestamp || new Date().toISOString(),
        title: `✅ タスク完了！`,
        explanation: `${agentName}がIssue #${event.issueNumber}の処理を完了しました。結果はGitHubで確認できます。`,
        details: [
          `結果: 正常終了`,
          '',
          '次のタスクがあれば、同様のプロセスで自動処理を開始します。',
        ],
        type: 'success',
        icon: '✅',
      });

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'agent' && (node.data as any).agentId === event.agentId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: 'completed',
                progress: 100,
                currentIssue: undefined,
              },
            };
          }
          return node;
        })
      );

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.type === 'agent' && (node.data as any).agentId === event.agentId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  status: 'idle',
                  progress: 0,
                },
              };
            }
            return node;
          })
        );
      }, 3000);
    },
    // onAgentError
    (event) => {
      console.error('❌ Agent error:', event);
      addActivity({
        type: 'agent:error',
        message: `${event.agentId} failed on Issue #${event.issueNumber}: ${event.error}`,
        timestamp: event.timestamp || new Date().toISOString(),
        icon: '❌',
        color: '#EF4444',
      });
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'agent' && (node.data as any).agentId === event.agentId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: 'error',
                currentIssue: undefined,
              },
            };
          }
          return node;
        })
      );
    },
    // onStateTransition
    (event) => {
      console.log('🔄 State transition:', event);
      addActivity({
        type: 'state:transition',
        message: `Issue #${event.issueNumber}: ${event.from} → ${event.to}`,
        timestamp: event.timestamp || new Date().toISOString(),
        icon: '🔄',
        color: '#8B5CF6',
      });
      // Animate edge for state transition
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source.includes(`issue-${event.issueNumber}`)) {
            return { ...edge, animated: true };
          }
          return edge;
        })
      );

      // Stop animation after 2 seconds
      setTimeout(() => {
        setEdges((eds) =>
          eds.map((edge) => ({ ...edge, animated: false }))
        );
      }, 2000);
    },
    // onTaskDiscovered
    (event) => {
      console.log('📥 Tasks discovered:', event);

      // Update workflow stage
      setCurrentStage('discovery');
      setCompletedStages([]);

      addActivity({
        type: 'task:discovered',
        message: `${event.tasks.length} tasks discovered and queued for processing`,
        timestamp: event.timestamp,
        icon: '📥',
        color: '#6366F1',
      });

      // Add explanation
      addExplanation({
        timestamp: event.timestamp,
        title: '📥 タスク発見フェーズ',
        explanation: `GitHubから${event.tasks.length}個のIssueを読み込みました。これらのタスクを順番に分析していきます。`,
        details: event.tasks.map((task, i) =>
          `${i + 1}. Issue #${task.issueNumber}: ${task.title} (${task.priority})`
        ),
        type: 'info',
        icon: '📥',
      });

      // Show each task in the activity log
      event.tasks.forEach((task, index) => {
        setTimeout(() => {
          addActivity({
            type: 'task:discovered',
            message: `Task ${index + 1}: Issue #${task.issueNumber} - ${task.title} [${task.priority}]`,
            timestamp: event.timestamp,
            icon: '📋',
            color: '#8B5CF6',
          });
        }, index * 200);
      });
    },
    // onCoordinatorAnalyzing
    (event) => {
      console.log('🔍 Coordinator analyzing:', event);

      // Update workflow stage
      setCurrentStage('analysis');
      setCompletedStages(['discovery']);

      addActivity({
        type: 'coordinator:analyzing',
        message: `CoordinatorAgent analyzing Issue #${event.issueNumber}: ${event.analysis.type} | ${event.analysis.priority} | ${event.analysis.complexity}`,
        timestamp: event.timestamp,
        icon: '🔍',
        color: '#10B981',
      });

      // Add explanation
      addExplanation({
        timestamp: event.timestamp,
        title: '🔍 Issue分析中',
        explanation: `CoordinatorAgentがIssue #${event.issueNumber}の内容を詳しく分析しています。`,
        details: [
          `タイプ: ${event.analysis.type} - このタスクの種類を判定`,
          `優先度: ${event.analysis.priority} - 緊急度を評価`,
          `複雑度: ${event.analysis.complexity} - 難易度を算出`,
          '',
          '次のステップ：この分析結果に基づいて、タスクをサブタスクに分解します。',
        ],
        type: 'thinking',
        icon: '🔍',
      });

      // Focus on the coordinator agent
      const coordinatorNode = nodes.find(
        (n) => n.type === 'agent' && (n.data as any).agentId === 'coordinator'
      );
      if (coordinatorNode) {
        setTimeout(() => focusOnNode(coordinatorNode.id), 100);
      }

      // Highlight the issue node being analyzed
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'issue' && (node.data as any).number === event.issueNumber) {
            return {
              ...node,
              style: {
                ...node.style,
                border: '3px solid #10B981',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
              },
            };
          }
          return node;
        })
      );

      // Remove highlight after 2 seconds
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.type === 'issue' && (node.data as any).number === event.issueNumber) {
              return {
                ...node,
                style: {
                  ...node.style,
                  border: undefined,
                  boxShadow: undefined,
                },
              };
            }
            return node;
          })
        );
      }, 2000);
    },
    // onCoordinatorDecomposing
    (event) => {
      console.log('🧩 Coordinator decomposing:', event);

      // Update workflow stage
      setCurrentStage('decomposition');
      setCompletedStages(['discovery', 'analysis']);

      addActivity({
        type: 'coordinator:decomposing',
        message: `CoordinatorAgent decomposed Issue #${event.issueNumber} into ${event.subtasks.length} subtasks`,
        timestamp: event.timestamp,
        icon: '🧩',
        color: '#F59E0B',
      });

      // Add explanation
      addExplanation({
        timestamp: event.timestamp,
        title: '🧩 タスク分解中',
        explanation: `CoordinatorAgentがIssue #${event.issueNumber}を${event.subtasks.length}個のサブタスクに分解しました。大きなタスクを小さく分けることで、各Specialist Agentが効率的に処理できます。`,
        details: event.subtasks.map((subtask, i) =>
          `サブタスク${i + 1}: ${subtask.title} [${subtask.type}]`
        ),
        type: 'info',
        icon: '🧩',
      });

      // Show each subtask
      event.subtasks.forEach((subtask, index) => {
        setTimeout(() => {
          addActivity({
            type: 'coordinator:decomposing',
            message: `  Subtask ${index + 1}: ${subtask.title} [${subtask.type}]`,
            timestamp: event.timestamp,
            icon: '  ├─',
            color: '#FBBF24',
          });
        }, index * 150);
      });
    },
    // onCoordinatorAssigning
    (event) => {
      console.log('🎯 Coordinator assigning:', event);

      // Update workflow stage
      setCurrentStage('assignment');
      setCompletedStages(['discovery', 'analysis', 'decomposition']);

      addActivity({
        type: 'coordinator:assigning',
        message: `CoordinatorAgent assigning tasks for Issue #${event.issueNumber}`,
        timestamp: event.timestamp,
        icon: '🎯',
        color: '#8B5CF6',
      });

      // Add explanation
      addExplanation({
        timestamp: event.timestamp,
        title: '🎯 Agent割り当て中',
        explanation: `CoordinatorAgentが各サブタスクに最適なSpecialist Agentを選択しています。各Agentの専門性を考慮して、最も効率的な組み合わせを決定します。`,
        details: event.assignments.map((a) =>
          `${a.agentId} ← 理由: ${a.reason}`
        ),
        type: 'info',
        icon: '🎯',
      });

      // Show each assignment and focus on the assigned agent
      event.assignments.forEach((assignment, index) => {
        setTimeout(() => {
          addActivity({
            type: 'coordinator:assigning',
            message: `  → ${assignment.agentId}: ${assignment.reason}`,
            timestamp: event.timestamp,
            icon: '  🤖',
            color: '#A78BFA',
          });

          // Focus on the assigned agent
          const agentNode = nodes.find(
            (n) => n.type === 'agent' && (n.data as any).agentId === assignment.agentId
          );
          if (agentNode) {
            focusOnNode(agentNode.id);
          }
        }, index * 500);
      });
    }
  );

  // Filter nodes based on active filters
  const filteredNodes = useMemo(() => {
    let filtered = nodes;

    // Filter by state
    if (filters.states.length > 0) {
      filtered = filtered.filter((node) => {
        if (node.type === 'issue') {
          const data = node.data as any;
          return filters.states.some((s) => data.state?.includes(s));
        }
        return true; // Keep non-issue nodes
      });
    }

    // Filter by agent
    if (filters.agents.length > 0) {
      filtered = filtered.filter((node) => {
        if (node.type === 'agent') {
          const data = node.data as any;
          return filters.agents.includes(data.agentId);
        }
        if (node.type === 'issue') {
          const data = node.data as any;
          return data.assignedAgents?.some((a: string) => filters.agents.includes(a));
        }
        return true;
      });
    }

    // Filter by priority
    if (filters.priorities.length > 0) {
      filtered = filtered.filter((node) => {
        if (node.type === 'issue') {
          const data = node.data as any;
          return filters.priorities.some((p) => data.priority?.includes(p));
        }
        return true;
      });
    }

    // Show only active
    if (filters.showOnlyActive) {
      filtered = filtered.filter((node) => {
        if (node.type === 'agent') {
          const data = node.data as any;
          return data.status === 'running' || data.status === 'completed';
        }
        if (node.type === 'issue') {
          const data = node.data as any;
          return !data.state?.includes('done') && !data.state?.includes('failed');
        }
        return true;
      });
    }

    return filtered;
  }, [nodes, filters]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    // NEW: Show detailed modal instead of just sidebar
    setDetailsNode(node as GraphNode);
    setSelectedNode(node as GraphNode);
  }, []);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/refresh', { method: 'POST' })
      .then((res) => res.json())
      .then(() => {
        console.log('✅ Graph refresh triggered');
        addActivity({
          type: 'graph:update',
          message: 'Manual refresh triggered',
          timestamp: new Date().toISOString(),
          icon: '🔄',
          color: '#3B82F6',
        });
      })
      .catch((error) => {
        console.error('❌ Failed to refresh graph:', error);
      })
      .finally(() => {
        setTimeout(() => setLoading(false), 500);
      });
  }, [addActivity]);

  // Fetch initial graph data
  useEffect(() => {
    fetch('http://localhost:3001/api/graph')
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch initial graph:', error);
        setLoading(false);
      });
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading Agent Flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Stats Panel */}
      <StatsPanel nodes={nodes as any} />

      {/* NEW: System Metrics Dashboard (top-right) */}
      <SystemMetricsDashboard nodes={nodes as any} startTime={systemStartTime} />

      {/* Workflow Stage Indicator */}
      <WorkflowStageIndicator
        currentStage={currentStage}
        completedStages={completedStages}
      />

      {/* NEW: Celebration Effect */}
      <CelebrationEffect trigger={celebrationTrigger} />

      {/* Main content area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Connection status and controls */}
        <div className="absolute left-4 top-4 z-10 flex gap-2">
          <div className="rounded-lg bg-white p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  connected ? 'animate-pulse bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Manual refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-gray-50 disabled:opacity-50"
            title="Refresh graph manually"
          >
            <svg
              className={`h-5 w-5 text-gray-700 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-gray-50"
            title="Filter nodes"
          >
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* React Flow Canvas */}
        <div className={`flex-1 ${selectedNode ? 'pr-80' : ''}`}>
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={(instance) => {
              reactFlowInstance.current = instance;
            }}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={2} color="#4F46E5" />
            <Controls className="!bg-white/90 !backdrop-blur !border !border-gray-200 !shadow-xl" />
            <MiniMap
              className="!bg-gray-900/90 !border !border-gray-700"
              nodeColor={(node) => {
                if (node.type === 'agent') {
                  const data = node.data as any;
                  if (data.status === 'running') return '#8B5CF6';
                  if (data.status === 'completed') return '#10B981';
                  if (data.status === 'error') return '#EF4444';
                }
                return '#6B7280';
              }}
            />
          </ReactFlow>

          {/* NEW: Particle Flow Animation */}
          <ParticleFlow
            edges={edges as GraphEdge[]}
            nodes={nodes as any[]}
            activeEdgeIds={activeEdgeIds}
          />

          {/* NEW: Agent Thinking Bubbles */}
          <AgentThinkingBubbles
            bubbles={Object.entries(agentThinking).map(([agentId, data]) => {
              const agentNames: Record<string, string> = {
                codegen: 'CodeGen',
                review: 'Review',
                pr: 'PR',
                deployment: 'Deploy',
                coordinator: 'Coordinator',
              };
              return {
                agentId,
                agentName: agentNames[agentId] || agentId,
                thinking: data.thinking,
                position: data.position,
                status: data.status as any,
              };
            })}
          />
        </div>

        {/* Sidebar */}
        {selectedNode && (
          <Sidebar selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />
        )}

        {/* Explanation Panel */}
        <ExplanationPanel entries={explanations} />

        {/* Legend Panel */}
        <LegendPanel />
      </div>

      {/* Activity Log */}
      <ActivityLog activities={activities} />

      {/* NEW: Node Details Modal */}
      <NodeDetailsModal
        node={detailsNode}
        onClose={() => {
          setDetailsNode(null);
          setSelectedNode(null);
        }}
      />
    </div>
  );
}
