import { useMemo } from 'react';
import type { GraphNode } from '../types';

interface StatsPanelProps {
  nodes: GraphNode[];
}

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bgColor: string;
}

export function StatsPanel({ nodes }: StatsPanelProps) {
  const stats = useMemo(() => {
    const issueNodes = nodes.filter((n) => n.type === 'issue');
    const agentNodes = nodes.filter((n) => n.type === 'agent');
    const stateNodes = nodes.filter((n) => n.type === 'state');

    // Count issues by state
    const issuesByState: Record<string, number> = {};
    issueNodes.forEach((node) => {
      const data = node.data as any;
      const state = data.state || 'unknown';
      issuesByState[state] = (issuesByState[state] || 0) + 1;
    });

    // Count agents by status
    const runningAgents = agentNodes.filter((n) => (n.data as any).status === 'running').length;
    const idleAgents = agentNodes.filter((n) => (n.data as any).status === 'idle').length;
    const errorAgents = agentNodes.filter((n) => (n.data as any).status === 'error').length;

    // Count by priority
    const p0Issues = issueNodes.filter((n) => (n.data as any).priority?.includes('P0')).length;
    const p1Issues = issueNodes.filter((n) => (n.data as any).priority?.includes('P1')).length;

    // Count completed issues
    const completedIssues = issueNodes.filter((n) => {
      const data = n.data as any;
      return data.state?.includes('done') || data.state?.includes('completed');
    }).length;

    const statCards: StatCard[] = [
      {
        label: 'Total Issues',
        value: issueNodes.length,
        icon: '📋',
        color: '#3B82F6',
        bgColor: '#EFF6FF',
      },
      {
        label: 'Running Agents',
        value: runningAgents,
        icon: '🤖',
        color: '#10B981',
        bgColor: '#D1FAE5',
      },
      {
        label: 'Completed',
        value: completedIssues,
        icon: '✅',
        color: '#22C55E',
        bgColor: '#DCFCE7',
      },
      {
        label: 'Critical (P0/P1)',
        value: p0Issues + p1Issues,
        icon: '🔥',
        color: '#EF4444',
        bgColor: '#FEE2E2',
      },
      {
        label: 'Idle Agents',
        value: idleAgents,
        icon: '💤',
        color: '#6B7280',
        bgColor: '#F3F4F6',
      },
      {
        label: 'Errors',
        value: errorAgents,
        icon: '⚠️',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
      },
    ];

    return {
      cards: statCards,
      issuesByState,
      totalAgents: agentNodes.length,
      totalStates: stateNodes.length,
    };
  }, [nodes]);

  return (
    <div className="glass-effect-dark border-b border-white/10 px-8 py-5 backdrop-blur-2xl">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.cards.map((card, index) => (
          <div
            key={card.label}
            className="group relative rounded-2xl p-[2px] transition-all duration-500 hover:scale-110 hover:rotate-1 shimmer"
            style={{
              background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div
                  className="text-3xl transition-transform duration-300 group-hover:scale-125"
                  style={{
                    filter: `drop-shadow(0 0 10px ${card.color}80)`,
                    animation: card.label === 'Running Agents' && typeof card.value === 'number' && card.value > 0 ? 'scalePulse 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {card.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-300">{card.label}</p>
                  <p
                    className="text-3xl font-black transition-all duration-300 group-hover:scale-110"
                    style={{
                      color: card.color,
                      textShadow: `0 0 20px ${card.color}60`,
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${card.color}20, transparent 70%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Progress bar for completion rate */}
      <div className="mt-6 rounded-2xl glass-effect p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
            <span className="text-xl">📈</span>
            <span>Completion Rate</span>
          </span>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            {typeof stats.cards[0].value === 'number' && stats.cards[0].value > 0
              ? `${Math.round((Number(stats.cards[2].value) / Number(stats.cards[0].value)) * 100)}%`
              : '0%'}
          </span>
        </div>
        <div className="relative h-4 w-full rounded-full bg-gray-800/80 overflow-hidden border border-gray-700/50 shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20" />
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transition-all duration-1000 ease-out shadow-lg"
            style={{
              width:
                typeof stats.cards[0].value === 'number' && stats.cards[0].value > 0
                  ? `${Math.round((Number(stats.cards[2].value) / Number(stats.cards[0].value)) * 100)}%`
                  : '0%',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.6)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
