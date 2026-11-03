import { useState, useCallback, useEffect, useRef } from 'react';
import {
  INITIAL_BOARD,
  checkWinner,
  isBoardFull,
  getGameState,
  getAvailableMoves,
} from '../algorithms/gameLogic.js';
import { analyzeBoardWithMinimax } from '../algorithms/minimax.js';
import { RobotAudio } from '../components/Robot/RobotVoice.js';

const CLICK_DIALOGUES = [
  (name) => `Beep boop! You're doing great, ${name}! ✨`,
  (name) => `I'm checking 255,168 possibilities... no pressure, ${name}! 😋`,
  (name) => `Is that your secret masterplan, ${name}? 🤔`,
  (name) => `I love playing Tic-Tac-Toe with you, ${name}! 💖`,
  (name) => `Minimax says: best friends forever, ${name}! 🤖`,
  (name) => `Thinking really hard... look at my antenna glow! 💡`,
  (name) => `Need a cute hint, ${name}? The corners and center are cozy! 🐾`,
  (name) => `Can you find an unbeatable line, ${name}? Let's see! 🎮`,
];

export function useGame(initialName = '') {
  // Player identity
  const [playerName, setPlayerNameState] = useState(() => {
    if (initialName) return initialName;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('minimax_player_name') || '';
    }
    return '';
  });

  const setPlayerName = useCallback((name) => {
    setPlayerNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('minimax_player_name', name);
    }
  }, []);

  const [board, setBoard] = useState(INITIAL_BOARD);
  const [humanPlayer, setHumanPlayer] = useState('X'); // 'X' | 'O'
  const [firstPlayer, setFirstPlayer] = useState('HUMAN'); // 'HUMAN' | 'AI'
  const [currentTurn, setCurrentTurn] = useState('X');
  const [gameStatus, setGameStatus] = useState('IN_PROGRESS'); // 'IN_PROGRESS' | 'AI_THINKING' | 'AI_READY' | 'WON' | 'DRAW'
  const [winner, setWinner] = useState(null); // 'X' | 'O' | null
  const [winningLine, setWinningLine] = useState(null); // number[] | null
  const [moveHistory, setMoveHistory] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Score tracking across match sessions
  const [scores, setScores] = useState({ human: 0, ai: 0, draws: 0 });

  // Pop-up 7-Stage Walkthrough Modal State
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [autoExecuteModal, setAutoExecuteModal] = useState(false);
  const [autoDelayMs, setAutoDelayMs] = useState(1200);

  // Robot Companion Synchronized State & Voice Controls
  const [robotExpression, setRobotExpression] = useState('idle');
  const [robotDialogue, setRobotDialogue] = useState(() => {
    const name = playerName || 'Player';
    return `Alright, ${name}! Ready to challenge me? 🤖`;
  });
  const [voiceEnabled, setVoiceEnabled] = useState(RobotAudio.voiceEnabled);
  const [sfxEnabled, setSfxEnabled] = useState(RobotAudio.sfxEnabled);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Two AI Play Modes: 'AUTO' (Let MINI Decide) | 'FORCE' (Force AI Move)
  const [aiPlayMode, setAiPlayModeState] = useState('AUTO');
  const [isForcedSelecting, setIsForcedSelecting] = useState(false);
  const [pendingForcedCell, setPendingForcedCell] = useState(null);
  const [lastMoveDetails, setLastMoveDetails] = useState(null);

  // Physical move & drawing animation state
  const [aiTargetCell, setAiTargetCell] = useState(null);
  const [drawingCell, setDrawingCell] = useState(null);
  const [drawingSymbol, setDrawingSymbol] = useState(null);
  const [isReachingCell, setIsReachingCell] = useState(false);
  const [robotLookDirection, setRobotLookDirection] = useState('center');

  // Session ID to cancel active callbacks on reset or interruption
  const turnSessionId = useRef(0);

  // Reference for managing active animation & sequence timers without glitches
  const sequenceTimersRef = useRef([]);

  const clearSequenceTimers = useCallback(() => {
    sequenceTimersRef.current.forEach(clearTimeout);
    sequenceTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearSequenceTimers();
  }, [clearSequenceTimers]);

  const aiPlayer = humanPlayer === 'X' ? 'O' : 'X';
  const isAITurn = currentTurn === aiPlayer && gameStatus !== 'WON' && gameStatus !== 'DRAW';

  // Toggle Audio Controls
  const handleToggleVoice = useCallback(() => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    RobotAudio.voiceEnabled = next;
    if (!next) RobotAudio.stopSpeaking();
  }, [voiceEnabled]);

  const handleToggleSfx = useCallback(() => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    RobotAudio.sfxEnabled = next;
  }, [sfxEnabled]);

  // Synchronized AI Move Execution using the real Minimax algorithm
  // Can execute either normal optimal move OR forced move if forcedCell is passed
  const executeAIMoveSequence = useCallback(
    (currentBoard, targetAiPlayer, forcedCell = null) => {
      clearSequenceTimers();
      turnSessionId.current += 1;
      const thisSession = turnSessionId.current;

      setIsAIThinking(true);
      setGameStatus('AI_THINKING');
      setIsForcedSelecting(false);
      setPendingForcedCell(null);

      // Reset any previous drawing / reaching states
      setIsReachingCell(false);
      setDrawingCell(null);
      setDrawingSymbol(null);
      setAiTargetCell(null);

      // Run the real Minimax algorithm immediately so bestMove is identified
      const analysis = analyzeBoardWithMinimax(currentBoard, targetAiPlayer);
      setAiAnalysis(analysis);

      if (analysis.bestMove === null) {
        setIsAIThinking(false);
        setGameStatus('IN_PROGRESS');
        return;
      }

      const isForced = forcedCell !== null && forcedCell !== undefined;
      const targetMove = isForced ? forcedCell : analysis.bestMove;
      const isOptimal = analysis.bestMove === targetMove;
      const name = playerName || 'Player';

      // =======================================================================
      // STAGE 1 — THINKING & SPOKEN ANALYSIS (MINI remains in dock)
      // MINI looks at the board, tilts head, and speaks its complete sentence.
      // The symbol and movement MUST wait until speech finishes!
      // =======================================================================
      setRobotLookDirection('board');
      setRobotExpression(isForced ? 'playful' : 'thinking');
      const thinkText = isForced
        ? `Okayyy! I'll play where you told me!`
        : `Hmmmm... let me think, ${name}! 🧠`;
      setRobotDialogue(thinkText);

      RobotAudio.speak(thinkText, {
        pitch: 1.28,
        rate: 0.96,
        onEnd: () => {
          if (thisSession !== turnSessionId.current) return;

          // ===================================================================
          // STAGE 2 — FINDING THE MOVE (Speech finished!)
          // MINI locks onto the calculated cell with the target aim reticle.
          // ===================================================================
          setAiTargetCell(targetMove);
          setRobotLookDirection('board');
          setRobotExpression('analysing');
          const foundText = isForced ? `Aiming at square #${targetMove + 1}! 🎯` : `Found my spot! ✨`;
          setRobotDialogue(foundText);
          RobotAudio.playSfx('chirp');

          // Pause 320ms so user clearly sees MINI targeting the cell
          const timerGlide = setTimeout(() => {
            if (thisSession !== turnSessionId.current) return;

            // =================================================================
            // STAGE 3 — MOVING TOWARDS THE BOARD
            // MINI physically glides closer to the cell with extended stylus arm.
            // =================================================================
            setIsReachingCell(true);
            setRobotExpression('drawing');
            setRobotLookDirection('board');

            // Allow 450ms for the smooth CSS glide transform
            const timerDraw = setTimeout(() => {
              if (thisSession !== turnSessionId.current) return;

              // ===============================================================
              // STAGE 4 — DRAWING THE SYMBOL
              // Progressive SVG stroke drawing inside the targeted cell with SFX
              // ===============================================================
              setDrawingCell(targetMove);
              setDrawingSymbol(targetAiPlayer);
              RobotAudio.playSfx('draw');

              // Allow 520ms for SVG stroke animation to draw
              const timerCommit = setTimeout(() => {
                if (thisSession !== turnSessionId.current) return;

                // =============================================================
                // STAGE 5 — RETURNING TO DOCK & CELEBRATION / REACTION
                // Commit symbol to the actual board state and glide back
                // =============================================================
                const nextBoard = [...currentBoard];
                nextBoard[targetMove] = targetAiPlayer;
                setBoard(nextBoard);

                // Save move details for the demonstration mode banner
                setLastMoveDetails({
                  mode: isForced ? 'FORCED' : 'AUTO',
                  cell: targetMove,
                  isOptimal,
                  score: analysis.candidateMoves?.find((c) => c.move === targetMove)?.score ?? 0,
                });

                setMoveHistory((hist) => [
                  ...hist,
                  { player: targetAiPlayer, move: targetMove, boardAfter: nextBoard },
                ]);

                // Reset drawing and movement so MINI glides back to dock
                setIsReachingCell(false);
                setDrawingCell(null);
                setDrawingSymbol(null);
                setAiTargetCell(null);
                setRobotLookDirection('center');

                // Evaluate outcome
                const state = getGameState(nextBoard);
                if (state.isTerminal) {
                  if (state.winner) {
                    setWinner(state.winner);
                    setWinningLine(state.winningLine);
                    setGameStatus('WON');
                    setScores((s) => ({ ...s, ai: s.ai + 1 }));

                    setRobotExpression('winning');
                    const winText = `YAYYY! I won, ${name}! That was such a fun match! 🎉`;
                    setRobotDialogue(winText);
                    RobotAudio.playSfx('fanfare');
                    RobotAudio.speak(winText);
                  } else {
                    setGameStatus('DRAW');
                    setScores((s) => ({ ...s, draws: s.draws + 1 }));

                    setRobotExpression('draw');
                    const drawText = `Look at us, ${name}! We're equally clever! 🤝`;
                    setRobotDialogue(drawText);
                    RobotAudio.playSfx('draw');
                    RobotAudio.speak(drawText);
                  }
                  setIsAIThinking(false);
                } else {
                  // Game continues: Human's turn
                  const opponent = targetAiPlayer === 'X' ? 'O' : 'X';
                  setCurrentTurn(opponent);
                  setGameStatus('IN_PROGRESS');

                  if (isForced) {
                    setRobotExpression(isOptimal ? 'excited' : 'thinking');
                    const reactionText = `There! I hope that was a good choice!`;
                    setRobotDialogue(reactionText);
                    RobotAudio.speak(reactionText);
                  } else {
                    setRobotExpression('excited');
                    const reactionText = `There! That's my move! Your turn again, ${name}! ✨`;
                    setRobotDialogue(reactionText);
                    RobotAudio.speak(reactionText);
                  }
                  setIsAIThinking(false);
                }
              }, 520);
              sequenceTimersRef.current.push(timerCommit);
            }, 450);
            sequenceTimersRef.current.push(timerDraw);
          }, 320);
          sequenceTimersRef.current.push(timerGlide);
        },
      });
    },
    [clearSequenceTimers, playerName]
  );

  // Switch between 'AUTO' (Let MINI Decide) and 'FORCE' (Force AI Move)
  const setAiPlayMode = useCallback(
    (mode) => {
      setAiPlayModeState(mode);
      if (mode === 'FORCE') {
        // If it's already AI's turn, activate forced selection immediately
        if (currentTurn === aiPlayer && gameStatus !== 'WON' && gameStatus !== 'DRAW') {
          clearSequenceTimers();
          RobotAudio.stopSpeaking();
          setIsReachingCell(false);
          setDrawingCell(null);
          setDrawingSymbol(null);
          setAiTargetCell(null);
          setIsAIThinking(false);

          const analysis = analyzeBoardWithMinimax(board, aiPlayer);
          setAiAnalysis(analysis);
          setIsForcedSelecting(true);
          setPendingForcedCell(null);
          setRobotLookDirection('board');
          setRobotExpression('surprised');
          const prompt = `Waittt! You're choosing my move now?`;
          setRobotDialogue(prompt);
          RobotAudio.speak(prompt);
        }
      } else {
        // Switched back to AUTO
        setIsForcedSelecting(false);
        setPendingForcedCell(null);
        if (
          currentTurn === aiPlayer &&
          gameStatus !== 'WON' &&
          gameStatus !== 'DRAW' &&
          !isAIThinking
        ) {
          executeAIMoveSequence(board, aiPlayer, null);
        }
      }
    },
    [currentTurn, aiPlayer, gameStatus, board, isAIThinking, clearSequenceTimers, executeAIMoveSequence]
  );

  // Presenter clicks an empty square while in Force AI Move mode
  const handleSelectForcedCell = useCallback(
    (index) => {
      // Must be empty square and game in progress
      if (
        board[index] !== null ||
        currentTurn !== aiPlayer ||
        isAIThinking ||
        gameStatus === 'WON' ||
        gameStatus === 'DRAW'
      ) {
        return;
      }

      setPendingForcedCell(index);
      RobotAudio.playSfx('click');
      setRobotLookDirection('board');
    },
    [board, currentTurn, aiPlayer, isAIThinking, gameStatus]
  );

  // Confirmed forced move in confirmation dialog
  const confirmPendingForcedMove = useCallback(() => {
    if (pendingForcedCell === null || board[pendingForcedCell] !== null) return;
    const target = pendingForcedCell;
    setPendingForcedCell(null);
    setIsForcedSelecting(false);
    executeAIMoveSequence(board, aiPlayer, target);
  }, [pendingForcedCell, board, aiPlayer, executeAIMoveSequence]);

  // Cancelled forced move selection
  const cancelPendingForcedMove = useCallback(() => {
    setPendingForcedCell(null);
  }, []);

  // Handle Human Player clicking a square
  const handleCellClick = useCallback(
    (index) => {
      // Prevent clicks if AI is calculating, in forced selecting mode, cell occupied, or game finished
      if (
        board[index] !== null ||
        currentTurn !== humanPlayer ||
        isAIThinking ||
        isForcedSelecting ||
        gameStatus === 'AI_THINKING' ||
        gameStatus === 'WON' ||
        gameStatus === 'DRAW'
      ) {
        return;
      }

      turnSessionId.current += 1;
      clearSequenceTimers();
      setIsReachingCell(false);
      setDrawingCell(null);
      setDrawingSymbol(null);
      setAiTargetCell(null);

      const nextBoard = [...board];
      nextBoard[index] = humanPlayer;
      setBoard(nextBoard);

      setMoveHistory((prev) => [
        ...prev,
        { player: humanPlayer, move: index, boardAfter: nextBoard },
      ]);

      RobotAudio.playSfx('click');

      // MINI turns eyes towards the placed symbol
      setRobotLookDirection('board');

      const name = playerName || 'Player';
      const state = getGameState(nextBoard);

      if (state.isTerminal) {
        if (state.winner) {
          // Human Won!
          setWinner(state.winner);
          setWinningLine(state.winningLine);
          setGameStatus('WON');
          setScores((s) => ({ ...s, human: s.human + 1 }));

          setRobotExpression('losing');
          const lossText = `Whaaat, ${name}?! You beat me! You're really good! 🥺`;
          setRobotDialogue(lossText);
          RobotAudio.playSfx('loss');
          RobotAudio.speak(lossText);
        } else {
          // Draw!
          setGameStatus('DRAW');
          setScores((s) => ({ ...s, draws: s.draws + 1 }));

          setRobotExpression('draw');
          const drawText = `Look at us, ${name}! We're equally clever! 🤝`;
          setRobotDialogue(drawText);
          RobotAudio.playSfx('draw');
          RobotAudio.speak(drawText);
        }
      } else {
        // Human move valid & game continues -> Trigger MINI's Turn!
        setCurrentTurn(aiPlayer);

        if (aiPlayMode === 'FORCE') {
          // Pre-analyze board with real Minimax algorithm so audience can view optimal scores
          const analysis = analyzeBoardWithMinimax(nextBoard, aiPlayer);
          setAiAnalysis(analysis);
          setIsAIThinking(false);
          setIsForcedSelecting(true);
          setPendingForcedCell(null);
          setRobotLookDirection('board');
          setRobotExpression('surprised');
          const promptText = `Waittt! You're choosing my move now?`;
          setRobotDialogue(promptText);
          RobotAudio.speak(promptText);
        } else {
          executeAIMoveSequence(nextBoard, aiPlayer);
        }
      }
    },
    [
      board,
      currentTurn,
      humanPlayer,
      isAIThinking,
      isForcedSelecting,
      aiPlayMode,
      gameStatus,
      clearSequenceTimers,
      playerName,
      aiPlayer,
      executeAIMoveSequence,
    ]
  );

  // Manual execution button (if used in 7-Stage Walkthrough modal)
  const applyBestMove = useCallback(() => {
    if (!aiAnalysis || aiAnalysis.bestMove === null) return;
    const move = aiAnalysis.bestMove;

    turnSessionId.current += 1;
    clearSequenceTimers();
    setIsAnalysisModalOpen(false);
    setIsReachingCell(false);
    setDrawingCell(null);
    setDrawingSymbol(null);
    setAiTargetCell(null);
    setRobotLookDirection('center');

    setBoard((prev) => {
      if (prev[move] !== null) return prev;
      const nextBoard = [...prev];
      nextBoard[move] = aiPlayer;

      const state = getGameState(nextBoard);
      setMoveHistory((hist) => [
        ...hist,
        { player: aiPlayer, move, boardAfter: nextBoard },
      ]);

      const name = playerName || 'Player';

      if (state.isTerminal) {
        if (state.winner) {
          setWinner(state.winner);
          setWinningLine(state.winningLine);
          setGameStatus('WON');
          setScores((s) => ({ ...s, ai: s.ai + 1 }));

          setRobotExpression('winning');
          const winText = `YAYYY! I won, ${name}! That was fun! 🎉`;
          setRobotDialogue(winText);
          RobotAudio.playSfx('fanfare');
          RobotAudio.speak(winText);
        } else {
          setGameStatus('DRAW');
          setScores((s) => ({ ...s, draws: s.draws + 1 }));

          setRobotExpression('draw');
          const drawText = `Look at us, ${name}! We're equally clever! 🤝`;
          setRobotDialogue(drawText);
          RobotAudio.playSfx('draw');
          RobotAudio.speak(drawText);
        }
      } else {
        setCurrentTurn(humanPlayer);
        setGameStatus('IN_PROGRESS');

        setRobotExpression('excited');
        const turnText = `Your turn again, ${name}! ✨`;
        setRobotDialogue(turnText);
        RobotAudio.speak(turnText);
      }

      setIsAIThinking(false);
      return nextBoard;
    });
  }, [aiAnalysis, aiPlayer, humanPlayer, playerName, clearSequenceTimers]);

  // Restart / Reset Game
  const resetGame = useCallback(
    (newHumanPlayer = humanPlayer, newFirstPlayer = firstPlayer) => {
      turnSessionId.current += 1;
      clearSequenceTimers();
      RobotAudio.stopSpeaking();
      setIsAIThinking(false);
      setIsReachingCell(false);
      setDrawingCell(null);
      setDrawingSymbol(null);
      setAiTargetCell(null);
      setRobotLookDirection('center');

      setIsForcedSelecting(false);
      setPendingForcedCell(null);
      setLastMoveDetails(null);

      setBoard(INITIAL_BOARD);
      setWinner(null);
      setWinningLine(null);
      setMoveHistory([]);
      setAiAnalysis(null);
      setIsAnalysisModalOpen(false);

      const nextAiPlayer = newHumanPlayer === 'X' ? 'O' : 'X';
      const name = playerName || 'Player';

      setRobotExpression('idle');
      const resetText = `Another round, ${name}? Let's gooo! 🚀`;
      setRobotDialogue(resetText);
      RobotAudio.playSfx('chirp');
      RobotAudio.speak(resetText);

      if (newFirstPlayer === 'AI') {
        setCurrentTurn(nextAiPlayer);
        setGameStatus('IN_PROGRESS');

        if (aiPlayMode === 'FORCE') {
          setIsForcedSelecting(true);
          const analysis = analyzeBoardWithMinimax(INITIAL_BOARD, nextAiPlayer);
          setAiAnalysis(analysis);
          setRobotExpression('surprised');
          const prompt = `Waittt! You're choosing my move now?`;
          setRobotDialogue(prompt);
          RobotAudio.speak(prompt);
        } else {
          // Let MINI open with a smart move
          const timer = setTimeout(() => {
            executeAIMoveSequence(INITIAL_BOARD, nextAiPlayer);
          }, 600);
          sequenceTimersRef.current.push(timer);
        }
      } else {
        setCurrentTurn(newHumanPlayer);
        setGameStatus('IN_PROGRESS');
      }
    },
    [clearSequenceTimers, humanPlayer, firstPlayer, playerName, executeAIMoveSequence, aiPlayMode]
  );

  // Switch Symbol (X or O)
  const changeHumanPlayer = useCallback(
    (symbol) => {
      setHumanPlayer(symbol);
      resetGame(symbol, firstPlayer);
    },
    [firstPlayer, resetGame]
  );

  // Switch First Player (Human or AI)
  const changeFirstPlayer = useCallback(
    (first) => {
      setFirstPlayer(first);
      resetGame(humanPlayer, first);
    },
    [humanPlayer, resetGame]
  );

  // Interactive Clicking on MINI directly
  const handleRobotClick = useCallback(() => {
    // If AI is currently calculating, gliding or drawing, do not interrupt active timers!
    if (isAIThinking || gameStatus === 'AI_THINKING') {
      RobotAudio.playSfx('chirp');
      return;
    }

    clearSequenceTimers();
    RobotAudio.playSfx('chirp');
    setRobotExpression('playful');

    const name = playerName || 'Player';
    const generator = CLICK_DIALOGUES[Math.floor(Math.random() * CLICK_DIALOGUES.length)];
    const text = generator(name);
    setRobotDialogue(text);
    RobotAudio.speak(text);

    const timer = setTimeout(() => {
      setRobotExpression(currentTurn === aiPlayer ? 'thinking' : 'idle');
    }, 2800);
    sequenceTimersRef.current.push(timer);
  }, [clearSequenceTimers, playerName, currentTurn, aiPlayer, isAIThinking, gameStatus]);

  return {
    playerName,
    setPlayerName,
    board,
    humanPlayer,
    aiPlayer,
    firstPlayer,
    currentTurn,
    gameStatus,
    winner,
    winningLine,
    moveHistory,
    aiAnalysis,
    scores,
    setScores,
    isAnalysisModalOpen,
    setIsAnalysisModalOpen,
    autoExecuteModal,
    setAutoExecuteModal,
    autoDelayMs,
    setAutoDelayMs,
    handleCellClick,
    applyBestMove,
    resetGame,
    changeHumanPlayer,
    changeFirstPlayer,
    isAITurn,
    // Two AI Play Modes & Forced Move
    aiPlayMode,
    setAiPlayMode,
    isForcedSelecting,
    pendingForcedCell,
    lastMoveDetails,
    handleSelectForcedCell,
    confirmPendingForcedMove,
    cancelPendingForcedMove,
    // Synchronized Robot Mascot Properties
    robotExpression,
    setRobotExpression,
    robotDialogue,
    setRobotDialogue,
    voiceEnabled,
    handleToggleVoice,
    sfxEnabled,
    handleToggleSfx,
    handleRobotClick,
    isAIThinking,
    // Physical move & drawing animation exports
    aiTargetCell,
    drawingCell,
    drawingSymbol,
    isReachingCell,
    robotLookDirection,
  };
}
