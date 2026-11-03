import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Play,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Target,
} from 'lucide-react';
import { formatPosition, checkWinner } from '../algorithms/gameLogic.js';
import { MiniRobot } from './Robot/MiniRobot.jsx';
import { RobotDialogue } from './Robot/RobotDialogue.jsx';
import { RobotAudio } from './Robot/RobotVoice.js';

/**
 * 3-STEP SEMINAR AI EXPLANATION PARADIGM
 * "These are the possibilities → I'm comparing them → This is my best move"
 */
export const SIMPLE_STEPS = [
  {
    id: 1,
    title: 'Possible Moves',
    heading: 'These are my possible moves.',
    message: 'These are my possible moves! I can play in any open square.',
    expression: 'analysing',
    sfx: 'scan',
  },
  {
    id: 2,
    title: 'Compare Possibilities',
    heading: 'Let me compare the possibilities.',
    message: 'Let me compare the possibilities to calculate Wins, Draws, or Losses.',
    expression: 'thinking',
    sfx: 'think',
  },
  {
    id: 3,
    title: 'Best Move!',
    heading: 'This is my best move!',
    message: 'This is my best move! It guarantees the highest mathematical score.',
    expression: 'winning',
    sfx: 'chirp',
  },
];

/**
 * Helper to determine a truthful, single-sentence reason for the best move
 */
export function getSimpleBestMoveReason(aiAnalysis, board, aiPlayer, humanPlayer) {
  if (!aiAnalysis || aiAnalysis.bestMove === null) {
    return 'This move gives the best possible outcome.';
  }
  const bestMove = aiAnalysis.bestMove;
  const bestNorm = aiAnalysis.bestNormalizedScore;

  // 1. Immediate win or forced AI win
  if (bestNorm === 1) {
    return 'This move helps me win.';
  }

  // 2. Blocks an immediate opponent win
  const testBoard = [...board];
  testBoard[bestMove] = humanPlayer;
  const humanWinCheck = checkWinner(testBoard);
  if (humanWinCheck && humanWinCheck.winner === humanPlayer) {
    return 'This move prevents you from winning.';
  }

  // 3. Otherwise, guarantees best possible outcome (e.g. forced draw / optimal positioning)
  return 'This move gives the best possible outcome.';
}

export function AIThinkingModal({
  isOpen,
  onClose,
  board = Array(9).fill(null),
  aiAnalysis,
  aiPlayer = 'O',
  humanPlayer = 'X',
  onExecuteMove,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hoveredMove, setHoveredMove] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(RobotAudio.voiceEnabled);
  const [sfxEnabled, setSfxEnabled] = useState(RobotAudio.sfxEnabled);

  const candidateMoves = aiAnalysis?.candidateMoves || [];
  const bestMove = aiAnalysis?.bestMove ?? null;
  const bestScore = aiAnalysis?.bestScore ?? 0;
  const emptyPositions = board
    .map((c, i) => (c === null ? i : null))
    .filter((v) => v !== null);

  const stepInfo = SIMPLE_STEPS[currentStep - 1] || SIMPLE_STEPS[0];
  const bestReason = getSimpleBestMoveReason(aiAnalysis, board, aiPlayer, humanPlayer);

  // Sync Audio toggles
  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    RobotAudio.voiceEnabled = next;
    if (!next) RobotAudio.stopSpeaking();
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    RobotAudio.sfxEnabled = next;
  };

  // Handle opening and closing lifecycle
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setHoveredMove(null);
    } else {
      RobotAudio.stopSpeaking();
    }
  }, [isOpen]);

  // Sound & speech reaction when step changes
  useEffect(() => {
    if (isOpen) {
      RobotAudio.playSfx(stepInfo.sfx);
      RobotAudio.speak(`${stepInfo.heading} ${stepInfo.message}`);
    }
    return () => {
      RobotAudio.stopSpeaking();
    };
  }, [isOpen, currentStep, stepInfo]);

  if (!isOpen) return null;

  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleExecute = () => {
    RobotAudio.playSfx('execute');
    RobotAudio.speak("Let's see what happens!");
    if (onExecuteMove) {
      onExecuteMove();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container simple-modal-container animate-pop-in">
        
        {/* ===================================================================
            1. MODAL HEADER
            =================================================================== */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="modal-heading">HOW MINI THINKS</h2>
              <p className="modal-subtitle">STEP-BY-STEP VISUAL DECISION EXPLANATION</p>
            </div>
          </div>

          <div className="modal-header-actions">
            {/* Audio Toggles */}
            <button
              type="button"
              className="btn-titlebar-icon"
              onClick={handleToggleSfx}
              title={sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            >
              {sfxEnabled ? (
                <Bell size={15} style={{ color: 'var(--cute-sky)' }} />
              ) : (
                <BellOff size={15} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>

            <button
              type="button"
              className="btn-titlebar-icon"
              onClick={handleToggleVoice}
              title={voiceEnabled ? 'Mute Voice' : 'Enable Voice'}
            >
              {voiceEnabled ? (
                <Volume2 size={15} style={{ color: 'var(--cute-pink)' }} />
              ) : (
                <VolumeX size={15} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="modal-btn-close"
              onClick={onClose}
              title="Close Explanation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ===================================================================
            2. STEP TRACKER PILLS (4 Simple Steps)
            =================================================================== */}
        <div className="simple-steps-tracker">
          {SIMPLE_STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`step-tracker-pill ${
                s.id === currentStep
                  ? 'active'
                  : s.id < currentStep
                  ? 'completed'
                  : 'pending'
              }`}
              onClick={() => setCurrentStep(s.id)}
            >
              <span className="step-pill-number">{s.id}</span>
              <span className="step-pill-title">{s.title}</span>
            </button>
          ))}
        </div>

        {/* ===================================================================
            3. MAIN CONTENT: ROBOT GUIDE + INTERACTIVE BOARD
            =================================================================== */}
        <div className="simple-modal-body">
          
          {/* Left Column: MINI Robot Mascot & Dialogue */}
          <div className="simple-robot-host-col">
            <RobotDialogue
              text={stepInfo.message}
              speaker="MINI"
              mood={stepInfo.expression}
              voiceEnabled={voiceEnabled}
              onToggleVoice={handleToggleVoice}
              sfxEnabled={sfxEnabled}
              onToggleSfx={handleToggleSfx}
              placement="top"
            />

            <div className="simple-robot-avatar-box">
              <MiniRobot
                size="large"
                expression={stepInfo.expression}
                isInteractive={false}
              />
            </div>

            <div className="step-badge-tag">
              STEP {currentStep} OF 3 &bull; {stepInfo.title.toUpperCase()}
            </div>
          </div>

          {/* Right Column: Visual Board & Step Cards */}
          <div className="simple-step-card-col">
            
            {/* Step Heading Banner */}
            <div className="simple-step-header-banner">
              <h3 className="simple-step-heading">{stepInfo.heading}</h3>
              <p className="simple-step-subtext">{stepInfo.message}</p>
            </div>

            {/* Interactive 3x3 Board with Dynamic Step Highlighting */}
            <div className="simple-board-container">
              <div className="stage-large-grid">
                {board.map((cell, idx) => {
                  const isEmpty = cell === null;
                  const row = Math.floor(idx / 3) + 1;
                  const col = (idx % 3) + 1;

                  // Highlighting conditions based on step
                  const isStep1Available = currentStep === 1 && isEmpty;
                  const isCandidateHovered = currentStep === 2 && hoveredMove === idx;
                  const isStep3Best = (currentStep === 3 || currentStep === 4) && bestMove === idx;
                  
                  // Candidate match in Step 2
                  const cand = candidateMoves.find((c) => c.move === idx);

                  let cellClass = '';
                  if (isStep1Available) cellClass = 'cell-empty-highlight';
                  if (isCandidateHovered) cellClass = 'cell-hovered-candidate';
                  if (isStep3Best) cellClass = 'cell-optimal-selected';

                  return (
                    <div
                      key={idx}
                      className={`stage-large-cell ${cellClass}`}
                      onMouseEnter={() => {
                        if (currentStep === 2 && isEmpty) setHoveredMove(idx);
                      }}
                      onMouseLeave={() => {
                        if (currentStep === 2) setHoveredMove(null);
                      }}
                    >
                      <span className="cell-coord-tag">
                        {row},{col}
                      </span>

                      {/* Placed Symbols */}
                      {cell === 'X' && <span className="cell-symbol symbol-x">X</span>}
                      {cell === 'O' && <span className="cell-symbol symbol-o">O</span>}

                      {/* Step 1: Available empty spots */}
                      {isEmpty && currentStep === 1 && (
                        <span className="cell-empty-target">AVAILABLE</span>
                      )}

                      {/* Step 2: Candidate score badges */}
                      {isEmpty && currentStep === 2 && cand && (
                        <span
                          className={`badge ${
                            cand.normalizedScore === 1
                              ? 'badge-mint'
                              : cand.normalizedScore === 0
                              ? 'badge-lavender'
                              : 'badge-peach'
                          }`}
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        >
                          {cand.normalizedScore === 1
                            ? 'WIN'
                            : cand.normalizedScore === 0
                            ? 'DRAW'
                            : 'LOSS'}
                        </span>
                      )}

                      {/* Step 3 & 4: Optimal Move Preview */}
                      {isEmpty && isStep3Best && (
                        <span
                          className={`cell-symbol ${
                            aiPlayer === 'X' ? 'symbol-x' : 'symbol-o'
                          }`}
                          style={{ opacity: 0.85, animation: 'pulseGlowCell 1.5s infinite alternate' }}
                        >
                          {aiPlayer}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step-Specific Visual Explanations (Zero complex math/jargon!) */}

            {/* STEP 1: Count of open positions */}
            {currentStep === 1 && (
              <div className="simple-step-detail-card animate-fade-in">
                <span className="badge badge-blue">
                  {emptyPositions.length} LEGAL SQUARES OPEN
                </span>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                  The computer scans the board and finds every open square where a move can legally be placed.
                </p>
              </div>
            )}

            {/* STEP 2: Candidate Moves List with Win/Draw/Loss badges */}
            {currentStep === 2 && (
              <div className="simple-step-detail-card animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-lavender">
                    EVALUATING {candidateMoves.length} POSSIBLE MOVES
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    (Hover or click a move to highlight on board)
                  </span>
                </div>

                <div className="simple-candidates-grid">
                  {candidateMoves.map((cand) => (
                    <div
                      key={cand.move}
                      className={`simple-candidate-pill ${
                        hoveredMove === cand.move ? 'hovered' : ''
                      } ${cand.isOptimal || cand.move === bestMove ? 'is-best' : ''}`}
                      onMouseEnter={() => setHoveredMove(cand.move)}
                      onMouseLeave={() => setHoveredMove(null)}
                      onClick={() => setHoveredMove(cand.move)}
                    >
                      <div className="cand-pos-title">
                        <span className="cand-num">#{cand.move + 1}</span>
                        <span>{formatPosition(cand.move)}</span>
                      </div>

                      <div className="cand-badge-wrap">
                        {cand.normalizedScore === 1 && (
                          <span className="badge badge-mint">✨ AI Win</span>
                        )}
                        {cand.normalizedScore === 0 && (
                          <span className="badge badge-lavender">🤝 Draw</span>
                        )}
                        {cand.normalizedScore === -1 && (
                          <span className="badge badge-peach">🥺 Loss</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Best Move Chosen with Truthful Reason & Direct Execution */}
            {currentStep === 3 && (
              <div className="simple-step-detail-card simple-best-move-card animate-fade-in">
                <div className="best-move-title-row">
                  <Sparkles size={18} className="star-sparkle" style={{ color: 'var(--cute-yellow)' }} />
                  <span className="best-move-title">
                    OPTIMAL MOVE: {bestMove !== null ? formatPosition(bestMove).toUpperCase() : 'NONE'} (SQUARE #{bestMove !== null ? bestMove + 1 : ''})
                  </span>
                </div>

                <div className="best-move-reason-quote">
                  <p className="quote-text">"{bestReason}"</p>
                </div>

                <button
                  type="button"
                  className="btn-execute-prominent"
                  onClick={handleExecute}
                  style={{ marginTop: '14px', width: '100%' }}
                >
                  <Play size={18} fill="currentColor" />
                  <span>PLAY THIS MOVE NOW! 🚀</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ===================================================================
            4. STEP NAVIGATION FOOTER (Previous / Next)
            =================================================================== */}
        <div className="simple-modal-footer">
          <button
            type="button"
            className="btn-step-nav"
            onClick={goToPrevStep}
            disabled={currentStep <= 1}
          >
            <ChevronLeft size={16} />
            <span>PREVIOUS</span>
          </button>

          <span className="step-count-indicator">
            Step {currentStep} of 3
          </span>

          {currentStep < 3 ? (
            <button
              type="button"
              className="btn-step-nav btn-step-next"
              onClick={goToNextStep}
            >
              <span>NEXT STEP</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-step-nav btn-step-execute"
              onClick={handleExecute}
            >
              <span>EXECUTE MOVE</span>
              <Play size={15} fill="currentColor" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
