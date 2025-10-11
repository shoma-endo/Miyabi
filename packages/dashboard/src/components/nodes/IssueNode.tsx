import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { IssueNodeData } from '../../types';

interface Props {
  data: IssueNodeData;
}

export const IssueNode = memo(({ data }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityGradient = (priority?: string): string => {
    if (!priority) return 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)';
    if (priority.includes('P0')) return 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)';
    if (priority.includes('P1')) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)';
    if (priority.includes('P2')) return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)';
    return 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)';
  };

  const getPriorityGlow = (priority?: string): string => {
    if (!priority) return '0 0 20px rgba(156, 163, 175, 0.3)';
    if (priority.includes('P0')) return '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.3)';
    if (priority.includes('P1')) return '0 0 30px rgba(245, 158, 11, 0.6), 0 0 60px rgba(245, 158, 11, 0.3)';
    if (priority.includes('P2')) return '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)';
    return '0 0 30px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3)';
  };

  const getPriorityEmoji = (priority?: string): string => {
    if (!priority) return '📋';
    if (priority.includes('P0')) return '🔥';
    if (priority.includes('P1')) return '⚡';
    if (priority.includes('P2')) return '💎';
    return '✨';
  };

  return (
    <div
      className="relative min-w-[320px] transition-all duration-500 float"
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
              {data.assignedAgents.length > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold uppercase tracking-wide border border-purple-200/50 flex items-center gap-1">
                  <span>🤖</span>
                  <span>{data.assignedAgents.length} Agent{data.assignedAgents.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
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
