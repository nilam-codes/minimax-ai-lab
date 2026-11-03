import React from 'react';
import { GameBoard } from './GameBoard.jsx';
import { MiniRobot } from './Robot/MiniRobot.jsx';
import { RobotDialogue } from './Robot/RobotDialogue.jsx';
import { formatPosition } from '../algorithms/gameLogic.js';
import {
  RotateCcw,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Trophy,
  Brain,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  UserCheck,
  Layers,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import '../styles/foregroundWindow.css';

export function ForegroundGameWindow({
  isOpen = true,
  onToggleMinimize,
  playerName = 'Player',
  onChangePlayerName,
  board,
  onCellClick,
  disabled,
  winningLine,
  aiPreviewMove,
  humanPlayer,
  aiPlayer,
  firstPlayer,
  currentTurn,
  gameStatus,
  winner,
  scores = { human: 0, ai: 0, draws: 0 },
  onReset,
  onChangeHumanPlayer,
  onChangeFirstPlayer,
  onOpenMinimaxModal,
  // MINI Mascot State
  robotExpression = 'idle',
  robotDialogue = "Heyyy! Ready to challenge me? 🤖",
  voiceEnabled = true,
  onToggleVoice,
  sfxEnabled = true,
  onToggleSfx,
  onRobotClick,
  isAIThinking = false,
  // Physical move & drawing animation props
  aiTargetCell = null,
  drawingCell = null,
  drawingSymbol = null,
  isReachingCell = false,
  robotLookDirection = 'center',
  // Two AI Play Modes & Forced Move
  aiPlayMode = 'AUTO',
  onChangeAiPlayMode,
  isForcedSelecting = false,
  pendingForcedCell = null,
  lastMoveDetails = null,
  onSelectForcedCell,
  onConfirmForcedMove,
  onCancelForcedMove,
  aiAnalysis = null,
}) {
  if (!isOpen) return null;

  const isHumanTurn = currentTurn === humanPlayer && gameStatus !== 'WON' && gameStatus !== 'DRAW';

  // Compute movement class for physical leaning / reaching towards board cell
  let dockMovementClass = '';
  if (isReachingCell && aiTargetCell !== null) {
    dockMovementClass = `mini-reach-cell-${aiTargetCell}`;
  } else if (isAIThinking) {
    dockMovementClass = 'mini-leaning-board';
  }

  // Dynamic Status Banner message & badge
  let statusText = '';
  let statusBadgeClass = 'badge-blue';
  let StatusIcon = User;

  if (gameStatus === 'WON') {
    if (winner === aiPlayer) {
      statusText = `YAY! MINI (${aiPlayer}) WON — That was a clever move! 🤖🎉`;
      statusBadgeClass = 'badge-pink';
      StatusIcon = Trophy;
    } else {
      statusText = `YOU (${playerName}) WON! Awesome play! 🌟👑`;
      statusBadgeClass = 'badge-mint';
      StatusIcon = Trophy;
    }
  } else if (gameStatus === 'DRAW') {
    statusText = `GAME DRAW — Look at us, ${playerName}! Equally clever! 🤝`;
    statusBadgeClass = 'badge-lavender';
    StatusIcon = CheckCircle2;
  } else if (isForcedSelecting) {
    statusText = `DEMO: Click any open square on the board to force MINI's move! ⚡`;
    statusBadgeClass = 'badge-peach';
    StatusIcon = Zap;
  } else if (isAIThinking || gameStatus === 'AI_THINKING') {
    statusText = `MINI is calculating optimal Minimax moves... 🧠💭`;
    statusBadgeClass = 'badge-peach';
    StatusIcon = Bot;
  } else if (gameStatus === 'AI_READY') {
    statusText = `MINI found optimal move! Placing symbol... ✨`;
    statusBadgeClass = 'badge-mint';
    StatusIcon = Sparkles;
  } else if (isHumanTurn) {
    statusText = `YOUR TURN (${playerName} • ${humanPlayer}) — Pick a cozy square! 🎮`;
    statusBadgeClass = 'badge-blue';
    StatusIcon = User;
  }

  return (
    <div className="foreground-backdrop" aria-modal="true" role="dialog">
      <div className="foreground-window-container animate-pop-in">
        
        {/* ===================================================================
            1. WINDOW TITLEBAR
            =================================================================== */}
        <div className="window-titlebar">
          <div className="window-title-left">
            <div className="window-traffic-dots">
              <span className="traffic-dot dot-pink"></span>
              <span className="traffic-dot dot-yellow"></span>
              <span className="traffic-dot dot-mint"></span>
            </div>
            <div className="window-title-heading">
              <span className="arcade-title-pill">MINI'S ARCADE ARENA</span>
              <span className="window-player-tag">
                <User size={13} /> {playerName}
              </span>
            </div>
          </div>

          <div className="window-title-actions">
            {/* Audio Toggles */}
            <div className="titlebar-audio-controls">
              <button
                type="button"
                className="btn-titlebar-icon"
                onClick={onToggleSfx}
                title={sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
                aria-label="Toggle Sound Effects"
              >
                {sfxEnabled ? (
                  <Bell size={14} style={{ color: 'var(--cute-sky)' }} />
                ) : (
                  <BellOff size={14} style={{ color: 'var(--text-muted)' }} />
                )}
              </button>

              <button
                type="button"
                className="btn-titlebar-icon"
                onClick={onToggleVoice}
                title={voiceEnabled ? 'Mute Robot Voice' : 'Enable Robot Voice'}
                aria-label="Toggle Robot Voice"
              >
                {voiceEnabled ? (
                  <Volume2 size={14} style={{ color: 'var(--cute-pink)' }} />
                ) : (
                  <VolumeX size={14} style={{ color: 'var(--text-muted)' }} />
                )}
              </button>
            </div>

            {/* Change Player Name Button */}
            {onChangePlayerName && (
              <button
                type="button"
                className="btn-titlebar-text"
                onClick={onChangePlayerName}
                title="Change Player Name"
              >
                <UserCheck size={13} />
                <span>Change Name</span>
              </button>
            )}

            {/* Minimize / View Background Lab Dashboard */}
            {onToggleMinimize && (
              <button
                type="button"
                className="btn-titlebar-text btn-view-lab"
                onClick={onToggleMinimize}
                title="View Full Minimax Decision Tree & Background Lab"
              >
                <Layers size={13} />
                <span>View Lab Behind</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================
            2. ARCADE SCOREBOARD BAR
            =================================================================== */}
        <div className="arcade-scoreboard-bar">
          <div className="score-pill score-human">
            <span className="score-label">{playerName.toUpperCase()} (YOU)</span>
            <span className="score-number">{scores.human}</span>
          </div>

          <div className="score-pill score-draws">
            <span className="score-label">DRAWS</span>
            <span className="score-number">{scores.draws}</span>
          </div>

          <div className="score-pill score-ai">
            <span className="score-label">MINI (AI)</span>
            <span className="score-number">{scores.ai}</span>
          </div>
        </div>

        {/* ===================================================================
            3. DYNAMIC STATUS BANNER
            =================================================================== */}
        <div className="arcade-status-banner">
          <div className="status-banner-left">
            <StatusIcon size={18} className="status-main-icon" />
            <span className="status-banner-text">{statusText}</span>
          </div>
          <div className={`badge ${statusBadgeClass}`}>
            {gameStatus === 'WON' || gameStatus === 'DRAW'
              ? 'GAME OVER'
              : isHumanTurn
              ? 'YOUR TURN'
              : 'MINI THINKING'}
          </div>
        </div>

        {/* ===================================================================
            4. MAIN BOARD DISPLAY (Centered & High-Contrast)
            =================================================================== */}
        <div className="arcade-board-wrapper">
          <GameBoard
            board={board}
            onCellClick={onCellClick}
            disabled={disabled}
            winningLine={winningLine}
            aiPreviewMove={aiPreviewMove}
            humanPlayer={humanPlayer}
            aiPlayer={aiPlayer}
            drawingCell={drawingCell}
            drawingSymbol={drawingSymbol}
            aiTargetCell={aiTargetCell}
            isForcedSelecting={isForcedSelecting}
            pendingForcedCell={pendingForcedCell}
            onSelectForcedCell={onSelectForcedCell}
          />

          {/* Mode Indicator Banner after AI plays */}
          {lastMoveDetails && (
            <div
              className={`last-move-mode-banner ${
                lastMoveDetails.mode === 'FORCED' ? 'banner-forced' : 'banner-auto'
              } animate-fade-in`}
            >
              <div className="last-move-header">
                <span className="last-move-tag">
                  {lastMoveDetails.mode === 'FORCED' ? (
                    <>
                      <Zap size={13} /> FORCED DEMO MOVE
                    </>
                  ) : (
                    <>
                      <Bot size={13} /> OPTIMAL MINIMAX MOVE
                    </>
                  )}
                </span>
                <span className="last-move-square">
                  Square #{lastMoveDetails.cell + 1} ({formatPosition(lastMoveDetails.cell)})
                </span>
              </div>

              <div className="last-move-message">
                {lastMoveDetails.mode === 'FORCED' ? (
                  <>
                    <span>You chose this move for me! Let's see what happens.</span>
                    <span
                      className={`eval-verdict-pill ${
                        lastMoveDetails.isOptimal ? 'verdict-optimal' : 'verdict-suboptimal'
                      }`}
                    >
                      {lastMoveDetails.isOptimal
                        ? "✨ Matches MINI's recommended optimal move!"
                        : '⚠️ This is different from my recommended move.'}
                    </span>
                  </>
                ) : (
                  <span>MINI selected this move because it is the best possible choice.</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            5. SETTINGS & ACTION CONTROLS ROW
            =================================================================== */}
        <div className="arcade-controls-container">
          <div className="arcade-config-bar">
            {/* AI Play Mode Selector: Option A vs Option B */}
            <div className="arcade-config-item">
              <span className="config-label">AI Decision Mode:</span>
              <div className="arcade-toggle-group">
                <button
                  type="button"
                  className={`arcade-toggle-btn ${aiPlayMode === 'AUTO' ? 'active' : ''}`}
                  onClick={() => onChangeAiPlayMode && onChangeAiPlayMode('AUTO')}
                  disabled={isAIThinking}
                  title="Let Minimax algorithm automatically pick the optimal move"
                >
                  <Bot size={13} style={{ marginRight: '4px' }} />
                  Let MINI Decide
                </button>
                <button
                  type="button"
                  className={`arcade-toggle-btn ${aiPlayMode === 'FORCE' ? 'active-force' : ''}`}
                  onClick={() => onChangeAiPlayMode && onChangeAiPlayMode('FORCE')}
                  disabled={isAIThinking}
                  title="Demonstration Mode: Manually choose any open square to force MINI's move"
                >
                  <Zap size={13} style={{ marginRight: '4px' }} />
                  Force AI Move ⚡
                </button>
              </div>
            </div>

            {/* Play as X or O */}
            <div className="arcade-config-item">
              <span className="config-label">You Play As:</span>
              <div className="arcade-toggle-group">
                <button
                  type="button"
                  className={`arcade-toggle-btn ${humanPlayer === 'X' ? 'active' : ''}`}
                  onClick={() => onChangeHumanPlayer('X')}
                  disabled={isAIThinking}
                >
                  X (Blue)
                </button>
                <button
                  type="button"
                  className={`arcade-toggle-btn ${humanPlayer === 'O' ? 'active' : ''}`}
                  onClick={() => onChangeHumanPlayer('O')}
                  disabled={isAIThinking}
                >
                  O (Cyan)
                </button>
              </div>
            </div>

            {/* First Turn Option */}
            <div className="arcade-config-item">
              <span className="config-label">First Turn:</span>
              <div className="arcade-toggle-group">
                <button
                  type="button"
                  className={`arcade-toggle-btn ${firstPlayer === 'HUMAN' ? 'active' : ''}`}
                  onClick={() => onChangeFirstPlayer('HUMAN')}
                  disabled={isAIThinking}
                >
                  You First
                </button>
                <button
                  type="button"
                  className={`arcade-toggle-btn ${firstPlayer === 'AI' ? 'active' : ''}`}
                  onClick={() => onChangeFirstPlayer('AI')}
                  disabled={isAIThinking}
                >
                  MINI First
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="arcade-action-buttons">
            <button
              type="button"
              className="btn-arcade-action btn-arcade-restart"
              onClick={onReset}
              disabled={isAIThinking}
            >
              <RotateCcw size={15} />
              <span>Restart Match</span>
            </button>

            {onOpenMinimaxModal && (
              <button
                type="button"
                className="btn-arcade-action btn-arcade-brain"
                onClick={onOpenMinimaxModal}
                title="Inspect Minimax Lookahead & 7-Stage Walkthrough"
              >
                <Brain size={16} />
                <span>Inspect MINI's Brain Lab ✨</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================
            6. CONFIRMATION DIALOG FOR FORCED AI MOVE
            =================================================================== */}
        {pendingForcedCell !== null && (
          <div className="forced-confirm-overlay animate-fade-in" role="dialog" aria-modal="true">
            <div className="forced-confirm-card animate-pop-in">
              <div className="confirm-card-header">
                <div className="confirm-header-icon">
                  <Zap size={22} />
                </div>
                <div>
                  <h3 className="confirm-title">Confirm Forced AI Move</h3>
                  <span className="confirm-subtitle">Demonstration Mode Inspection</span>
                </div>
              </div>

              <p className="confirm-prompt-text">
                Are you sure you want MINI to play this move?
              </p>

              {/* Square details & Minimax evaluation metrics */}
              <div className="confirm-details-panel">
                <div className="confirm-cell-info">
                  <span className="confirm-cell-tag">SELECTED SQUARE</span>
                  <span className="confirm-cell-name">
                    Square #{pendingForcedCell + 1} • {formatPosition(pendingForcedCell)}
                  </span>
                  <span className="confirm-cell-coords">
                    (Row {Math.floor(pendingForcedCell / 3) + 1}, Col {(pendingForcedCell % 3) + 1})
                  </span>
                </div>

                <div className="confirm-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Minimax Score</span>
                    <span
                      className={`metric-value ${
                        (() => {
                          const cand = aiAnalysis?.candidateMoves?.find((c) => c.move === pendingForcedCell);
                          const sc = cand?.score ?? 0;
                          return sc > 0 ? 'text-win' : sc < 0 ? 'text-loss' : 'text-draw';
                        })()
                      }`}
                    >
                      {(() => {
                        const cand = aiAnalysis?.candidateMoves?.find((c) => c.move === pendingForcedCell);
                        const sc = cand?.score ?? 0;
                        return `${sc >= 0 ? '+' : ''}${sc}`;
                      })()}
                    </span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-label">Predicted Outcome</span>
                    <span className="metric-outcome-badge">
                      {aiAnalysis?.candidateMoves?.find((c) => c.move === pendingForcedCell)?.outcome || 'DRAW'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Optimal vs Different indicator banner */}
              <div
                className={`confirm-verdict-box ${
                  pendingForcedCell === aiAnalysis?.bestMove ? 'verdict-match' : 'verdict-diff'
                }`}
              >
                {pendingForcedCell === aiAnalysis?.bestMove ? (
                  <>
                    <CheckCircle2 size={18} className="verdict-icon" />
                    <div className="verdict-text">
                      <strong>✨ Matches MINI's recommended optimal move!</strong>
                      <span>This is the best possible play according to the Minimax algorithm.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="verdict-icon" />
                    <div className="verdict-text">
                      <strong>⚠️ This is different from my recommended move.</strong>
                      <span>
                        MINI's optimal choice was{' '}
                        <strong>
                          {aiAnalysis?.bestMove !== null && aiAnalysis?.bestMove !== undefined
                            ? `Square #${aiAnalysis.bestMove + 1} (${formatPosition(aiAnalysis.bestMove)})`
                            : 'another square'}
                        </strong>
                        .
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={onCancelForcedMove}
                >
                  Cancel / Pick Another ✖
                </button>
                <button
                  type="button"
                  className="btn-modal-confirm"
                  onClick={onConfirmForcedMove}
                >
                  Confirm & Play This Move 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            7. OVERLAPPING MINI ROBOT COMPANION
            Positioned at bottom-right, extending outside the game panel
            =================================================================== */}
        <div className={`mini-overlapping-dock ${dockMovementClass}`}>
          {/* Speech Dialogue Bubble (Anchored above MINI, pointing towards board) */}
          <div className="mini-dock-speech">
            <RobotDialogue
              text={robotDialogue}
              speaker="MINI"
              mood={robotExpression}
              voiceEnabled={voiceEnabled}
              onToggleVoice={onToggleVoice}
              sfxEnabled={sfxEnabled}
              onToggleSfx={onToggleSfx}
              placement="top"
            />
          </div>

          {/* Adorable Animated Robot Mascot */}
          <div className="mini-dock-mascot" onClick={onRobotClick} title="Click MINI to chat!">
            <MiniRobot
              size="medium"
              expression={robotExpression}
              lookDirection={robotLookDirection}
              isInteractive={true}
            />
          </div>

          <span className="mini-dock-hint">(Click MINI to chat!)</span>
        </div>

      </div>
    </div>
  );
}
