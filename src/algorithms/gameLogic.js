/**
 * Core Tic-Tac-Toe Game Logic & Rules
 */

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diagonal \
  [2, 4, 6], // Diagonal /
];

export const INITIAL_BOARD = Array(9).fill(null);

/**
 * Checks for a winner on the given board.
 * @param {Array<string|null>} board 
 * @returns {{winner: string, line: number[]} | null}
 */
export function checkWinner(board) {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

/**
 * Checks if the board has no empty cells left.
 * @param {Array<string|null>} board 
 * @returns {boolean}
 */
export function isBoardFull(board) {
  return board.every((cell) => cell !== null);
}

/**
 * Returns an array of empty cell indices (0-8).
 * @param {Array<string|null>} board 
 * @returns {number[]}
 */
export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Returns full game state evaluation.
 * @param {Array<string|null>} board 
 * @returns {{isTerminal: boolean, winner: string|null, isDraw: boolean, winningLine: number[]|null}}
 */
export function getGameState(board) {
  const winInfo = checkWinner(board);
  if (winInfo) {
    return {
      isTerminal: true,
      winner: winInfo.winner,
      isDraw: false,
      winningLine: winInfo.line,
    };
  }

  if (isBoardFull(board)) {
    return {
      isTerminal: true,
      winner: null,
      isDraw: true,
      winningLine: null,
    };
  }

  return {
    isTerminal: false,
    winner: null,
    isDraw: false,
    winningLine: null,
  };
}

/**
 * Formats board index to human-readable (Row R, Col C) coordinate.
 * @param {number} index 
 * @returns {string} e.g. "Row 1, Col 2" or "Center"
 */
export function formatPosition(index) {
  if (index === null || index === undefined) return 'N/A';
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const label =
    index === 4
      ? 'Center (R2, C2)'
      : [0, 2, 6, 8].includes(index)
      ? `Corner (R${row}, C${col})`
      : `Edge (R${row}, C${col})`;
  return label;
}

