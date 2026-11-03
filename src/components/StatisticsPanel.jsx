import React from 'react';
import {
  BarChart3,
  Layers,
  Award,
  Clock,
  GitBranch,
  Target,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { formatPosition } from '../algorithms/gameLogic.js';
import { getScoreLabel } from '../algorithms/decisionTrace.js';

export function StatisticsPanel({ aiAnalysis, aiPlayer }) {
  const stats = aiAnalysis?.stats || {
    totalNodesExplored: 0,
    terminalStates: { aiWins: 0, humanWins: 0, draws: 0 },
    maxDepth: 0,
    branchingFactor: 0,
    executionTimeMs: 0,
  };

  const candidateMoves = aiAnalysis?.candidateMoves || [];
  const bestMove = aiAnalysis?.bestMove;
  const bestScore = aiAnalysis?.bestScore;

  const totalTerminals =
    stats.terminalStates.aiWins +
    stats.terminalStates.humanWins +
    stats.terminalStates.draws;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#FFFFFF' }}>
            MATHEMATICAL SIMULATION METRICS
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time telemetry recorded directly from Minimax recursive execution
          </p>
        </div>
        <div className="badge badge-online">
          <Clock size={12} /> COMPUTED IN {stats.executionTimeMs} ms
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Total Nodes Explored */}
        <div className="telemetry-item">
          <span className="telemetry-label">Total Nodes Explored</span>
          <span className="telemetry-value telemetry-value-cyan">
            {stats.totalNodesExplored.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Game states visited in recursive tree
          </span>
        </div>

        {/* Max Depth */}
        <div className="telemetry-item">
          <span className="telemetry-label">Maximum Search Depth</span>
          <span className="telemetry-value telemetry-value-blue">
            {stats.maxDepth} Layers
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Lookahead ply reaching terminal states
          </span>
        </div>

        {/* Branching Factor */}
        <div className="telemetry-item">
          <span className="telemetry-label">Root Branching Factor</span>
          <span className="telemetry-value telemetry-value-green">
            {candidateMoves.length} Branches
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Available legal moves at current ply
          </span>
        </div>

        {/* Chosen Move */}
        <div className="telemetry-item">
          <span className="telemetry-label">Optimal Move Decision</span>
          <span className="telemetry-value telemetry-value-green">
            {bestMove !== null ? formatPosition(bestMove) : 'N/A'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Score: {bestScore !== null ? (bestScore >= 0 ? `+${bestScore}` : bestScore) : '--'} ({getScoreLabel(bestScore)})
          </span>
        </div>
      </div>

      {/* Terminal State Breakdown */}
      <div className="cyber-panel" style={{ padding: '18px 20px' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: '#FFFFFF', marginBottom: '14px' }}>
          TERMINAL OUTCOME DISTRIBUTION IN SEARCH SPACE
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* AI Wins */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#34D399', textTransform: 'uppercase' }}>
              AI Guaranteed Wins (+1)
            </span>
            <span style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#34D399' }}>
              {stats.terminalStates.aiWins.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Terminal states where AI ({aiPlayer}) wins
            </span>
          </div>

          {/* Draws */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Forced Draws (0)
            </span>
            <span style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {stats.terminalStates.draws.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Terminal states where board is full
            </span>
          </div>

          {/* Human Wins */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#F87171', textTransform: 'uppercase' }}>
              Theoretical Human Wins (-1)
            </span>
            <span style={{ fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#F87171' }}>
              {stats.terminalStates.humanWins.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Avoided by AI via Minimax pruning
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

