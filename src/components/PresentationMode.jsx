import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Presentation,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
  Zap,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import { GameBoard } from './GameBoard.jsx';
import { SimpleMinimaxExplanation } from './SimpleMinimaxExplanation.jsx';
import { DecisionTree } from './DecisionTree.jsx';
import { SimulationPanel } from './SimulationPanel.jsx';
import { formatPosition } from '../algorithms/gameLogic.js';
import { MiniRobot } from './Robot/MiniRobot.jsx';
import { RobotAudio } from './Robot/RobotVoice.js';

const MINI_PRESENTATION_LINES = {
  1: {
    expression: 'happy',
    text: "Welcome to the Minimax AI Lab! I'm MINI, your AI opponent. Notice how a 3×3 grid branches into 255,168 possible leaf games!",
  },
  2: {
    expression: 'playful',
    text: "Pick any square, human! I don't use predetermined moves or tricks — I calculate all possible futures from scratch.",
  },
  3: {
    expression: 'thinking',
    text: "Analyzing move... Minimax engine active! I'm searching every branch to anticipate your best possible play.",
  },
  4: {
    expression: 'thinking',
    text: "Here are all legal moves currently available. Each one generates an entirely new sub-tree of counter-moves.",
  },
  5: {
    expression: 'confident',
    text: "Look at the alternating tree levels! MAX is me aiming for the top score; MIN is you trying to minimize my advantage.",
  },
  6: {
    expression: 'thinking',
    text: "Terminal game outcomes are scored: +1 if I win, 0 for a draw, -1 if you win. Backtracking propagates these guarantees upwards.",
  },
  7: {
    expression: 'excited',
    text: "TARGET ACQUIRED! The optimal move has been isolated. It guarantees the highest mathematical outcome against optimal defense.",
  },
  8: {
    expression: 'confident',
    text: "Move ready for deployment! Minimax guarantees that the AI cannot be defeated from this position. Let's play it!",
  },
};

export const PRESENTATION_SCRIPT_STEPS = [
  {
    step: 1,
    title: '1. Introduce the Tic-Tac-Toe Board',
    actionText: 'Show the audience the 3×3 grid. Explain that standard Tic-Tac-Toe has 9 positions and 255,168 possible leaf games.',
    promptToAudience: 'Welcome everyone! Today we look inside the mind of Artificial Intelligence. Here is our Tic-Tac-Toe environment.',
  },
  {
    step: 2,
    title: '2. Audience Move Selection',
    actionText: 'Invite an audience member or student to select any square on the board to challenge the AI.',
    promptToAudience: 'Choose any square on the board. Can anyone find a flaw in the Minimax algorithm?',
  },
  {
    step: 3,
    title: '3. Trigger AI Thinking Process',
    actionText: 'The AI immediately pauses board interaction and spins up its Minimax search engine in real-time.',
    promptToAudience: 'Watch the telemetry on the right. The AI is not guessing or reading a static lookup table — it is exploring the future.',
  },
  {
    step: 4,
    title: '4. Candidate Moves Revelation',
    actionText: 'Display all candidate empty cells and their resulting game boards in the Board-by-Board simulation panel.',
    promptToAudience: 'Notice how the AI identifies every legal move available right now, creating distinct future branches.',
  },
  {
    step: 5,
    title: '5. Decision Tree Deep Dive',
    actionText: 'Show the hierarchical decision tree with MAX and MIN layers, tracing counter-moves.',
    promptToAudience: 'This is the decision tree. MAX represents our AI maximizing points. MIN represents you, the human, playing to stop it.',
  },
  {
    step: 6,
    title: '6. Highlight MAX & MIN Logic',
    actionText: 'Demonstrate terminal evaluations (+1, 0, -1) and how backtracking pulls optimal scores upwards.',
    promptToAudience: 'Terminal states are scored (+1 for AI win, 0 for draw, -1 for loss). Backtracking propagates the guaranteed result up.',
  },
  {
    step: 7,
    title: '7. Reveal The Optimal Move',
    actionText: 'Highlight the glowing green optimal path and the chosen square with highest minimax score.',
    promptToAudience: 'Out of all possible paths, the AI isolates the green optimal path with the highest mathematical guarantee.',
  },
  {
    step: 8,
    title: '8. Explain Selection & Execute',
    actionText: 'Explain why the selected move guarantees a win or draw against any possible counter-play, then execute it.',
    promptToAudience: 'By playing this exact cell, the AI proves mathematically that it cannot lose. Let us commit the move!',
  },
];

export function PresentationMode({
  onClose,
  board,
  onCellClick,
  disabled,
  winningLine,
  aiAnalysis,
  aiPlayer,
  humanPlayer,
  currentTurn,
  gameStatus,
  onApplyAIMove,
  onOpenModal,
  simulationControls,
  onReset,
  drawingCell = null,
  drawingSymbol = null,
  aiTargetCell = null,
  // Two AI Play Modes & Forced Move
  aiPlayMode = 'AUTO',
  onChangeAiPlayMode,
  isForcedSelecting = false,
  pendingForcedCell = null,
  lastMoveDetails = null,
  onSelectForcedCell,
  onConfirmForcedMove,
  onCancelForcedMove,
}) {
  const [guideStep, setGuideStep] = useState(1);
  const [viewTab, setViewTab] = useState('simple'); // 'simple' | 'tree' | 'candidates'

  const currentGuide = PRESENTATION_SCRIPT_STEPS.find((s) => s.step === guideStep) || PRESENTATION_SCRIPT_STEPS[0];
  const isAITurn = currentTurn === aiPlayer;
  const bestMove = aiAnalysis?.bestMove;

  // React to slide step change with speech
  const handleStepChange = (newStep) => {
    setGuideStep(newStep);
    RobotAudio.playSfx('chirp');
    if (MINI_PRESENTATION_LINES[newStep]?.text) {
      RobotAudio.speak(MINI_PRESENTATION_LINES[newStep].text);
    }
  };

  const handleExit = () => {
    RobotAudio.stopSpeaking();
    onClose();
  };

  return (
    <div className="presentation-mode animate-fade-in">
      {/* Top Header */}
      <div className="presentation-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="badge badge-cyan" style={{ fontSize: '13px', padding: '6px 14px' }}>
            <Presentation size={16} /> SEMINAR PRESENTATION MODE
          </div>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            High-contrast projector display with live interactive guided walkthrough
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-cmd" onClick={onReset}>
            <RotateCcw size={14} /> New Match
          </button>
          <button className="btn-cmd btn-cmd-danger" onClick={handleExit}>
            <X size={15} /> Exit Presentation
          </button>
        </div>
      </div>

      {/* Guided Walkthrough Banner */}
      <div className="presentation-stage-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-blue">SLIDE {guideStep} OF 8</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#FFFFFF' }}>
              {currentGuide.title}
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#BAE6FD', marginBottom: '4px' }}>
            <strong>Presenter Script: </strong>"{currentGuide.promptToAudience}"
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {currentGuide.actionText}
          </p>
        </div>

        {/* Step Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-cmd btn-cmd-icon"
            onClick={() => handleStepChange(Math.max(1, guideStep - 1))}
            disabled={guideStep <= 1}
            title="Previous Guided Step"
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-blue-bright)' }}>
            {guideStep} / 8
          </span>
          <button
            className="btn-cmd btn-cmd-icon"
            onClick={() => handleStepChange(Math.min(8, guideStep + 1))}
            disabled={guideStep >= 8}
            title="Next Guided Step"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Presentation Main Grid */}
      <div className="presentation-grid">
        {/* Left: Large Game Board & Move Controls */}
        <div className="cyber-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600 }}>
              SEMINAR BOARD (PROJECTOR SIZE)
            </span>
            <span className={`badge ${isAITurn ? 'badge-amber' : 'badge-blue'}`}>
              {isAITurn ? `AI (${aiPlayer}) CALCULATING` : `AUDIENCE (${humanPlayer}) TURN`}
            </span>
          </div>

          <GameBoard
            board={board}
            onCellClick={onCellClick}
            disabled={disabled}
            winningLine={winningLine}
            aiPreviewMove={bestMove}
            humanPlayer={humanPlayer}
            aiPlayer={aiPlayer}
            drawingCell={drawingCell}
            drawingSymbol={drawingSymbol}
            aiTargetCell={aiTargetCell}
            isForcedSelecting={isForcedSelecting}
            pendingForcedCell={pendingForcedCell}
            onSelectForcedCell={onSelectForcedCell}
          />

          {/* AI Decision Mode Toggles for Presenter */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              className={`btn-cmd ${aiPlayMode === 'AUTO' ? 'btn-cmd-primary' : ''}`}
              style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
              onClick={() => onChangeAiPlayMode && onChangeAiPlayMode('AUTO')}
            >
              <Bot size={14} /> Let MINI Decide
            </button>
            <button
              type="button"
              className={`btn-cmd ${aiPlayMode === 'FORCE' ? 'btn-cmd-primary' : ''}`}
              style={{ flex: 1, justifyContent: 'center', fontSize: '12px', background: aiPlayMode === 'FORCE' ? 'linear-gradient(135deg, #f59e0b, #ec4899)' : undefined }}
              onClick={() => onChangeAiPlayMode && onChangeAiPlayMode('FORCE')}
            >
              <Zap size={14} /> Force AI Move ⚡
            </button>
          </div>

          {/* Mode Indicator Banner after AI plays */}
          {lastMoveDetails && (
            <div
              className={`last-move-mode-banner ${
                lastMoveDetails.mode === 'FORCED' ? 'banner-forced' : 'banner-auto'
              } animate-fade-in`}
              style={{ margin: 0 }}
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

          {/* Pending Forced Move Confirmation in Presentation Mode */}
          {pendingForcedCell !== null && (
            <div className="forced-confirm-overlay animate-fade-in" role="dialog" aria-modal="true" style={{ position: 'fixed', zIndex: 10000 }}>
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

                <div className="confirm-details-panel">
                  <div className="confirm-cell-info">
                    <span className="confirm-cell-tag">SELECTED SQUARE</span>
                    <span className="confirm-cell-name">
                      Square #{pendingForcedCell + 1} • {formatPosition(pendingForcedCell)}
                    </span>
                  </div>

                  <div className="confirm-metrics-grid">
                    <div className="metric-box">
                      <span className="metric-label">Minimax Score</span>
                      <span className="metric-value">
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

                <div
                  className={`confirm-verdict-box ${
                    pendingForcedCell === aiAnalysis?.bestMove ? 'verdict-match' : 'verdict-diff'
                  }`}
                >
                  {pendingForcedCell === aiAnalysis?.bestMove ? (
                    <>
                      <CheckCircle size={18} className="verdict-icon" />
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

                <div className="confirm-modal-actions">
                  <button type="button" className="btn-modal-cancel" onClick={onCancelForcedMove}>
                    Cancel / Pick Another ✖
                  </button>
                  <button type="button" className="btn-modal-confirm" onClick={onConfirmForcedMove}>
                    Confirm & Play This Move 🚀
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MINI Robot Seminar Companion Card with High-Contrast Subtitles */}
          <div className="presentation-robot-card animate-fade-in">
            <MiniRobot
              expression={MINI_PRESENTATION_LINES[guideStep]?.expression || 'idle'}
              size="small"
              isInteractive={true}
              onClick={() => {
                RobotAudio.playSfx('chirp');
                RobotAudio.speak(MINI_PRESENTATION_LINES[guideStep]?.text || "Hello everyone!");
              }}
            />
            <div className="presentation-robot-dialogue">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '2px 8px' }}>MINI &bull; AI OPPONENT</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-cyan)', fontFamily: 'var(--font-mono)' }}>SEMINAR SUBTITLES</span>
                </div>
                <button
                  className="btn-cmd btn-cmd-icon"
                  onClick={() => {
                    RobotAudio.playSfx('chirp');
                    RobotAudio.speak(MINI_PRESENTATION_LINES[guideStep]?.text);
                  }}
                  title="Speak Subtitle"
                >
                  <Volume2 size={13} style={{ color: 'var(--accent-cyan)' }} />
                </button>
              </div>
              <p className="presentation-subtitle-text">
                "{MINI_PRESENTATION_LINES[guideStep]?.text}"
              </p>
            </div>
          </div>

          {/* Quick Action Button for Presenter */}
          {gameStatus === 'AI_READY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {onOpenModal && (
                <button
                  className="btn-cmd glow-border"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center' }}
                  onClick={onOpenModal}
                >
                  <Sparkles size={16} /> Open AI Decision Engine Modal
                </button>
              )}
              <button
                className="btn-cmd btn-cmd-primary"
                style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}
                onClick={onApplyAIMove}
              >
                <Play size={18} />
                Commit AI Move ({formatPosition(bestMove)})
              </button>
            </div>
          )}

          {/* Real-time Minimax Decision Summary */}
          {aiAnalysis && (
            <div
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nodes Searched:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>
                  {aiAnalysis.stats.totalNodesExplored.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Minimax Evaluation:</span>
                <span style={{ color: '#34D399', fontWeight: 700 }}>
                  {aiAnalysis.bestScore >= 0 ? `+${aiAnalysis.bestScore}` : aiAnalysis.bestScore} (Guaranteed Unbeatable)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Large Visualizer with Tabs */}
        <div className="cyber-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="bottom-section-tabs" style={{ border: 'none', padding: 0 }}>
              <button
                className={`tab-btn ${viewTab === 'simple' ? 'active' : ''}`}
                onClick={() => setViewTab('simple')}
              >
                🌟 3-Step Seminar Explanation
              </button>
              <button
                className={`tab-btn ${viewTab === 'candidates' ? 'active' : ''}`}
                onClick={() => setViewTab('candidates')}
              >
                Candidate Move Simulation
              </button>
              <button
                className={`tab-btn ${viewTab === 'tree' ? 'active' : ''}`}
                onClick={() => setViewTab('tree')}
              >
                🔬 Technical Decision Tree (Optional)
              </button>
            </div>

            <span className="badge badge-online">AUDIENCE EXPLANATION</span>
          </div>

          <div style={{ flex: 1, minHeight: '480px' }}>
            {viewTab === 'simple' && (
              <SimpleMinimaxExplanation
                board={board}
                aiAnalysis={aiAnalysis}
                aiPlayer={aiPlayer}
                humanPlayer={humanPlayer}
                onExecuteMove={isAITurn ? onApplyAIMove : undefined}
              />
            )}
            {viewTab === 'tree' && (
              <DecisionTree
                rootNode={aiAnalysis?.treeData}
                activeStepNodeId={simulationControls.currentStep?.nodeId}
                aiPlayer={aiPlayer}
              />
            )}
            {viewTab === 'candidates' && (
              <SimulationPanel
                candidateMoves={aiAnalysis?.candidateMoves || []}
                bestMove={bestMove}
                currentBoard={board}
                simulationControls={simulationControls}
                aiPlayer={aiPlayer}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

