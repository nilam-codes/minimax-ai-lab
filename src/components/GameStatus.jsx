import React from 'react';
import { RotateCcw, Play, CheckCircle2, AlertTriangle, User, Bot, Sparkles, Eye } from 'lucide-react';

export function GameStatus({
  humanPlayer,
  aiPlayer,
  currentTurn,
  firstPlayer,
  gameStatus,
  winner,
  onReset,
  onChangeHumanPlayer,
  onChangeFirstPlayer,
  onApplyAIMove,
  onOpenModal,
  autoApplyAIMove,
  setAutoApplyAIMove,
  isAITurn,
}) {
  const isHumanTurn = currentTurn === humanPlayer && gameStatus !== 'WON' && gameStatus !== 'DRAW';

  let statusText = '';
  let statusBadgeClass = 'badge-blue';
  let StatusIcon = Bot;

  if (gameStatus === 'WON') {
    if (winner === aiPlayer) {
      statusText = `YAY! MINI (${aiPlayer}) WON — That was a clever move! 🤖🎉`;
      statusBadgeClass = 'badge-pink';
      StatusIcon = Sparkles;
    } else {
      statusText = `YOU (${humanPlayer}) WON! Awesome play, human friend! 🌟👑`;
      statusBadgeClass = 'badge-mint';
      StatusIcon = User;
    }
  } else if (gameStatus === 'DRAW') {
    statusText = "GAME DRAW — We're equally smart! 🤝✨";
    statusBadgeClass = 'badge-lavender';
    StatusIcon = CheckCircle2;
  } else if (gameStatus === 'AI_THINKING') {
    statusText = `MINI (${aiPlayer}) is calculating optimal moves... 🧠💭`;
    statusBadgeClass = 'badge-peach';
    StatusIcon = Bot;
  } else if (gameStatus === 'AI_READY') {
    statusText = `MINI (${aiPlayer}) found optimal move! ${autoApplyAIMove ? 'Executing... ✨' : 'Ready to execute! 🎯'}`;
    statusBadgeClass = 'badge-mint';
    StatusIcon = Sparkles;
  } else if (isHumanTurn) {
    statusText = `YOUR TURN (${humanPlayer}) — Pick a cozy square! 🎮`;
    statusBadgeClass = 'badge-blue';
    StatusIcon = User;
  }

  return (
    <div className="game-card-wrapper">
      {/* Dynamic Match Status Banner */}
      <div className="game-status-banner">
        <div className="status-active-player">
          <StatusIcon size={16} />
          <span>{statusText}</span>
        </div>
        <div className={`badge ${statusBadgeClass}`}>
          {gameStatus === 'WON' || gameStatus === 'DRAW' ? 'TERMINAL' : isHumanTurn ? 'HUMAN' : 'AI'}
        </div>
      </div>

      {/* Manual Move Execution / Open Modal if AI is ready */}
      {gameStatus === 'AI_READY' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            className="btn-cmd glow-border"
            style={{ justifyContent: 'center' }}
            onClick={onOpenModal}
          >
            <Eye size={15} /> Mini's Brain ✨
          </button>
          <button
            className="btn-cmd btn-cmd-primary"
            style={{ justifyContent: 'center' }}
            onClick={onApplyAIMove}
          >
            <Play size={15} /> Execute Move 🚀
          </button>
        </div>
      )}

      {/* Game Match Settings & Controls */}
      <div className="game-controls-row">
        {/* Play as X or O */}
        <div className="config-group">
          <span style={{ color: 'var(--text-secondary)' }}>You Play As:</span>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${humanPlayer === 'X' ? 'active' : ''}`}
              onClick={() => onChangeHumanPlayer('X')}
              disabled={isAITurn || gameStatus === 'AI_THINKING'}
            >
              X (Blue)
            </button>
            <button
              className={`toggle-btn ${humanPlayer === 'O' ? 'active' : ''}`}
              onClick={() => onChangeHumanPlayer('O')}
              disabled={isAITurn || gameStatus === 'AI_THINKING'}
            >
              O (Cyan)
            </button>
          </div>
        </div>

        {/* First Turn Option */}
        <div className="config-group">
          <span style={{ color: 'var(--text-secondary)' }}>First Turn:</span>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${firstPlayer === 'HUMAN' ? 'active' : ''}`}
              onClick={() => onChangeFirstPlayer('HUMAN')}
              disabled={isAITurn || gameStatus === 'AI_THINKING'}
            >
              Human First
            </button>
            <button
              className={`toggle-btn ${firstPlayer === 'AI' ? 'active' : ''}`}
              onClick={() => onChangeFirstPlayer('AI')}
              disabled={isAITurn || gameStatus === 'AI_THINKING'}
            >
              AI First
            </button>
          </div>
        </div>

        {/* Auto Apply Move Toggle */}
        <div className="config-group">
          <span style={{ color: 'var(--text-secondary)' }}>Auto-Commit Move:</span>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${autoApplyAIMove ? 'active' : ''}`}
              onClick={() => setAutoApplyAIMove(true)}
              title="Automatically make move after thinking delay"
            >
              Auto
            </button>
            <button
              className={`toggle-btn ${!autoApplyAIMove ? 'active' : ''}`}
              onClick={() => setAutoApplyAIMove(false)}
              title="Pause and wait for presenter to click Execute Move"
            >
              Manual
            </button>
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <button
        className="btn-cmd"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={() => onReset()}
      >
        <RotateCcw size={14} />
        Restart Game
      </button>
    </div>
  );
}

