/**
 * MINIMAX ALGORITHM IMPLEMENTATION WITH FULL DECISION TRACING
 * 
 * Technical Accuracy:
 * - Recursive Minimax search
 * - Terminal state evaluation from AI's perspective (+1 AI win, -1 Human win, 0 Draw)
 * - Depth penalty (+10 - depth for fast win, -10 + depth for slow loss)
 * - Trace generation for live step-by-step educational simulation
 * - Candidate move comparison for board-by-board simulation
 */

import { checkWinner, isBoardFull, getAvailableMoves, formatPosition } from './gameLogic.js';
import { TraceStep, normalizeMinimaxScore } from './decisionTrace.js';

let nodeIdCounter = 0;

/**
 * Executes full Minimax analysis on the current board state.
 * Returns best move, detailed candidate move evaluations, statistics, visual tree, and trace steps.
 * 
 * @param {Array<string|null>} board Current 9-cell board
 * @param {string} aiPlayer 'X' or 'O'
 * @param {Object} options Configuration options (e.g. maxVisualDepth)
 */
export function analyzeBoardWithMinimax(board, aiPlayer, options = {}) {
  const startTime = performance.now();
  nodeIdCounter = 0;

  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const availableMoves = getAvailableMoves(board);

  // If no moves available, return empty result
  if (availableMoves.length === 0) {
    return {
      bestMove: null,
      bestScore: 0,
      candidateMoves: [],
      treeData: null,
      traceSteps: [],
      stats: {
        totalNodesExplored: 0,
        terminalStates: { aiWins: 0, humanWins: 0, draws: 0 },
        maxDepth: 0,
        branchingFactor: 0,
        executionTimeMs: 0,
      },
    };
  }

  const stats = {
    totalNodesExplored: 0,
    terminalStates: { aiWins: 0, humanWins: 0, draws: 0 },
    terminalSamples: [],
    maxDepth: 0,
    branchingFactor: availableMoves.length,
    executionTimeMs: 0,
  };

  const terminalLeaves = [];
  const traceSteps = [];
  let stepIndex = 0;

  // Maximum depth to materialize in visual tree (to keep DOM fast, yet deep and interactive)
  // When available moves <= 6, tree size is small enough to render deeper
  const defaultVisualDepth = availableMoves.length <= 5 ? 6 : availableMoves.length <= 7 ? 3 : 2;
  const maxVisualDepth = options.maxVisualDepth !== undefined ? options.maxVisualDepth : defaultVisualDepth;

  // Root Node
  const rootNode = {
    id: `node-${++nodeIdCounter}`,
    depth: 0,
    board: [...board],
    move: null,
    playerTurn: aiPlayer,
    isMax: true,
    score: null,
    normalizedScore: null,
    isTerminal: false,
    winner: null,
    isDraw: false,
    children: [],
    isOptimal: true,
    explanation: `Root state: AI (${aiPlayer}) is evaluating ${availableMoves.length} available candidate moves.`,
  };

  traceSteps.push(
    new TraceStep({
      stepIndex: stepIndex++,
      type: 'ENTER_NODE',
      nodeId: rootNode.id,
      depth: 0,
      isMax: true,
      player: aiPlayer,
      move: null,
      board: board,
      explanation: `AI (${aiPlayer}) starts Minimax evaluation at Root. The objective of MAX is to select the move yielding the highest guaranteed score.`,
    })
  );

  const candidateMoves = [];
  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  // Evaluate each candidate move from root
  for (const move of availableMoves) {
    const nextBoard = [...board];
    nextBoard[move] = aiPlayer;

    const childNode = {
      id: `node-${++nodeIdCounter}`,
      depth: 1,
      board: [...nextBoard],
      move: move,
      playerTurn: humanPlayer,
      isMax: false, // next is MIN
      score: null,
      normalizedScore: null,
      isTerminal: false,
      winner: null,
      isDraw: false,
      children: [],
      isOptimal: false,
      explanation: '',
    };

    rootNode.children.push(childNode);

    traceSteps.push(
      new TraceStep({
        stepIndex: stepIndex++,
        type: 'EXPLORE_CHILD',
        nodeId: childNode.id,
        depth: 1,
        isMax: false,
        player: humanPlayer,
        move: move,
        board: nextBoard,
        explanation: `AI explores candidate move at ${formatPosition(move)}. Next turn belongs to MIN (${humanPlayer}).`,
      })
    );

    // Recursively run Minimax
    const score = minimax(
      nextBoard,
      1,
      false, // Next turn is MIN
      aiPlayer,
      humanPlayer,
      childNode,
      stats,
      traceSteps,
      stepIndex,
      maxVisualDepth
    );
    stepIndex = traceSteps.length;

    childNode.score = score;
    childNode.normalizedScore = normalizeMinimaxScore(score);

    const norm = normalizeMinimaxScore(score);
    const outcome = norm === 1 ? 'AI WIN' : norm === -1 ? 'AI LOSS' : 'DRAW';

    // Find opponent's best counter-response from childNode's evaluated children
    let bestOpponentResponse = null;
    if (!childNode.isTerminal && childNode.children && childNode.children.length > 0) {
      // For MIN, opponent picked the child with child.score === childNode.score
      const counterNode = childNode.children.find((c) => c.score === childNode.score) || childNode.children[0];
      if (counterNode) {
        bestOpponentResponse = {
          move: counterNode.move,
          positionLabel: formatPosition(counterNode.move),
          score: counterNode.score,
          resultingBoard: counterNode.board,
          player: humanPlayer,
          explanation: `Opponent responds at ${formatPosition(counterNode.move)}, holding AI score to ${counterNode.score >= 0 ? '+' : ''}${counterNode.score}.`,
        };
      }
    } else if (childNode.isTerminal) {
      bestOpponentResponse = {
        isTerminal: true,
        winner: childNode.winner,
        isDraw: childNode.isDraw,
        explanation: childNode.winner === aiPlayer
          ? `Immediate victory for AI! Game ends immediately.`
          : `Immediate draw! Board filled.`,
      };
    }

    let detailedExplanation = '';
    if (outcome === 'AI WIN') {
      detailedExplanation = `This move creates a forced winning sequence for the AI. No opponent defense can prevent victory.`;
    } else if (outcome === 'DRAW') {
      detailedExplanation = `Opponent can respond optimally, but the AI guarantees a forced draw with no vulnerability.`;
    } else {
      detailedExplanation = `Opponent can exploit this position with optimal play and force a win.`;
    }

    // Find future outcome along optimal path from childNode
    let futureOutcome = null;
    const leaf = findTerminalLeaf(childNode);
    if (leaf && leaf.isTerminal) {
      futureOutcome = {
        board: leaf.board,
        winner: leaf.winner,
        isDraw: leaf.isDraw,
        score: leaf.score,
        normalizedScore: leaf.normalizedScore,
        outcome: leaf.winner === aiPlayer ? 'AI WIN' : leaf.isDraw ? 'DRAW' : 'AI LOSS',
        explanation: leaf.explanation,
      };
    } else {
      futureOutcome = {
        board: bestOpponentResponse?.resultingBoard || nextBoard,
        winner: norm === 1 ? aiPlayer : norm === -1 ? humanPlayer : null,
        isDraw: norm === 0,
        score,
        normalizedScore: norm,
        outcome,
        explanation: `Terminal outcome evaluated: ${outcome} with score ${score >= 0 ? '+' : ''}${score}.`,
      };
    }

    candidateMoves.push({
      move,
      positionLabel: formatPosition(move),
      score,
      normalizedScore: norm,
      resultingBoard: nextBoard,
      outcome,
      isOptimal: false,
      subtreeNodeId: childNode.id,
      bestOpponentResponse,
      futureOutcome,
      explanation: detailedExplanation,
    });

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;

      traceSteps.push(
        new TraceStep({
          stepIndex: stepIndex++,
          type: 'UPDATE_BEST',
          nodeId: rootNode.id,
          depth: 0,
          isMax: true,
          player: aiPlayer,
          move: move,
          board: board,
          score: score,
          normalizedScore: norm,
          bestScoreSoFar: bestScore,
          bestMoveSoFar: bestMove,
          explanation: `MAX finds new superior move at ${formatPosition(move)} with score ${score >= 0 ? '+' : ''}${score} (${outcome}).`,
        })
      );
    }
  }

  // Finalize root node
  rootNode.score = bestScore;
  rootNode.normalizedScore = normalizeMinimaxScore(bestScore);
  rootNode.chosenMove = bestMove;

  // Mark optimal candidates and mark optimal path in tree
  const optimalCandidates = [];
  candidateMoves.forEach((cand) => {
    if (cand.score === bestScore) {
      cand.isOptimal = true;
      optimalCandidates.push(cand);
    }
  });

  const isTiedOptimal = optimalCandidates.length > 1;
  let optimalReasoning = '';
  if (isTiedOptimal) {
    optimalReasoning = `The AI evaluated all ${candidateMoves.length} candidate positions. ${optimalCandidates.length} candidate moves yield the identical optimal score of ${bestScore >= 0 ? '+' : ''}${bestScore} (${rootNode.normalizedScore === 1 ? 'AI Win' : 'Guaranteed Draw'}). These moves are mathematically equivalent. The AI chooses ${formatPosition(bestMove)}.`;
  } else {
    optimalReasoning = `The AI evaluated all ${candidateMoves.length} candidate positions and explored every possible opponent reply. Position ${formatPosition(bestMove)} uniquely provides the highest guaranteed outcome (${bestScore >= 0 ? '+' : ''}${bestScore}), avoiding all opponent winning traps.`;
  }

  // Mark optimal child nodes
  markOptimalPath(rootNode, bestScore);

  traceSteps.push(
    new TraceStep({
      stepIndex: stepIndex++,
      type: 'ROOT_CHOSEN',
      nodeId: rootNode.id,
      depth: 0,
      isMax: true,
      player: aiPlayer,
      move: bestMove,
      board: board,
      score: bestScore,
      normalizedScore: rootNode.normalizedScore,
      bestScoreSoFar: bestScore,
      bestMoveSoFar: bestMove,
      explanation: `Minimax search complete! AI selects optimal move at ${formatPosition(bestMove)} with score ${bestScore >= 0 ? '+' : ''}${bestScore}.`,
    })
  );

  const endTime = performance.now();
  stats.executionTimeMs = Math.round((endTime - startTime) * 100) / 100;

  return {
    bestMove,
    bestScore,
    bestNormalizedScore: rootNode.normalizedScore,
    isTiedOptimal,
    optimalReasoning,
    candidateMoves,
    treeData: rootNode,
    traceSteps,
    stats,
  };
}

/**
 * Recursive Minimax engine with trace recording and visual tree pruning
 */
function minimax(
  board,
  depth,
  isMaximizing,
  aiPlayer,
  humanPlayer,
  currentNode,
  stats,
  traceSteps,
  stepIndex,
  maxVisualDepth
) {
  stats.totalNodesExplored++;
  if (depth > stats.maxDepth) {
    stats.maxDepth = depth;
  }

  // Check terminal conditions
  const winInfo = checkWinner(board);
  if (winInfo) {
    const winner = winInfo.winner;
    const isAiWin = winner === aiPlayer;
    // Score convention: +10 - depth for AI win, -10 + depth for AI loss
    const score = isAiWin ? 10 - depth : depth - 10;
    const normalized = isAiWin ? 1 : -1;

    if (isAiWin) stats.terminalStates.aiWins++;
    else stats.terminalStates.humanWins++;

    if (stats.terminalSamples && stats.terminalSamples.length < 12) {
      stats.terminalSamples.push({
        board: [...board],
        winner,
        isDraw: false,
        score,
        normalizedScore: normalized,
        depth,
        explanation: isAiWin
          ? `Terminal AI Victory: AI completes winning line (+${score})`
          : `Terminal Human Victory: Human completes line (${score})`,
      });
    }

    if (currentNode) {
      currentNode.isTerminal = true;
      currentNode.winner = winner;
      currentNode.score = score;
      currentNode.normalizedScore = normalized;
      currentNode.explanation = isAiWin
        ? `Terminal State: AI (${aiPlayer}) wins! Score = +10 - ${depth} = +${score}`
        : `Terminal State: Human (${humanPlayer}) wins! Score = -10 + ${depth} = ${score}`;
    }

    if (traceSteps.length < 500) {
      traceSteps.push(
        new TraceStep({
          stepIndex: traceSteps.length,
          type: 'EVALUATE_LEAF',
          nodeId: currentNode?.id,
          depth,
          isMax: isMaximizing,
          player: winner,
          move: currentNode?.move,
          board,
          score,
          normalizedScore: normalized,
          explanation: isAiWin
            ? `Terminal node reached: AI victory. Evaluated score: +${score}.`
            : `Terminal node reached: Human victory. Evaluated score: ${score}.`,
        })
      );
    }

    return score;
  }

  if (isBoardFull(board)) {
    const score = 0;
    stats.terminalStates.draws++;

    if (stats.terminalSamples && stats.terminalSamples.length < 12) {
      stats.terminalSamples.push({
        board: [...board],
        winner: null,
        isDraw: true,
        score: 0,
        normalizedScore: 0,
        depth,
        explanation: 'Terminal Draw: All 9 squares occupied without winning line (Score: 0)',
      });
    }

    if (currentNode) {
      currentNode.isTerminal = true;
      currentNode.isDraw = true;
      currentNode.score = 0;
      currentNode.normalizedScore = 0;
      currentNode.explanation = `Terminal State: Draw (Board Full). Score = 0`;
    }

    if (traceSteps.length < 500) {
      traceSteps.push(
        new TraceStep({
          stepIndex: traceSteps.length,
          type: 'EVALUATE_LEAF',
          nodeId: currentNode?.id,
          depth,
          isMax: isMaximizing,
          player: null,
          move: currentNode?.move,
          board,
          score: 0,
          normalizedScore: 0,
          explanation: `Terminal node reached: Draw. All 9 cells filled. Evaluated score: 0.`,
        })
      );
    }

    return score;
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    // MAX (AI's turn)
    let maxEval = -Infinity;
    let bestChildNode = null;

    for (const move of availableMoves) {
      board[move] = aiPlayer;

      let childNode = null;
      if (depth < maxVisualDepth) {
        childNode = {
          id: `node-${++nodeIdCounter}`,
          depth: depth + 1,
          board: [...board],
          move: move,
          playerTurn: humanPlayer,
          isMax: false,
          score: null,
          normalizedScore: null,
          isTerminal: false,
          winner: null,
          isDraw: false,
          children: [],
          isOptimal: false,
          explanation: '',
        };
        currentNode.children.push(childNode);
      }

      const evalScore = minimax(
        board,
        depth + 1,
        false,
        aiPlayer,
        humanPlayer,
        childNode,
        stats,
        traceSteps,
        stepIndex,
        maxVisualDepth
      );

      board[move] = null; // Backtrack

      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestChildNode = childNode;
      }
    }

    if (currentNode) {
      currentNode.score = maxEval;
      currentNode.normalizedScore = normalizeMinimaxScore(maxEval);
      currentNode.explanation = `MAX player chooses highest child score: ${maxEval >= 0 ? '+' : ''}${maxEval}.`;
    }

    if (traceSteps.length < 500) {
      traceSteps.push(
        new TraceStep({
          stepIndex: traceSteps.length,
          type: 'BACKTRACK',
          nodeId: currentNode?.id,
          depth,
          isMax: true,
          player: aiPlayer,
          move: currentNode?.move,
          board,
          score: maxEval,
          normalizedScore: normalizeMinimaxScore(maxEval),
          explanation: `Backtracking to depth ${depth}: MAX evaluated all branches, chosen score = ${maxEval >= 0 ? '+' : ''}${maxEval}.`,
        })
      );
    }

    return maxEval;
  } else {
    // MIN (Human's turn) - assumes opponent plays optimally to minimize AI's score
    let minEval = +Infinity;
    let bestChildNode = null;

    for (const move of availableMoves) {
      board[move] = humanPlayer;

      let childNode = null;
      if (depth < maxVisualDepth) {
        childNode = {
          id: `node-${++nodeIdCounter}`,
          depth: depth + 1,
          board: [...board],
          move: move,
          playerTurn: aiPlayer,
          isMax: true,
          score: null,
          normalizedScore: null,
          isTerminal: false,
          winner: null,
          isDraw: false,
          children: [],
          isOptimal: false,
          explanation: '',
        };
        currentNode.children.push(childNode);
      }

      const evalScore = minimax(
        board,
        depth + 1,
        true,
        aiPlayer,
        humanPlayer,
        childNode,
        stats,
        traceSteps,
        stepIndex,
        maxVisualDepth
      );

      board[move] = null; // Backtrack

      if (evalScore < minEval) {
        minEval = evalScore;
        bestChildNode = childNode;
      }
    }

    if (currentNode) {
      currentNode.score = minEval;
      currentNode.normalizedScore = normalizeMinimaxScore(minEval);
      currentNode.explanation = `MIN player assumes opponent picks lowest score: ${minEval >= 0 ? '+' : ''}${minEval}.`;
    }

    if (traceSteps.length < 500) {
      traceSteps.push(
        new TraceStep({
          stepIndex: traceSteps.length,
          type: 'BACKTRACK',
          nodeId: currentNode?.id,
          depth,
          isMax: false,
          player: humanPlayer,
          move: currentNode?.move,
          board,
          score: minEval,
          normalizedScore: normalizeMinimaxScore(minEval),
          explanation: `Backtracking to depth ${depth}: MIN assumes optimal opponent counter-move, chosen score = ${minEval >= 0 ? '+' : ''}${minEval}.`,
        })
      );
    }

    return minEval;
  }
}

/**
 * Traverses visual tree and highlights the optimal path nodes
 */
function markOptimalPath(node, targetScore) {
  if (!node) return;
  node.isOptimal = true;

  if (!node.children || node.children.length === 0) return;

  // For MAX nodes, child score equals node score
  // For MIN nodes, child score equals node score
  const optimalChild = node.children.find((child) => child.score === node.score);
  if (optimalChild) {
    markOptimalPath(optimalChild, optimalChild.score);
  }
}

/**
 * Traverses to the terminal leaf node of an optimal path
 */
export function findTerminalLeaf(node) {
  if (!node) return null;
  if (node.isTerminal) return node;
  if (!node.children || node.children.length === 0) return null;
  const bestChild = node.children.find((c) => c.score === node.score) || node.children[0];
  return findTerminalLeaf(bestChild) || bestChild;
}

