/**
 * Decision Trace Data Structures & Helpers for Minimax AI Lab
 */

export class TraceStep {
  constructor({
    stepIndex,
    type, // 'ENTER_NODE' | 'EVALUATE_LEAF' | 'UPDATE_BEST' | 'BACKTRACK' | 'ROOT_CHOSEN'
    nodeId,
    depth,
    isMax,
    player,
    move,
    board,
    score = null,
    normalizedScore = null,
    bestScoreSoFar = null,
    bestMoveSoFar = null,
    explanation = '',
  }) {
    this.stepIndex = stepIndex;
    this.type = type;
    this.nodeId = nodeId;
    this.depth = depth;
    this.isMax = isMax;
    this.player = player;
    this.move = move;
    this.board = [...board];
    this.score = score;
    this.normalizedScore = normalizedScore;
    this.bestScoreSoFar = bestScoreSoFar;
    this.bestMoveSoFar = bestMoveSoFar;
    this.explanation = explanation;
  }
}

/**
 * Normalizes depth-adjusted score to classic seminar notation: +1, 0, -1
 */
export function normalizeMinimaxScore(score) {
  if (score === null || score === undefined) return 0;
  if (score > 0) return 1;
  if (score < 0) return -1;
  return 0;
}

/**
 * Returns text label for score (+1, 0, -1) from AI's perspective
 */
export function getScoreLabel(score) {
  const norm = normalizeMinimaxScore(score);
  if (norm === 1) return '+1 (AI Win)';
  if (norm === -1) return '-1 (Human Win)';
  return '0 (Draw)';
}

