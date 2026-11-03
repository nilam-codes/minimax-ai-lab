import React from 'react';
import { Cpu, RotateCcw, Presentation, ShieldCheck, Activity, Terminal, Gamepad2, User } from 'lucide-react';

export function Navbar({
  onReset,
  isPresentationMode,
  onTogglePresentation,
  isAITurn,
  gameStatus,
  playerName,
  isForegroundOpen,
  onOpenGameArena,
}) {
  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Cpu size={22} />
        </div>
        <div>
          <h1 className="brand-title">
            MINIMAX <span style={{ color: 'var(--accent-blue-bright)' }}>AI LAB</span>
          </h1>
          <p className="brand-subtitle">Interactive Intelligence Simulator</p>
        </div>
      </div>

      <div className="nav-telemetry">
        <div className="badge badge-online">
          <span className="pulse-dot"></span>
          SYSTEM ONLINE
        </div>

        {playerName && (
          <div className="badge badge-pink">
            <User size={12} />
            PLAYER: {playerName.toUpperCase()}
          </div>
        )}

        <div className="badge badge-blue">
          <Terminal size={12} />
          ALGORITHM: MINIMAX
        </div>

        <div className="badge badge-cyan">
          <ShieldCheck size={12} />
          UNBEATABLE AI
        </div>

        {gameStatus === 'AI_THINKING' && (
          <div className="badge badge-amber">
            <Activity size={12} className="animate-spin" />
            AI EVALUATING
          </div>
        )}
      </div>

      <div className="nav-actions">
        {!isForegroundOpen && onOpenGameArena && (
          <button
            className="btn-cmd btn-cmd-primary glow-border"
            onClick={onOpenGameArena}
            title="Open Interactive Foreground Game Window"
          >
            <Gamepad2 size={15} />
            Play in Arena
          </button>
        )}

        <button
          className="btn-cmd"
          onClick={onReset}
          title="Reset simulation and board to initial state"
        >
          <RotateCcw size={14} />
          Reset Simulation
        </button>

        <button
          className={`btn-cmd ${isPresentationMode ? 'btn-cmd-primary' : ''}`}
          onClick={onTogglePresentation}
          title="Toggle Seminar Presentation Mode (Optimized for Projector)"
        >
          <Presentation size={15} />
          {isPresentationMode ? 'Exit Presentation' : 'Presentation Mode'}
        </button>
      </div>
    </header>
  );
}

