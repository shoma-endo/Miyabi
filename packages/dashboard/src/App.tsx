import { useState } from 'react';
import { FlowCanvas } from './components/FlowCanvas';
import { FlowCanvasMock } from './components/FlowCanvasMock';
import { ERView } from './components/ERView';

type ViewMode = 'flow' | 'flow-mock' | 'er';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('flow');

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Compact Header */}
      <header className="z-20 bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h1 className="text-lg font-bold text-white">Miyabi Dashboard</h1>
                <p className="text-xs text-white/80">Real-time Agent Visualization</p>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex gap-1 rounded-lg bg-white/10 p-1">
              <button
                onClick={() => setViewMode('flow')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === 'flow'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🔄 Agent Flow
              </button>
              <button
                onClick={() => setViewMode('flow-mock')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === 'flow-mock'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🎭 Flow (Mock)
              </button>
              <button
                onClick={() => setViewMode('er')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === 'er'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                📊 ER Diagram
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ShunsukeHayashi/Miyabi"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/30"
            >
              GitHub
            </a>
            <a
              href="https://shunsukehayashi.github.io/Miyabi/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/30"
            >
              Docs
            </a>
          </div>
        </div>
      </header>

      {/* Main content - Conditional rendering based on view mode */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'flow' && <FlowCanvas />}
        {viewMode === 'flow-mock' && <FlowCanvasMock />}
        {viewMode === 'er' && <ERView />}
      </div>
    </div>
  );
}

export default App;
