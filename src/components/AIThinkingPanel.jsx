import React from 'react';
import { Cpu, Zap, Activity, GitBranch, Target, CheckCircle2, Brain } from 'lucide-react';
import { formatPosition } from '../algorithms/gameLogic.js';

export function AIThinkingPanel({
  aiAnalysis,
  gameStatus,
  aiPlayer,
  currentTraceStep,
  simulationStats,
  onOpenModal,
}) {
  const isThinking = gameStatus === 'AI_THINKING';
  const isReady = gameStatus === 'AI_READY';
  const stats = {
    totalNodesExplored: aiAnalysis?.stats?.totalNodesExplored || simulationStats?.totalNodesExplored || 0,
    branchingFactor: aiAnalysis?.stats?.branchingFactor || simulationStats?.branchingFactor || 0,
    terminalStates: aiAnalysis?.stats?.terminalStates || simulationStats?.terminalStates || { aiWins: 0, humanWins: 0, draws: 0 },
    executionTimeMs: aiAnalysis?.stats?.executionTimeMs || simulationStats?.executionTimeMs || 0,
  };

  const bestMove = aiAnalysis?.bestMove ?? null;
  const bestScore = aiAnalysis?.bestScore ?? null;
  const normalizedScore = aiAnalysis?.bestNormalizedScore ?? null;

  // Score display formatting
  let scoreBadge = '0 (Draw 🤝)';
  let scoreColorClass = 'telemetry-value-cyan';
  if (normalizedScore === 1) {
    scoreBadge = '+1 (AI Win 🌟)';
    scoreColorClass = 'telemetry-value-green';
  } else if (normalizedScore === -1) {
    scoreBadge = '-1 (Loss 🥺)';
    scoreColorClass = 'text-red-400';
  }

  return (
    <div className="cyber-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Cpu size={18} style={{ color: 'var(--accent-blue-bright)' }} />
          <span>AI THINKING ENGINE — MINIMAX CORE</span>
        </div>
        <div className="badge badge-pink">
          AGENT: MINI ({aiPlayer} • MAXIMIZER 🌟)
        </div>
      </div>

      <div className="panel-body ai-thinking-card" style={{ flex: 1 }}>
        {/* Real-time Status Card */}
        <div className="ai-status-indicator">
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Engine State
            </div>
            <div className="ai-status-text" style={{ fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isThinking ? (
                <>
                  <span>Thinking of my next move...</span>
                  <span className="cute-thinking-dots">
                    <span className="cute-dot"></span>
                    <span className="cute-dot"></span>
                    <span className="cute-dot"></span>
                  </span>
                </>
              ) : isReady ? (
                <span>Found my perfect move! 🎯</span>
              ) : (
                <span>Waiting for your move! 🎮</span>
              )}
            </div>
          </div>
          <div className="badge badge-online">
            <span className="pulse-dot"></span>
            {isThinking ? 'COMPUTING' : isReady ? 'READY' : 'STANDBY'}
          </div>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="engine-telemetry-grid">
          <div className="telemetry-item">
            <span className="telemetry-label">Candidate Moves</span>
            <span className="telemetry-value telemetry-value-blue">
              <GitBranch size={16} />
              {aiAnalysis?.candidateMoves?.length || stats.branchingFactor || 0}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Nodes Explored</span>
            <span className="telemetry-value telemetry-value-cyan">
              <Activity size={16} />
              {stats.totalNodesExplored?.toLocaleString() || 0}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Evaluated Score</span>
            <span className={`telemetry-value ${scoreColorClass}`}>
              <Target size={16} />
              {bestScore !== null && bestScore !== undefined ? (bestScore >= 0 ? `+${bestScore}` : `${bestScore}`) : '--'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Norm: {scoreBadge}
            </span>
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Selected Move</span>
            <span className="telemetry-value telemetry-value-green">
              <CheckCircle2 size={16} />
              {bestMove !== null && bestMove !== undefined ? formatPosition(bestMove) : 'None'}
            </span>
          </div>
        </div>

        {/* Live Step Explanation Bar (Synced with trace step) */}
        {currentTraceStep && (
          <div
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-lavender">
                TRACE STEP #{currentTraceStep.stepIndex + 1}: {currentTraceStep.type}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                Depth: {currentTraceStep.depth} | Role: {currentTraceStep.isMax ? 'MAX (MINI • AIMS FOR +1 🌟)' : 'MIN (YOU • AIMS FOR -1 🎯)'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, marginTop: '4px' }}>
              {currentTraceStep.explanation}
            </p>
          </div>
        )}

        {/* Algorithm Computation Progress / Activity Bar */}
        <div className="thinking-progress-container" style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            <span>DECISION PIPELINE</span>
            <span>{stats.executionTimeMs} ms</span>
          </div>
          <div className="thinking-progress-bar">
            <div
              className="thinking-progress-fill"
              style={{
                width: isThinking ? '65%' : isReady ? '100%' : '15%',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
        {/* Open Analysis Modal Action */}
        {gameStatus === 'AI_READY' && onOpenModal && (
          <button
            className="btn-cmd btn-cmd-primary glow-border"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
            onClick={onOpenModal}
          >
            <Brain size={16} /> Open 4-Step Decision Guide ✨
          </button>
        )}
      </div>
    </div>
  );
}

