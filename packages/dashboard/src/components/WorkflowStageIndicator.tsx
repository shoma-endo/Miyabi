/**
 * Workflow Stage Indicator
 *
 * Displays the current stage of the autonomous workflow in an intuitive visual format.
 * Shows 5 main stages with progress indication and Japanese explanations.
 */

import { useMemo } from 'react';

export interface WorkflowStage {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  icon: string;
  color: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'discovery',
    name: 'Task Discovery',
    nameJa: 'タスク発見',
    description: 'GitHubからIssueを読み込んで、処理すべきタスクを発見します',
    icon: '📥',
    color: '#6366F1', // Indigo
  },
  {
    id: 'analysis',
    name: 'Analysis',
    nameJa: '分析',
    description: 'CoordinatorAgentがIssueを分析し、タイプ・優先度・複雑度を判定します',
    icon: '🔍',
    color: '#10B981', // Green
  },
  {
    id: 'decomposition',
    name: 'Task Decomposition',
    nameJa: 'タスク分解',
    description: 'Issueを複数のサブタスクに分解し、実行可能な単位にします',
    icon: '🧩',
    color: '#F59E0B', // Amber
  },
  {
    id: 'assignment',
    name: 'Agent Assignment',
    nameJa: 'Agent割り当て',
    description: '各サブタスクに最適なSpecialist Agentを選択・割り当てます',
    icon: '🎯',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'execution',
    name: 'Execution',
    nameJa: '実行',
    description: 'Specialist Agentがタスクを実行し、コード生成・レビュー・PRを作成します',
    icon: '💻',
    color: '#EC4899', // Pink
  },
];

export interface WorkflowStageIndicatorProps {
  currentStage: string | null;
  completedStages: string[];
}

export function WorkflowStageIndicator({ currentStage, completedStages }: WorkflowStageIndicatorProps) {
  // Determine the active stage index
  const activeStageIndex = useMemo(() => {
    if (!currentStage) return -1;
    return WORKFLOW_STAGES.findIndex((stage) => stage.id === currentStage);
  }, [currentStage]);

  return (
    <div className="glass-effect-dark border-b border-white/10 px-8 py-5 backdrop-blur-2xl">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span>自律ワークフロー / Autonomous Workflow</span>
          </h2>
          <p className="text-sm text-gray-300 mt-1 font-medium">
            {currentStage
              ? WORKFLOW_STAGES.find((s) => s.id === currentStage)?.description || 'Processing...'
              : 'Waiting for tasks...'}
          </p>
        </div>
        {activeStageIndex >= 0 && (
          <div className="rounded-full glass-effect px-4 py-2 text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Step {activeStageIndex + 1} / {WORKFLOW_STAGES.length}
          </div>
        )}
      </div>

      {/* Stage Progress */}
      <div className="flex items-center gap-2">
        {WORKFLOW_STAGES.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isActive = currentStage === stage.id;

          return (
            <div key={stage.id} className="flex flex-1 items-center">
              {/* Stage Card */}
              <div
                className={`relative flex flex-1 flex-col items-center rounded-2xl p-[2px] transition-all duration-500 ${
                  isActive
                    ? 'scale-110 shimmer'
                    : isCompleted
                    ? 'scale-105'
                    : 'opacity-60 scale-95'
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${stage.color}, ${stage.color}dd)`
                    : isCompleted
                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                    : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                  filter: isActive
                    ? `drop-shadow(0 0 20px ${stage.color}80)`
                    : isCompleted
                    ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6))'
                    : 'none',
                }}
              >
                <div className="w-full rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl p-4">
                  {/* Icon and Status */}
                  <div className="relative mb-3 flex justify-center">
                    <span
                      className="text-4xl transition-transform duration-300"
                      style={{
                        animation: isActive ? 'scalePulse 2s ease-in-out infinite' : 'none',
                        filter: isActive
                          ? `drop-shadow(0 0 15px ${stage.color})`
                          : isCompleted
                          ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))'
                          : 'none',
                      }}
                    >
                      {stage.icon}
                    </span>
                    {isCompleted && (
                      <div className="absolute -right-2 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-sm text-white font-bold shadow-lg">
                        ✓
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute -right-2 -top-1">
                        <div className="h-4 w-4 animate-ping rounded-full" style={{ backgroundColor: stage.color }}></div>
                        <div className="absolute top-0 h-4 w-4 rounded-full" style={{ backgroundColor: stage.color }}></div>
                      </div>
                    )}
                  </div>

                  {/* Stage Name */}
                  <div className="text-center">
                    <div
                      className={`text-sm font-black mb-1 ${
                        isActive || isCompleted ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {stage.nameJa}
                    </div>
                    <div
                      className={`text-[10px] font-semibold ${
                        isActive || isCompleted ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {stage.name}
                    </div>
                  </div>

                  {/* Progress Bar (for active stage) */}
                  {isActive && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-700/50">
                      <div
                        className="h-full animate-pulse rounded-full shadow-lg"
                        style={{
                          background: `linear-gradient(90deg, ${stage.color}, ${stage.color}dd, ${stage.color})`,
                          boxShadow: `0 0 10px ${stage.color}80`,
                          width: '100%',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow Connector */}
              {index < WORKFLOW_STAGES.length - 1 && (
                <div className="flex-shrink-0 px-3">
                  <svg
                    className={`h-8 w-8 transition-all duration-300 ${
                      isCompleted ? 'text-green-400' : 'text-gray-600'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      filter: isCompleted ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))' : 'none',
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
