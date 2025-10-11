import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { AgentNodeData } from '../../types';
import { AGENT_CONFIGS } from '../../types';

interface Props {
  data: AgentNodeData;
}

export const AgentNode = memo(({ data }: Props) => {
  const config = AGENT_CONFIGS[data.agentId as keyof typeof AGENT_CONFIGS];
  const [showParams, setShowParams] = useState(true); // Default to open
  const [isHovered, setIsHovered] = useState(false);

  const getGlowColor = () => {
    switch (data.status) {
      case 'running':
        return '0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.5), 0 0 120px rgba(139, 92, 246, 0.3)';
      case 'completed':
        return '0 0 40px rgba(16, 185, 129, 0.8), 0 0 80px rgba(16, 185, 129, 0.5), 0 0 120px rgba(16, 185, 129, 0.3)';
      case 'error':
        return '0 0 40px rgba(239, 68, 68, 0.8), 0 0 80px rgba(239, 68, 68, 0.5), 0 0 120px rgba(239, 68, 68, 0.3)';
      default:
        return '0 0 20px rgba(107, 114, 128, 0.4), 0 0 40px rgba(107, 114, 128, 0.2)';
    }
  };

  const getBackgroundGradient = () => {
    switch (data.status) {
      case 'running':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
      case 'completed':
        return 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)';
      default:
        return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)';
    }
  };

  const getAnimatedBorderClass = () => {
    if (data.status === 'running') return 'scale-pulse';
    if (data.status === 'completed') return 'float';
    return '';
  };

  return (
    <div
      className={`relative w-[460px] transition-all duration-700 ${getAnimatedBorderClass()}`}
      style={{ filter: `drop-shadow(${getGlowColor()})` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !w-5 !h-5 !border-4 !border-white !shadow-2xl transition-all duration-300 hover:!scale-150"
      />

      {/* Main Card with Enhanced Gradient Border */}
      <div
        className="relative rounded-3xl p-[4px] transition-all duration-700 shimmer"
        style={{
          background: getBackgroundGradient(),
          transform: isHovered
            ? 'scale(1.08) translateY(-8px)'
            : data.status === 'running'
            ? 'scale(1.05)'
            : 'scale(1)',
          backgroundSize: '200% 200%',
          animation: data.status === 'running' ? 'gradientShift 3s ease infinite' : 'none',
        }}
      >
        {/* Glassmorphism effect with enhanced blur */}
        <div className="relative rounded-3xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl p-7 shadow-2xl">
          {/* Animated background particles for running state */}
          {data.status === 'running' && (
            <>
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-pulse" />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10"
                  style={{
                    animation: 'gradientShift 4s ease infinite',
                  }}
                />
              </div>
              {/* Particle dots */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
              <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="absolute top-6 right-12 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
            </>
          )}

          {/* Content */}
          <div className="relative z-10">
            {/* Header with Icon and Status */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                {/* Enhanced Emoji Icon with glow */}
                <div
                  className="text-6xl relative"
                  style={{
                    filter: data.status === 'running'
                      ? 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))'
                      : data.status === 'completed'
                      ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))'
                      : 'none',
                    animation: data.status === 'running' ? 'scalePulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {config?.emoji || '🤖'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-white tracking-wide">
                    {data.name}
                  </h3>
                  <p className="text-sm text-gray-300 font-medium mt-1">{config?.description}</p>
                </div>
              </div>
            </div>

            {/* Status Badge with Enhanced Animation */}
            <div className="flex items-center gap-3 mb-4">
              {data.status === 'running' && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-4 w-4 rounded-full bg-purple-500 animate-ping" />
                    <div className="absolute h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
                    <div className="relative h-2.5 w-2.5 rounded-full bg-white" />
                  </div>
                  <span className="text-sm font-bold gradient-text">🔥 RUNNING</span>
                </div>
              )}
              {data.status === 'idle' && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700/40 border border-gray-600/30">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                  <span className="text-sm font-semibold text-gray-300">💤 IDLE</span>
                </div>
              )}
              {data.status === 'completed' && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-sm">
                  <div className="text-xl">✨</div>
                  <span className="text-sm font-bold gradient-text-success">COMPLETED</span>
                </div>
              )}
              {data.status === 'error' && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 backdrop-blur-sm">
                  <div className="text-xl">⚠️</div>
                  <span className="text-sm font-bold gradient-text-error">ERROR</span>
                </div>
              )}
            </div>

            {/* Current Issue */}
            {data.currentIssue && (
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 px-4 py-3 backdrop-blur-sm">
                <div className="text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wider">📌 Current Task</div>
                <div className="text-base font-mono font-bold text-white">Issue #{data.currentIssue}</div>
              </div>
            )}

            {/* Progress Bar with Enhanced Design */}
            {data.status === 'running' && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">⚡ Progress</span>
                  <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {data.progress}%
                  </span>
                </div>
                <div className="relative h-4 rounded-full bg-gray-800/80 overflow-hidden border border-gray-700/50 shadow-inner">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
                  {/* Progress fill */}
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-1000 ease-out shadow-lg"
                    style={{
                      width: `${data.progress}%`,
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(236, 72, 153, 0.6)',
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer" />
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
                  </div>
                  {/* Progress marker */}
                  {data.progress > 5 && (
                    <div
                      className="absolute top-0 h-full w-1 bg-white/80 shadow-lg transition-all duration-1000 ease-out"
                      style={{ left: `${data.progress}%`, filter: 'drop-shadow(0 0 4px white)' }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Parameters */}
            {data.parameters && Object.keys(data.parameters).length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowParams(!showParams)}
                  className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-400/20 hover:border-purple-400/40 px-4 py-3 transition-all duration-300 group"
                >
                  <span className="text-sm font-bold text-purple-200 uppercase tracking-wider flex items-center gap-2">
                    <span className={`transition-transform duration-300 ${showParams ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <span>⚙️ Parameters</span>
                  </span>
                  <span className="text-xs font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                    {Object.keys(data.parameters).length}
                  </span>
                </button>

                {showParams && (
                  <div className="mt-3 space-y-3 max-h-56 overflow-y-auto rounded-xl bg-black/40 p-4 border border-purple-500/20 backdrop-blur-sm">
                    {Object.entries(data.parameters).map(([key, value]) => (
                      <div key={key} className="relative border-l-4 border-gradient-to-b from-purple-500 to-pink-500 pl-4 py-2 bg-gradient-to-r from-purple-500/5 to-transparent rounded-r-lg">
                        <div className="text-xs font-mono font-black text-purple-300 uppercase tracking-wider mb-1">
                          {key}
                        </div>
                        <div className="text-sm font-mono text-gray-200 break-words leading-relaxed">
                          {typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !w-5 !h-5 !border-4 !border-white !shadow-2xl transition-all duration-300 hover:!scale-150"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
