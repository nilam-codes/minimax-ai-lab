import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  Gauge,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  X,
  Target,
} from 'lucide-react';
import { formatPosition } from '../algorithms/gameLogic.js';
import { getScoreLabel } from '../algorithms/decisionTrace.js';

export function SimulationPanel({
  candidateMoves = [],
  bestMove = null,
  currentBoard = Array(9).fill(null),
  onSelectCandidate,
  selectedMoveIndex,
  simulationControls,
  aiPlayer,
}) {
  const [inspectedCandidate, setInspectedCandidate] = useState(null);
  const {
    currentStepIndex,
    totalSteps,
    isPlaying,
    speedMode,
    setSpeedMode,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    jumpToStep,
  } = simulationControls;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Simulation Playback Bar */}
      <div className="simulation-bar">
        <div className="simulation-playback-controls">
          {isPlaying ? (
            <button className="btn-cmd btn-cmd-primary" onClick={pause} title="Pause Simulation">
              <Pause size={15} /> Pause
            </button>
          ) : (
            <button className="btn-cmd btn-cmd-primary" onClick={play} title="Start / Resume Simulation">
              <Play size={15} /> {currentStepIndex > 0 ? 'Resume' : 'Start Simulation'}
            </button>
          )}

          <button
            className="btn-cmd btn-cmd-icon"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            title="Step Backward"
          >
            <SkipBack size={15} />
          </button>

          <button
            className="btn-cmd btn-cmd-icon"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Step Forward"
          >
            <SkipForward size={15} />
          </button>

          <button className="btn-cmd btn-cmd-icon" onClick={reset} title="Reset Simulation">
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="simulation-scrubber-wrapper">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            Trace Step:
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => jumpToStep(Number(e.target.value))}
            className="simulation-slider"
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--accent-blue-bright)',
              minWidth: '65px',
            }}
          >
            {totalSteps > 0 ? `${currentStepIndex + 1} / ${totalSteps}` : '0 / 0'}
          </span>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gauge size={14} style={{ color: 'var(--text-muted)' }} />
          <div className="toggle-group">
            {['slow', 'normal', 'fast'].map((s) => (
              <button
                key={s}
                className={`toggle-btn ${speedMode === s ? 'active' : ''}`}
                onClick={() => setSpeedMode(s)}
                style={{ textTransform: 'capitalize' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Board-by-Board Candidate Moves Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--text-primary)' }}>
            CANDIDATE MOVE EVALUATIONS ({candidateMoves.length} POSSIBLE BRANCHES)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click any candidate board to inspect its downstream Minimax evaluation
          </span>
        </div>

        {candidateMoves.length === 0 ? (
          <div className="cyber-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No candidate moves available. Game is at terminal state.
          </div>
        ) : (
          <div className="candidate-moves-grid">
            {candidateMoves.map((cand) => {
              const isSelected = selectedMoveIndex === cand.move;
              const isBest = cand.move === bestMove || cand.isOptimal;

              let outcomeBadgeClass = 'badge-blue';
              if (cand.outcome === 'WIN') outcomeBadgeClass = 'badge-optimal';
              else if (cand.outcome === 'LOSS') outcomeBadgeClass = 'badge-red';

              return (
                <div
                  key={cand.move}
                  className={`candidate-card ${isBest ? 'is-optimal' : ''} ${
                    isSelected ? 'glow-border' : ''
                  }`}
                  onClick={() => {
                    setInspectedCandidate(cand);
                    if (onSelectCandidate) onSelectCandidate(cand);
                  }}
                >
                  {/* Card Header */}
                  <div className="candidate-card-header">
                    <span className="candidate-pos-name">{cand.positionLabel}</span>
                    {isBest && (
                      <span className="badge badge-optimal">
                        <Sparkles size={11} /> OPTIMAL
                      </span>
                    )}
                  </div>

                  {/* Resulting Board Preview */}
                  <div className="mini-board" style={{ transform: 'scale(1.15)', margin: '6px 0' }}>
                    {cand.resultingBoard.map((c, idx) => {
                      const isPlayedThisTurn = idx === cand.move;
                      return (
                        <div
                          key={idx}
                          className={`mini-cell ${
                            c === 'X'
                              ? 'mini-cell-x'
                              : c === 'O'
                              ? 'mini-cell-o'
                              : ''
                          } ${isPlayedThisTurn ? 'mini-cell-cand' : ''}`}
                        >
                          {c}
                        </div>
                      );
                    })}
                  </div>

                  {/* Metadata Row */}
                  <div className="candidate-meta">
                    <div className="candidate-meta-row">
                      <span style={{ color: 'var(--text-muted)' }}>Minimax Score:</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            cand.normalizedScore === 1
                              ? '#34D399'
                              : cand.normalizedScore === -1
                              ? '#F87171'
                              : '#94A3B8',
                        }}
                      >
                        {cand.score >= 0 ? `+${cand.score}` : cand.score} (
                        {cand.normalizedScore >= 0 ? `+${cand.normalizedScore}` : cand.normalizedScore})
                      </span>
                    </div>

                    <div className="candidate-meta-row">
                      <span style={{ color: 'var(--text-muted)' }}>Outcome:</span>
                      <span className={`badge ${outcomeBadgeClass}`} style={{ fontSize: '10px' }}>
                        {cand.outcome}
                      </span>
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {cand.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Sequence Pop-up: CURRENT POSITION -> AI MOVE -> HUMAN RESPONSE -> FUTURE OUTCOME */}
        {inspectedCandidate && (
          <div className="inspect-drawer cyber-panel animate-fade-in" style={{ marginTop: '20px' }}>
            <div className="inspect-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={18} style={{ color: 'var(--accent-blue-bright)' }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: '#FFFFFF' }}>
                  LOOKAHEAD CHAIN: {inspectedCandidate.positionLabel}
                </h4>
                {inspectedCandidate.isOptimal && (
                  <span className="badge badge-optimal">
                    <Sparkles size={11} /> CLEAR BEST MOVE
                  </span>
                )}
              </div>
              <button
                className="btn-cmd btn-cmd-icon"
                onClick={() => setInspectedCandidate(null)}
                title="Close Lookahead"
              >
                <X size={15} />
              </button>
            </div>

            <div className="branch-flow-row" style={{ marginTop: '12px' }}>
              {/* 1. CURRENT POSITION */}
              <div className="flow-step-box">
                <span className="flow-step-title">1. CURRENT POSITION</span>
                <div className="mini-board-large">
                  {currentBoard.map((c, i) => (
                    <div key={i} className={`mini-cell-large ${c === 'X' ? 'mini-cell-x' : c === 'O' ? 'mini-cell-o' : ''}`}>
                      {c}
                    </div>
                  ))}
                </div>
                <span className="flow-step-sub">Human completed turn</span>
              </div>

              <ArrowRight size={22} className="flow-arrow" />

              {/* 2. AI MOVE */}
              <div className="flow-step-box flow-step-ai">
                <span className="flow-step-title">2. AI MOVE</span>
                <div className="mini-board-large">
                  {inspectedCandidate.resultingBoard.map((c, i) => (
                    <div
                      key={i}
                      className={`mini-cell-large ${c === 'X' ? 'mini-cell-x' : c === 'O' ? 'mini-cell-o' : ''} ${
                        i === inspectedCandidate.move ? 'mini-cell-candidate-highlight' : ''
                      }`}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <span className="flow-step-sub" style={{ color: 'var(--accent-blue-bright)' }}>
                  AI places {aiPlayer} at {inspectedCandidate.positionLabel}
                </span>
              </div>

              <ArrowRight size={22} className="flow-arrow" />

              {/* 3. HUMAN RESPONSE */}
              <div className="flow-step-box flow-step-human">
                <span className="flow-step-title">3. HUMAN RESPONSE</span>
                <div className="mini-board-large">
                  {(inspectedCandidate.bestOpponentResponse?.resultingBoard || inspectedCandidate.resultingBoard).map((c, i) => (
                    <div
                      key={i}
                      className={`mini-cell-large ${c === 'X' ? 'mini-cell-x' : c === 'O' ? 'mini-cell-o' : ''} ${
                        i === inspectedCandidate.bestOpponentResponse?.move ? 'mini-cell-opponent-highlight' : ''
                      }`}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <span className="flow-step-sub" style={{ color: '#F87171' }}>
                  {inspectedCandidate.bestOpponentResponse?.positionLabel
                    ? `Opponent responds at ${inspectedCandidate.bestOpponentResponse.positionLabel}`
                    : 'Terminal reached'}
                </span>
              </div>

              <ArrowRight size={22} className="flow-arrow" />

              {/* 4. FUTURE OUTCOME */}
              <div className="flow-step-box flow-step-outcome">
                <span className="flow-step-title">4. FUTURE OUTCOME</span>
                <div className="mini-board-large">
                  {(inspectedCandidate.futureOutcome?.board || inspectedCandidate.resultingBoard).map((c, i) => (
                    <div key={i} className={`mini-cell-large ${c === 'X' ? 'mini-cell-x' : c === 'O' ? 'mini-cell-o' : ''}`}>
                      {c}
                    </div>
                  ))}
                </div>
                <span
                  className={`badge ${
                    inspectedCandidate.normalizedScore === 1
                      ? 'badge-optimal'
                      : inspectedCandidate.normalizedScore === -1
                      ? 'badge-red'
                      : 'badge-blue'
                  }`}
                  style={{ fontSize: '10px', marginTop: '4px' }}
                >
                  {inspectedCandidate.outcome} ({inspectedCandidate.score >= 0 ? `+${inspectedCandidate.score}` : inspectedCandidate.score})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

