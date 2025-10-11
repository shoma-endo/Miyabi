/**
 * Explanation Panel
 *
 * Displays real-time explanations of what's happening in the system
 * in plain Japanese, making the autonomous workflow understandable to everyone.
 */

import { useEffect, useState } from 'react';

export interface ExplanationEntry {
  id: string;
  timestamp: string;
  title: string;
  explanation: string;
  details?: string[];
  type: 'info' | 'success' | 'warning' | 'error' | 'thinking';
  icon: string;
}

export interface ExplanationPanelProps {
  entries: ExplanationEntry[];
}

export function ExplanationPanel({ entries }: ExplanationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const currentEntry = entries[0]; // Most recent entry

  // Auto-scroll to top when new entry arrives
  useEffect(() => {
    const panel = document.getElementById('explanation-panel-content');
    if (panel) {
      panel.scrollTop = 0;
    }
  }, [entries]);

  const getTypeStyle = (type: ExplanationEntry['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'thinking':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTypeIcon = (type: ExplanationEntry['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'thinking':
        return '💭';
      default:
        return 'ℹ️';
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed right-4 top-20 z-20">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-xl transition-all hover:shadow-2xl"
        >
          <span className="text-xl">💡</span>
          <span className="text-sm font-semibold text-gray-700">解説を表示</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-20 z-20 flex w-96 flex-col rounded-xl bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-500 p-4 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-sm font-bold text-white">リアルタイム解説</h3>
            <p className="text-xs text-white/80">今何が起こっているか</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="rounded-lg p-1 text-white transition-colors hover:bg-white/20"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Current Explanation */}
      {currentEntry && (
        <div className={`border-b-2 border-l-4 p-4 ${getTypeStyle(currentEntry.type)}`}>
          <div className="mb-2 flex items-start gap-2">
            <span className="text-2xl">{currentEntry.icon || getTypeIcon(currentEntry.type)}</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold">{currentEntry.title}</h4>
              <p className="mt-1 text-xs leading-relaxed">{currentEntry.explanation}</p>
            </div>
          </div>

          {/* Details */}
          {currentEntry.details && currentEntry.details.length > 0 && (
            <div className="mt-3 space-y-1 border-t pt-2 opacity-80" style={{ borderColor: 'currentColor' }}>
              {currentEntry.details.map((detail, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <span className="text-[10px]">▸</span>
                  <span className="flex-1">{detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-2 text-right text-[10px] opacity-60">
            {new Date(currentEntry.timestamp).toLocaleTimeString('ja-JP')}
          </div>
        </div>
      )}

      {/* History */}
      <div
        id="explanation-panel-content"
        className="max-h-96 overflow-y-auto p-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        <h4 className="mb-3 text-xs font-semibold text-gray-500">履歴 / History</h4>
        <div className="space-y-3">
          {entries.slice(1, 10).map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:shadow-md"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg">{entry.icon || getTypeIcon(entry.type)}</span>
                <span className="flex-1 text-xs font-semibold text-gray-700">{entry.title}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(entry.timestamp).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-600">{entry.explanation}</p>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
            <span className="mb-2 block text-3xl">🤖</span>
            <p className="text-xs text-gray-500">
              タスクを待機中...
              <br />
              Issueが追加されると自動的に処理が開始されます
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
