import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Filter, Eye, CheckCircle, Info, X } from 'lucide-react';
import { DecisionNode } from './DecisionNode.jsx';
import { formatPosition } from '../algorithms/gameLogic.js';
import { normalizeMinimaxScore, getScoreLabel } from '../algorithms/decisionTrace.js';

export function DecisionTree({
  rootNode,
  activeStepNodeId,
  onNodeSelect,
  aiPlayer,
}) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [onlyOptimalPath, setOnlyOptimalPath] = useState(false);
  const [depthFilter, setDepthFilter] = useState(2); // 1, 2, 3, or 99 (all)
  const containerRef = useRef(null);

  // When activeStepNodeId changes, auto-highlight if needed
  useEffect(() => {
    if (activeStepNodeId && rootNode) {
      const found = findNodeById(rootNode, activeStepNodeId);
      if (found) {
        setSelectedNode(found);
      }
    }
  }, [activeStepNodeId, rootNode]);

  // Group nodes by depth for level-by-level rendering
  const levels = useMemo(() => {
    if (!rootNode) return [];

    const result = [];
    const queue = [{ node: rootNode, parentId: null }];

    while (queue.length > 0) {
      const current = queue.shift();
      const depth = current.node.depth;

      // Filter by max depth
      if (depth > depthFilter) continue;

      // Filter by optimal path if toggled
      if (onlyOptimalPath && !current.node.isOptimal) continue;

      if (!result[depth]) {
        result[depth] = [];
      }
      result[depth].push(current.node);

      if (current.node.children && current.node.children.length > 0) {
        for (const child of current.node.children) {
          queue.push({ node: child, parentId: current.node.id });
        }
      }
    }

    return result;
  }, [rootNode, depthFilter, onlyOptimalPath]);

  const handleZoomIn = () => setZoom((z) => Math.min(1.8, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.45, z - 0.15));
  const handleResetZoom = () => setZoom(1);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (onNodeSelect) onNodeSelect(node);
  };

  if (!rootNode) {
    return (
      <div className="cyber-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Info size={28} style={{ margin: '0 auto 12px', color: 'var(--accent-blue)' }} />
        <p>No decision tree generated yet. Start game or play a move to trigger AI thinking.</p>
      </div>
    );
  }

  return (
    <div className="tree-container">
      {/* Top Toolbar */}
      <div className="tree-toolbar">
        {/* Legend */}
        <div className="tree-legend">
          <div className="legend-item">
            <span className="legend-pill max"></span>
            <span>MAX (AI)</span>
          </div>
          <div className="legend-item">
            <span className="legend-pill min"></span>
            <span>MIN (Human)</span>
          </div>
          <div className="legend-item">
            <span className="legend-pill optimal"></span>
            <span>Optimal Path</span>
          </div>
          <div className="legend-item">
            <span className="legend-pill loss"></span>
            <span>Terminal Loss</span>
          </div>
          <div className="legend-item">
            <span className="legend-pill draw"></span>
            <span>Terminal Draw</span>
          </div>
        </div>

        {/* Tree Controls */}
        <div className="tree-controls-group">
          {/* Depth limit selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>View Depth:</span>
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                className={`toggle-btn ${depthFilter === d ? 'active' : ''}`}
                onClick={() => setDepthFilter(d)}
                style={{ padding: '2px 8px' }}
              >
                D{d}
              </button>
            ))}
          </div>

          {/* Optimal Path Filter */}
          <button
            className={`btn-cmd ${onlyOptimalPath ? 'btn-cmd-primary' : ''}`}
            style={{ padding: '6px 12px', fontSize: '11px' }}
            onClick={() => setOnlyOptimalPath(!onlyOptimalPath)}
          >
            <Filter size={13} />
            {onlyOptimalPath ? 'Optimal Only' : 'All Branches'}
          </button>

          {/* Zoom Buttons */}
          <button className="btn-cmd btn-cmd-icon" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button className="btn-cmd btn-cmd-icon" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <button className="btn-cmd btn-cmd-icon" onClick={handleResetZoom} title="Reset Zoom">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Tree Viewport */}
      <div className="tree-viewport" ref={containerRef}>
        <div
          className="tree-content"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          {levels.map((levelNodes, depth) => {
            const isMaxLevel = depth % 2 === 0;
            return (
              <div key={depth} className="tree-level">
                <span className="tree-level-label">
                  Depth {depth} &bull; {depth === 0 ? 'ROOT' : isMaxLevel ? 'MAX LAYER' : 'MIN LAYER'}
                </span>

                {levelNodes.map((node) => (
                  <DecisionNode
                    key={node.id}
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    isActiveStep={activeStepNodeId === node.id}
                    onClick={handleNodeClick}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Inspector Pop-up Modal when a node is clicked */}
      {selectedNode && (
        <div
          className="node-inspector-overlay animate-fade-in"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 7, 13, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="cyber-panel"
            style={{
              width: 'min(90%, 650px)',
              background: '#0A0F1D',
              border: '1px solid var(--accent-blue-bright)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 0 35px var(--accent-blue-glow)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-blue" style={{ fontSize: '12px' }}>
                  {selectedNode.depth === 0
                    ? 'ROOT STATE'
                    : selectedNode.isMax
                    ? 'MAX NODE (AI TURN)'
                    : 'MIN NODE (HUMAN TURN)'}
                </span>
                <span className="badge badge-cyan">Depth: {selectedNode.depth}</span>
                {selectedNode.isOptimal && (
                  <span className="badge badge-optimal">OPTIMAL PATH</span>
                )}
              </div>

              <button
                className="btn-cmd"
                onClick={() => setSelectedNode(null)}
                title="Return to Full Decision Tree"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                <X size={14} /> Return to Full Tree
              </button>
            </div>

            {/* Content: 5 Required Points */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '20px', alignItems: 'center' }}>
              {/* 1. The board at that stage */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  1. BOARD STATE
                </span>
                <div className="mini-board" style={{ transform: 'scale(1.35)', margin: '10px 0' }}>
                  {selectedNode.board.map((c, i) => (
                    <div
                      key={i}
                      className={`mini-cell ${
                        c === 'X' ? 'mini-cell-x' : c === 'O' ? 'mini-cell-o' : ''
                      } ${i === selectedNode.move ? 'mini-cell-cand' : ''}`}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-blue-bright)', fontFamily: 'var(--font-mono)' }}>
                  {selectedNode.move !== null ? formatPosition(selectedNode.move) : 'Initial State'}
                </span>
              </div>

              {/* Points 2 to 5 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 2. Which player made the move */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '150px' }}>
                    2. PLAYER TURN:
                  </span>
                  <span style={{ fontWeight: 700, color: selectedNode.playerTurn === 'X' ? 'var(--accent-blue-bright)' : 'var(--accent-cyan)' }}>
                    Player {selectedNode.playerTurn} ({selectedNode.isMax ? 'MAX (AI)' : 'MIN (Human)'})
                  </span>
                </div>

                {/* 3. Why the algorithm explored this branch */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '150px' }}>
                    3. EXPLORATION WHY:
                  </span>
                  <span style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {selectedNode.depth === 0
                      ? 'Root board: Evaluates every legal candidate move to find the maximum guaranteed outcome.'
                      : selectedNode.isMax
                      ? `AI explores move ${formatPosition(selectedNode.move)} to maximize guaranteed score.`
                      : `Explores human counter-response to ensure no opponent strategy can defeat the AI.`}
                  </span>
                </div>

                {/* 4. Minimax score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '150px' }}>
                    4. MINIMAX SCORE:
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: 700,
                      color:
                        normalizeMinimaxScore(selectedNode.score) === 1
                          ? '#34D399'
                          : normalizeMinimaxScore(selectedNode.score) === -1
                          ? '#F87171'
                          : 'var(--accent-cyan)',
                    }}
                  >
                    {selectedNode.score !== null ? (selectedNode.score >= 0 ? `+${selectedNode.score}` : `${selectedNode.score}`) : 'Evaluating...'} ({getScoreLabel(selectedNode.score)})
                  </span>
                </div>

                {/* 5. What possible outcomes follow */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '150px' }}>
                    5. OUTCOMES FOLLOW:
                  </span>
                  <span style={{ color: '#BAE6FD', lineHeight: 1.4 }}>
                    {selectedNode.isTerminal
                      ? `Terminal result reached: ${selectedNode.isDraw ? 'Game Draw (All 9 cells full)' : `${selectedNode.winner} Wins`}.`
                      : selectedNode.children?.length > 0
                      ? `${selectedNode.children.length} legal continuation sub-branches explored below this node.`
                      : 'Leaf evaluation complete.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer with return button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <button
                className="btn-cmd btn-cmd-primary"
                onClick={() => setSelectedNode(null)}
              >
                Return to Full Tree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to find node in tree
function findNodeById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

