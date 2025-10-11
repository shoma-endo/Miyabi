import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { IssueNodeData } from '../../types';

interface Props {
  data: IssueNodeData;
  // NEW: Add agent status data
  agentStatuses?: Record<string, { status: string; progress?: number }>;
}

export const IssueNode = memo(({ data, agentStatuses = {} }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityGradient = (priority?: string): string => {
    if (!priority) return 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)';
    if (priority.includes('P0')) return 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)';
    if (priority.includes('P1')) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)';
    if (priority.includes('P2')) return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)';
    return 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)';
  };

  const getPriorityGlow = (priority?: string): string => {
    // Reduced intensity for glow effects
    if (!priority) return '0 0 10px rgba(156, 163, 175, 0.2)';
    if (priority.includes('P0')) return '0 0 15px rgba(239, 68, 68, 0.3)';
    if (priority.includes('P1')) return '0 0 15px rgba(245, 158, 11, 0.3)';
    if (priority.includes('P2')) return '0 0 15px rgba(59, 130, 246, 0.3)';
    return '0 0 15px rgba(16, 185, 129, 0.3)';
  };

  const getPriorityEmoji = (priority?: string): string => {
    if (!priority) return '📋';
    if (priority.includes('P0')) return '🔥';
    if (priority.includes('P1')) return '⚡';
    if (priority.includes('P2')) return '💎';
    return '✨';
  };

  // NEW: Get agent icon and color
  const getAgentDisplay = (agentId: string): { icon: string; name: string; color: string } => {
    const displays: Record<string, { icon: string; name: string; color: string }> = {
      coordinator: { icon: '🎯', name: 'Coordinator', color: '#8B5CF6' },
      codegen: { icon: '💻', name: 'CodeGen', color: '#3B82F6' },
      review: { icon: '👀', name: 'Review', color: '#10B981' },
      pr: { icon: '🔀', name: 'PR', color: '#F59E0B' },
      deployment: { icon: '🚀', name: 'Deploy', color: '#EC4899' },
      test: { icon: '🧪', name: 'Test', color: '#6366F1' },
    };
    return displays[agentId] || { icon: '🤖', name: agentId, color: '#6B7280' };
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'running': return '#10B981';
      case 'completed': return '#22C55E';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div
      className="relative min-w-[360px] transition-all duration-500 float"
      style={{ filter: `drop-shadow(${getPriorityGlow(data.priority)})` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gradient-to-r !from-blue-500 !to-cyan-500 !w-4 !h-4 !border-4 !border-white !shadow-xl transition-all duration-300 hover:!scale-125"
      />

      {/* Main Card */}
      <div
        className="relative rounded-2xl p-[3px] transition-all duration-500 shimmer"
        style={{
          background: getPriorityGradient(data.priority),
          transform: isHovered ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
        }}
      >
        <div className="relative rounded-2xl bg-gradient-to-br from-white/95 via-gray-50/95 to-white/95 backdrop-blur-xl p-5 shadow-xl">
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className="text-4xl transition-transform duration-300"
                style={{
                  animation: isHovered ? 'scalePulse 1s ease-in-out infinite' : 'none',
                }}
              >
                {getPriorityEmoji(data.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
                    #{data.number}
                  </h3>
                  {data.priority && (
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider glass-effect-dark text-white">
                      {data.priority.split(':')[1] || data.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed line-clamp-2">
                  {data.title}
                </p>
              </div>
            </div>

            {/* Tags & Status */}
            <div className="flex flex-wrap gap-2 mt-4">
              {data.state && (
                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-200/50">
                  {data.state.includes(':') ? data.state.split(':')[1] : data.state}
                </span>
              )}
            </div>

            {/* NEW: Agent Badges - Show working agents prominently */}
            {data.assignedAgents && data.assignedAgents.length > 0 && (
              <div className="mt-4 space-y-2">
                {data.assignedAgents.map((agentId) => {
                  const display = getAgentDisplay(agentId);
                  const agentStatus = agentStatuses[agentId] || { status: 'idle' };
                  const isWorking = agentStatus.status === 'running';
                  const progress = agentStatus.progress || 0;

                  return (
                    <div
                      key={agentId}
                      className="relative flex items-center gap-2 p-2 rounded-lg transition-all duration-300"
                      style={{
                        background: isWorking
                          ? `linear-gradient(90deg, ${display.color}15 0%, ${display.color}08 100%)`
                          : 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 100%)',
                        border: isWorking ? `2px solid ${display.color}` : '2px solid #d1d5db',
                        boxShadow: isWorking ? `0 0 8px ${display.color}20` : 'none',
                      }}
                    >
                      {/* Agent Icon */}
                      <div
                        className="flex-shrink-0 text-2xl"
                        style={{
                          filter: isWorking ? `drop-shadow(0 0 4px ${display.color}80)` : 'none',
                        }}
                      >
                        {display.icon}
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-gray-700 truncate">
                            {display.name}
                          </span>
                          {isWorking && (
                            <span className="text-xs font-black" style={{ color: display.color }}>
                              {progress}%
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {isWorking && (
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                background: `linear-gradient(90deg, ${display.color}, ${display.color}dd)`,
                                boxShadow: `0 0 4px ${display.color}40`,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Status Indicator */}
                      <div
                        className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(agentStatus.status),
                          boxShadow: isWorking ? `0 0 4px ${getStatusColor(agentStatus.status)}60` : 'none',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gradient-to-r !from-blue-500 !to-cyan-500 !w-4 !h-4 !border-4 !border-white !shadow-xl transition-all duration-300 hover:!scale-125"
      />
    </div>
  );
});

IssueNode.displayName = 'IssueNode';
