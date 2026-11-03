import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Compass,
  GitCompare,
  Trophy,
} from 'lucide-react';
import { formatPosition, checkWinner } from '../algorithms/gameLogic.js';
import { MiniRobot } from './Robot/MiniRobot.jsx';
import { RobotDialogue } from './Robot/RobotDialogue.jsx';
import { RobotAudio } from './Robot/RobotVoice.js';
import '../styles/simpleExplanation.css';

/**
 * 3-STEP SEMINAR EXPLANATION PARADIGM:
 * "These are the possibilities → I'm comparing them → This is my best move"
 */
export const THREE_SEMINAR_STEPS = [
  {
    step: 1,
    id: 'possible_moves',
    pillTitle: '1. Possible Moves',
    headline: 'STEP 1: "These are my possible moves."',
    subtext: 'The AI locates every empty square on the board where a move can legally be placed.',
    dialogue: 'These are my possible moves! 🐾',
    expression: 'analysing',
    sfx: 'scan',
  },
  {
    step: 2,
    id: 'compare_possibilities',
    pillTitle: '2. Compare Possibilities',
    headline: 'STEP 2: "Let me compare the possibilities."',
    subtext: 'The AI uses Minimax lookahead to calculate whether each move leads to a Win, Draw, or Loss.',
    dialogue: 'Let me compare the possibilities! 🧠',
    expression: 'thinking',
    sfx: 'think',
  },
  {
    step: 3,
    id: 'best_move',
    pillTitle: '3. Best Move!',
    headline: 'STEP 3: "This is my best move!"',
    subtext: 'Out of all possibilities, the AI chooses the single square with the highest mathematical guarantee.',
    dialogue: 'This is my best move! ✨',
    expression: 'winning',
    sfx: 'chirp',
  },
];

/**
 * Truthfully evaluates why the selected move is optimal based on real Minimax calculation
 */
export function getSimpleBestMoveReason(aiAnalysis, board, aiPlayer, humanPlayer) {
  if (!aiAnalysis || aiAnalysis.bestMove === null) {
    return 'This move gives the highest guaranteed mathematical score.';
  }
  const bestMove = aiAnalysis.bestMove;
  const bestNorm = aiAnalysis.bestNormalizedScore;

  // 1. Immediate win or forced AI win
  if (bestNorm === 1) {
    return 'This move guarantees an unstoppable victory for the AI!';
  }

  // 2. Blocks an immediate opponent win
  const testBoard = [...board];
  testBoard[bestMove] = humanPlayer;
  const humanWinCheck = checkWinner(testBoard);
  if (humanWinCheck && humanWinCheck.winner === humanPlayer) {
    return 'This move immediately blocks you from winning!';
  }

  // 3. Forced draw or optimal positional guarantee
  return 'This move guarantees an optimal, unbeatable outcome with zero vulnerabilities.';
}

export function SimpleMinimaxExplanation({
  board = Array(9).fill(null),
  aiAnalysis,
  aiPlayer = 'O',
  humanPlayer = 'X',
  onExecuteMove,
  currentStep: controlledStep,
  onStepChange,
  showVoiceControls = false,
}) {
  const [internalStep, setInternalStep] = useState(1);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);

  const activeStep = controlledStep !== undefined ? controlledStep : internalStep;
  const stepInfo = THREE_SEMINAR_STEPS[activeStep - 1] || THREE_SEMINAR_STEPS[0];

  const candidateMoves = aiAnalysis?.candidateMoves || [];
  const bestMove = aiAnalysis?.bestMove ?? null;
  const bestScore = aiAnalysis?.bestScore ?? 0;
  const emptyPositions = board
    .map((c, i) => (c === null ? i : null))
    .filter((v) => v !== null);

  const bestReason = getSimpleBestMoveReason(aiAnalysis, board, aiPlayer, humanPlayer);

  // Play audio/sfx on step change
  const changeStep = (newStep) => {
    if (newStep < 1 || newStep > 3) return;
    if (onStepChange) {
      onStepChange(newStep);
    } else {
      setInternalStep(newStep);
    }
    setHoveredCandidate(null);

    const stepObj = THREE_SEMINAR_STEPS[newStep - 1];
    if (stepObj) {
      RobotAudio.playSfx(stepObj.sfx);
      RobotAudio.speak(stepObj.dialogue);
    }
  };

  const handleNext = () => {
    if (activeStep < 3) {
      changeStep(activeStep + 1);
    } else if (onExecuteMove) {
      onExecuteMove();
    } else {
      changeStep(1); // loop back
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      changeStep(activeStep - 1);
    }
  };

  return (
    <div className="simple-explanation-wrapper animate-fade-in">
      
      {/* =====================================================================
          1. TOP NAVIGATION BAR WITH 3 STEP PILLS & SINGLE NEXT BUTTON
          ===================================================================== */}
      <div className="simple-explanation-header">
        <div className="step-tracker-pills">
          {THREE_SEMINAR_STEPS.map((s) => (
            <button
              key={s.step}
              type="button"
              className={`step-pill-btn ${
                s.step === activeStep
                  ? 'active'
                  : s.step < activeStep
                  ? 'completed'
                  : ''
              }`}
              onClick={() => changeStep(s.step)}
              title={`Jump directly to Step ${s.step}`}
            >
              <span className="pill-step-num">{s.step}</span>
              <span>{s.pillTitle}</span>
            </button>
          ))}
        </div>

        <div className="step-nav-actions">
          {activeStep > 1 && (
            <button
              type="button"
              className="btn-step-prev"
              onClick={handlePrev}
              title="Go back to previous explanation step"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {/* Prominent NEXT Step Button */}
          <button
            type="button"
            className={`btn-step-next-primary ${activeStep === 3 && onExecuteMove ? 'btn-execute' : ''}`}
            onClick={handleNext}
          >
            {activeStep === 1 && (
              <>
                <span>NEXT: COMPARE POSSIBILITIES</span>
                <ChevronRight size={17} />
              </>
            )}
            {activeStep === 2 && (
              <>
                <span>NEXT: REVEAL BEST MOVE</span>
                <ChevronRight size={17} />
              </>
            )}
            {activeStep === 3 && (
              <>
                {onExecuteMove ? (
                  <>
                    <Play size={16} fill="currentColor" />
                    <span>PLAY THIS MOVE NOW!</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={15} />
                    <span>RESTART EXPLANATION</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. MAIN EXPLANATION BODY: 2 COLUMNS (MINI HOST + PROJECTOR BOARD)
          ===================================================================== */}
      <div className="simple-explanation-main">
        
        {/* Left Column: MINI Mascot Host */}
        <div className="simple-host-col">
          <RobotDialogue
            text={stepInfo.dialogue}
            speaker="MINI"
            mood={stepInfo.expression}
            placement="top"
          />

          <div className="simple-host-avatar">
            <MiniRobot
              size="medium"
              expression={stepInfo.expression}
              isInteractive={false}
            />
          </div>

          <div className="simple-step-tag">
            SEMINAR STEP {activeStep} OF 3
          </div>
        </div>

        {/* Right Column: Visual Stage (Board & Cards) */}
        <div className="simple-stage-col">
          
          {/* Headline Banner */}
          <div className="simple-headline-card">
            <h3 className="simple-headline-title">{stepInfo.headline}</h3>
            <p className="simple-headline-subtext">{stepInfo.subtext}</p>
          </div>

          {/* High-Contrast Projector 3x3 Board */}
          <div className="simple-board-box">
            <div className="projector-board-grid">
              {board.map((cell, idx) => {
                const isEmpty = cell === null;
                const row = Math.floor(idx / 3) + 1;
                const col = (idx % 3) + 1;

                const isStep1Available = activeStep === 1 && isEmpty;
                const isCandidateHovered = activeStep === 2 && hoveredCandidate === idx;
                const isStep3Best = activeStep === 3 && bestMove === idx;
                const isStep3Dimmed = activeStep === 3 && bestMove !== idx;

                const cand = candidateMoves.find((c) => c.move === idx);

                let cellHighlightClass = '';
                if (isStep1Available) cellHighlightClass = 'cell-available-glow';
                if (isCandidateHovered) cellHighlightClass = 'cell-candidate-highlight';
                if (isStep3Best) cellHighlightClass = 'cell-optimal-spotlight';
                if (isStep3Dimmed) cellHighlightClass = 'cell-dimmed-non-optimal';

                return (
                  <div
                    key={idx}
                    className={`projector-board-cell ${cellHighlightClass}`}
                    onMouseEnter={() => {
                      if (activeStep === 2 && isEmpty) setHoveredCandidate(idx);
                    }}
                    onMouseLeave={() => {
                      if (activeStep === 2) setHoveredCandidate(null);
                    }}
                  >
                    <span className="projector-cell-coord">{row},{col}</span>

                    {/* Placed Static Symbols */}
                    {cell === 'X' && (
                      <span className="projector-cell-symbol projector-symbol-x">X</span>
                    )}
                    {cell === 'O' && (
                      <span className="projector-cell-symbol projector-symbol-o">O</span>
                    )}

                    {/* STEP 1: Available Open Marker */}
                    {isEmpty && activeStep === 1 && (
                      <span className="badge-available-tag">AVAILABLE</span>
                    )}

                    {/* STEP 2: Outcome Badge inside cell */}
                    {isEmpty && activeStep === 2 && cand && (
                      <span
                        className={`candidate-score-pill ${
                          cand.normalizedScore === 1
                            ? 'score-win'
                            : cand.normalizedScore === 0
                            ? 'score-draw'
                            : 'score-loss'
                        }`}
                      >
                        {cand.normalizedScore === 1
                          ? 'WIN'
                          : cand.normalizedScore === 0
                          ? 'DRAW'
                          : 'LOSS'}
                      </span>
                    )}

                    {/* STEP 3: Best Move Symbol Ghost Spotlight */}
                    {isEmpty && isStep3Best && (
                      <span
                        className="projector-cell-symbol"
                        style={{
                          color: aiPlayer === 'X' ? 'var(--accent-blue-bright)' : 'var(--accent-cyan)',
                          animation: 'pulseGlowCell 1.4s infinite alternate',
                        }}
                      >
                        {aiPlayer}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================================
              STEP-SPECIFIC VISUAL CARDS
              ================================================================= */}

          {/* STEP 1: Open Squares Summary Card */}
          {activeStep === 1 && (
            <div className="step1-summary-card animate-fade-in">
              <span className="badge badge-blue" style={{ fontSize: '12px', padding: '4px 14px' }}>
                <Compass size={14} /> {emptyPositions.length} LEGAL SQUARES OPEN
              </span>
              <p style={{ margin: '8px 0 0 0', color: '#BAE6FD', fontSize: '13.5px' }}>
                MINI evaluates the whole board and isolates all valid empty squares currently open for placement.
              </p>
            </div>
          )}

          {/* STEP 2: Real Candidate Moves Visual Cards Grid */}
          {activeStep === 2 && (
            <div className="candidate-cards-container animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-lavender" style={{ fontSize: '11.5px' }}>
                  <GitCompare size={14} /> EVALUATING {candidateMoves.length} POSSIBLE BRANCHES
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  (Hover or click a card to highlight its position on the board)
                </span>
              </div>

              <div className="candidate-cards-grid">
                {candidateMoves.map((cand) => (
                  <div
                    key={cand.move}
                    className={`candidate-card-item ${
                      hoveredCandidate === cand.move ? 'hovered' : ''
                    } ${cand.isOptimal || cand.move === bestMove ? 'is-best-candidate' : ''}`}
                    onMouseEnter={() => setHoveredCandidate(cand.move)}
                    onMouseLeave={() => setHoveredCandidate(null)}
                    onClick={() => setHoveredCandidate(cand.move)}
                  >
                    <div className="candidate-header-row">
                      <span>#{cand.move + 1} {formatPosition(cand.move)}</span>
                      <span
                        className={`candidate-score-pill ${
                          cand.normalizedScore === 1
                            ? 'score-win'
                            : cand.normalizedScore === 0
                            ? 'score-draw'
                            : 'score-loss'
                        }`}
                      >
                        {cand.normalizedScore === 1
                          ? '✨ Win'
                          : cand.normalizedScore === 0
                          ? '🤝 Draw'
                          : '🥺 Loss'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <span>Minimax Score:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                        {cand.score >= 0 ? `+${cand.score}` : cand.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Optimal Move Spotlight Card */}
          {activeStep === 3 && (
            <div className="step3-spotlight-card animate-fade-in">
              <div className="spotlight-title-row">
                <Trophy size={20} style={{ color: 'var(--cute-yellow)' }} />
                <span>
                  OPTIMAL MOVE: {bestMove !== null ? formatPosition(bestMove).toUpperCase() : 'NONE'} (SQUARE #{bestMove !== null ? bestMove + 1 : ''})
                </span>
                <span className="badge badge-mint" style={{ fontSize: '11px' }}>
                  SCORE: {bestScore >= 0 ? `+${bestScore}` : bestScore}
                </span>
              </div>

              <p className="spotlight-quote">
                "{bestReason}"
              </p>

              {onExecuteMove && (
                <button
                  type="button"
                  className="btn-step-next-primary btn-execute"
                  onClick={onExecuteMove}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
                >
                  <Play size={18} fill="currentColor" />
                  <span>PLAY THIS MOVE ON THE BOARD NOW! 🚀</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

