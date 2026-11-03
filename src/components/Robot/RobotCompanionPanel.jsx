import React, { useState, useEffect } from 'react';
import { MiniRobot } from './MiniRobot.jsx';
import { RobotDialogue } from './RobotDialogue.jsx';
import { RobotAudio } from './RobotVoice.js';
import { Volume2, VolumeX, Bell, BellOff, Zap } from 'lucide-react';

const CLICK_DIALOGUES = [
  (name) => `Beep boop! You're doing great, ${name}! ✨`,
  (name) => `I'm checking 255,168 possibilities... no pressure, ${name}! 😋`,
  (name) => `Is that your secret masterplan, ${name}? 🤔`,
  (name) => `I love playing Tic-Tac-Toe with you, ${name}! 💖`,
  (name) => `Minimax says: best friends forever, ${name}! 🤖`,
  (name) => `Thinking really hard... look at my antenna glow! 💡`,
  (name) => `Need a cute hint, ${name}? The corners are cozy! 🐾`,
  (name) => `Can you find an unbeatable line, ${name}? Let's see! 🎮`,
];

export function RobotCompanionPanel({
  gameStatus,
  currentTurn,
  aiPlayer,
  humanPlayer,
  winner,
  lastHumanMove,
  onOpenAnalysisModal,
  // Optional Parent Synchronized Props
  playerName = 'Player',
  robotExpression: parentExpression,
  robotDialogue: parentDialogue,
  voiceEnabled: parentVoiceEnabled,
  onToggleVoice: parentToggleVoice,
  sfxEnabled: parentSfxEnabled,
  onToggleSfx: parentToggleSfx,
  onRobotClick: parentRobotClick,
  robotLookDirection: parentLookDirection = 'center',
}) {
  const [internalExpression, setInternalExpression] = useState('idle');
  const [internalDialogue, setInternalDialogue] = useState(() => `Alright, ${playerName}! Ready to challenge me? 🤖`);
  const [internalVoiceEnabled, setInternalVoiceEnabled] = useState(RobotAudio.voiceEnabled);
  const [internalSfxEnabled, setInternalSfxEnabled] = useState(RobotAudio.sfxEnabled);

  const expression = parentExpression !== undefined ? parentExpression : internalExpression;
  const dialogue = parentDialogue !== undefined ? parentDialogue : internalDialogue;
  const voiceEnabled = parentVoiceEnabled !== undefined ? parentVoiceEnabled : internalVoiceEnabled;
  const sfxEnabled = parentSfxEnabled !== undefined ? parentSfxEnabled : internalSfxEnabled;

  const handleToggleVoice = () => {
    if (parentToggleVoice) {
      parentToggleVoice();
    } else {
      const next = !internalVoiceEnabled;
      setInternalVoiceEnabled(next);
      RobotAudio.voiceEnabled = next;
      if (!next) RobotAudio.stopSpeaking();
    }
  };

  const handleToggleSfx = () => {
    if (parentToggleSfx) {
      parentToggleSfx();
    } else {
      const next = !internalSfxEnabled;
      setInternalSfxEnabled(next);
      RobotAudio.sfxEnabled = next;
    }
  };

  // Only run internal reaction effect if parent props are NOT provided
  useEffect(() => {
    if (parentExpression !== undefined) return;

    if (gameStatus === 'WON') {
      if (winner === aiPlayer) {
        setInternalExpression('winning');
        const text = `YAYYY! I won, ${playerName}! That was fun! 🎉`;
        setInternalDialogue(text);
        RobotAudio.playSfx('fanfare');
        RobotAudio.speak(text);
      } else {
        setInternalExpression('losing');
        const text = `Whaaat, ${playerName}?! You beat me! You're really good! 🥺`;
        setInternalDialogue(text);
        RobotAudio.playSfx('loss');
        RobotAudio.speak(text);
      }
    } else if (gameStatus === 'DRAW') {
      setInternalExpression('draw');
      const text = `Look at us, ${playerName}! We're equally clever! 🤝`;
      setInternalDialogue(text);
      RobotAudio.playSfx('draw');
      RobotAudio.speak(text);
    } else if (gameStatus === 'AI_THINKING') {
      setInternalExpression('thinking');
      const text = `Hmmm, ${playerName}... let me think! 🧠`;
      setInternalDialogue(text);
      RobotAudio.playSfx('think');
      RobotAudio.speak(text);
    } else if (gameStatus === 'AI_READY') {
      setInternalExpression('excited');
      const text = `Found my perfect move, ${playerName}! ✨`;
      setInternalDialogue(text);
      RobotAudio.playSfx('chirp');
      RobotAudio.speak(text);
    } else if (currentTurn === humanPlayer) {
      if (lastHumanMove) {
        setInternalExpression('analysing');
        setInternalDialogue(`Nice move, ${playerName}!`);
      } else {
        setInternalExpression('idle');
        setInternalDialogue(`Alright, ${playerName}! Ready to challenge me? 🤖`);
      }
    }
  }, [parentExpression, gameStatus, currentTurn, aiPlayer, humanPlayer, winner, lastHumanMove, playerName]);

  const handleRobotClick = () => {
    if (parentRobotClick) {
      parentRobotClick();
    } else {
      RobotAudio.playSfx('chirp');
      setInternalExpression('playful');
      const generator = CLICK_DIALOGUES[Math.floor(Math.random() * CLICK_DIALOGUES.length)];
      const randomLine = generator(playerName);
      setInternalDialogue(randomLine);
      RobotAudio.speak(randomLine);

      setTimeout(() => {
        setInternalExpression(currentTurn === aiPlayer ? 'thinking' : 'idle');
      }, 2800);
    }
  };

  return (
    <div className="robot-companion-card cyber-panel">
      {/* Companion Header */}
      <div className="companion-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-dot" style={{ background: '#00F0FF' }}></span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
            MINI &bull; AI OPPONENT
          </span>
        </div>

        {/* Audio Control Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn-cmd btn-cmd-icon voice-toggle-btn"
            onClick={handleToggleSfx}
            title={sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {sfxEnabled ? (
              <Bell size={13} style={{ color: 'var(--accent-cyan)' }} />
            ) : (
              <BellOff size={13} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>

          <button
            type="button"
            className="btn-cmd btn-cmd-icon voice-toggle-btn"
            onClick={handleToggleVoice}
            title={voiceEnabled ? 'Mute Robot Voice' : 'Enable Robot Voice'}
          >
            {voiceEnabled ? (
              <Volume2 size={13} style={{ color: 'var(--accent-cyan)' }} />
            ) : (
              <VolumeX size={13} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Robot Character Display & Speech Bubble */}
      <div className="companion-body">
        <RobotDialogue
          text={dialogue}
          speaker="MINI"
          mood={expression}
          voiceEnabled={voiceEnabled}
          onToggleVoice={handleToggleVoice}
          sfxEnabled={sfxEnabled}
          onToggleSfx={handleToggleSfx}
          placement="top"
        />

        <div style={{ margin: '6px 0 10px 0', position: 'relative' }}>
          <MiniRobot
            expression={expression}
            lookDirection={parentLookDirection}
            size="small"
            isInteractive={true}
            onClick={handleRobotClick}
          />
        </div>

        {/* Click hint */}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          (Click MINI to chat or get a reaction)
        </span>
      </div>

      {/* Fast link to open thinking analysis modal if AI is ready */}
      {gameStatus === 'AI_READY' && onOpenAnalysisModal && (
        <button
          type="button"
          className="btn-cmd btn-cmd-primary glow-border"
          style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px' }}
          onClick={onOpenAnalysisModal}
        >
          <Zap size={14} /> Open MINI's Mind Matrix
        </button>
      )}
    </div>
  );
}
