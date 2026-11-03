import React from 'react';
import { normalizeMinimaxScore } from '../algorithms/decisionTrace.js';

export function DecisionNode({
  node,
  isSelected,
  isActiveStep,
  onClick,
}) {
  if (!node) return null;

  const {
    id,
    depth,
    board,
    playerTurn,
    isMax,
    score,
    isTerminal,
    winner,
    isDraw,
    isOptimal,
    move,
  } = node;

  const normalized = normalizeMinimaxScore(score);

  // Terminal state classification
  let terminalClass = '';
  if (isTerminal) {
    if (isDraw) terminalClass = 'node-terminal-draw';
    else if (normalized === 1) terminalClass = 'node-terminal-win';
    else terminalClass = 'node-terminal-loss';
  }

  const roleClass = isMax ? 'node-max' : 'node-min';
  const optimalClass = isOptimal ? 'node-optimal' : '';
  const activeClass = isActiveStep ? 'node-active-step' : '';

  return (
    <div
      className={`decision-node ${roleClass} ${optimalClass} ${activeClass} ${terminalClass}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node);
      }}
      title={`Depth ${depth} | ${isMax ? 'MAX' : 'MIN'} | Score: ${score !== null ? score : '?'}`}
    >
      {/* Node Header Row */}
      <div className="node-header-row">
        <span
          className="node-type-badge"
          style={{
            color: isMax ? 'var(--accent-blue-bright)' : 'var(--accent-cyan)',
          }}
        >
          {depth === 0 ? 'ROOT' : isMax ? 'MAX' : 'MIN'}
        </span>

        <span
          className={`node-score-badge ${
            normalized === 1
              ? 'score-plus'
              : normalized === -1
              ? 'score-minus'
              : 'score-zero'
          }`}
        >
          {score !== null && score !== undefined
            ? score >= 0
              ? `+${score}`
              : `${score}`
            : '?'}
        </span>
      </div>

      {/* Mini Board 3x3 */}
      <div className="mini-board">
        {board.map((cell, idx) => {
          const isLatestMove = move === idx;
          return (
            <div
              key={idx}
              className={`mini-cell ${
                cell === 'X'
                  ? 'mini-cell-x'
                  : cell === 'O'
                  ? 'mini-cell-o'
                  : ''
              } ${isLatestMove ? 'mini-cell-cand' : ''}`}
            >
              {cell}
            </div>
          );
        })}
      </div>

      {/* Terminal or Optimal Label */}
      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
        {isTerminal ? (
          <span style={{ color: winner ? '#34D399' : '#94A3B8' }}>
            {isDraw ? 'DRAW' : `${winner} WINS`}
          </span>
        ) : isOptimal ? (
          <span style={{ color: '#10B981', fontWeight: 700 }}>OPTIMAL</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>d={depth}</span>
        )}
      </div>
    </div>
  );
}

