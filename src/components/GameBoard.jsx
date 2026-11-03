import React from 'react';
import { formatPosition } from '../algorithms/gameLogic.js';

export function GameBoard({
  board,
  onCellClick,
  disabled,
  winningLine,
  aiPreviewMove = null,
  humanPlayer = 'X',
  aiPlayer = 'O',
  drawingCell = null,
  drawingSymbol = null,
  aiTargetCell = null,
  isForcedSelecting = false,
  pendingForcedCell = null,
  onSelectForcedCell = null,
}) {
  return (
    <div className={`board-container ${isForcedSelecting ? 'board-force-mode' : ''}`}>
      <div className="tictactoe-grid" role="grid" aria-label="Tic Tac Toe Game Board">
        {board.map((cell, index) => {
          const isWinningCell = winningLine && winningLine.includes(index);
          const isAiPreview = aiPreviewMove === index && cell === null;
          const isTargetedByAI = aiTargetCell === index && cell === null;
          const isCurrentlyDrawing = drawingCell === index;
          const isForceSelectable = isForcedSelecting && cell === null;
          const isPendingForced = pendingForcedCell === index;
          const row = Math.floor(index / 3) + 1;
          const col = (index % 3) + 1;

          const handleClick = () => {
            if (isForcedSelecting) {
              if (cell === null && onSelectForcedCell) {
                onSelectForcedCell(index);
              }
            } else {
              onCellClick(index);
            }
          };

          return (
            <button
              key={index}
              className={`board-cell ${isWinningCell ? 'cell-winning' : ''} ${
                isAiPreview ? 'cell-ai-best-preview' : ''
              } ${isTargetedByAI ? 'cell-ai-targeted' : ''} ${
                isCurrentlyDrawing ? 'cell-drawing-active' : ''
              } ${isForceSelectable ? 'cell-force-selectable' : ''} ${
                isPendingForced ? 'cell-pending-forced' : ''
              }`}
              onClick={handleClick}
              disabled={isForcedSelecting ? cell !== null : (disabled || cell !== null)}
              aria-label={`Cell Row ${row} Column ${col}, ${cell ? cell : 'Empty'}${
                isForceSelectable ? ' - Click to Force AI move' : ''
              }`}
              title={`Cell [${row}, ${col}] - ${formatPosition(index)}${
                isForceSelectable ? ' (Click to Force AI Move)' : ''
              }`}
            >
              <span className="cell-coord">
                {row},{col}
              </span>

              {/* Force Selectable Hint Badge */}
              {isForceSelectable && !isPendingForced && (
                <span className="cell-force-badge">PICK ME ⚡</span>
              )}

              {/* Pending Forced Selection Marker */}
              {isPendingForced && (
                <div className="cell-pending-marker">
                  <span className="marker-ring"></span>
                  <span className="marker-label">CHOSEN 🎯</span>
                </div>
              )}

              {/* Target Aim Reticle when MINI is locking onto this cell */}
              {isTargetedByAI && (
                <div className="cell-target-reticle">
                  <span className="reticle-pulse"></span>
                  <span className="reticle-label">TARGET</span>
                </div>
              )}

              {/* Progressive SVG Stroke Drawing Animation while MINI is actively drawing */}
              {isCurrentlyDrawing && drawingSymbol && (
                <div className="drawing-symbol-container">
                  {drawingSymbol === 'O' ? (
                    <svg viewBox="0 0 60 60" className="animated-draw-svg">
                      <circle
                        cx="30"
                        cy="30"
                        r="20"
                        className="draw-path-circle"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 60 60" className="animated-draw-svg">
                      <line x1="14" y1="14" x2="46" y2="46" className="draw-path-line1" />
                      <line x1="46" y1="14" x2="14" y2="46" className="draw-path-line2" />
                    </svg>
                  )}
                  {/* Digital stylus sparkle effect */}
                  <span className="drawing-sparkle-tip">✦</span>
                </div>
              )}

              {/* Already Placed Static Symbols */}
              {!isCurrentlyDrawing && cell === 'X' && (
                <span className="cell-symbol symbol-x">X</span>
              )}
              {!isCurrentlyDrawing && cell === 'O' && (
                <span className="cell-symbol symbol-o">O</span>
              )}

              {/* Ghost preview of AI move when AI is ready */}
              {!isCurrentlyDrawing && isAiPreview && (
                <span
                  className={`cell-symbol ${
                    aiPlayer === 'X' ? 'symbol-x' : 'symbol-o'
                  }`}
                  style={{ opacity: 0.45 }}
                >
                  {aiPlayer}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
