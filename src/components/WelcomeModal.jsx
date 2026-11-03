import React, { useState, useEffect } from 'react';
import { MiniRobot } from './Robot/MiniRobot.jsx';
import { RobotAudio } from './Robot/RobotVoice.js';
import { Sparkles, User, Play, Heart, Bot } from 'lucide-react';
import '../styles/welcomeModal.css';

export function WelcomeModal({ isOpen, onStartGame, initialName = '' }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('mini_intro_played') === 'true') {
      return 'name_input';
    }
    return 'intro';
  });

  // Trigger opening introduction when modal opens in intro phase
  useEffect(() => {
    if (isOpen && phase === 'intro') {
      const introText =
        "Heyyyy! MINI here! 🤖 I'm SO excited to show you how Tic-Tac-Toe works! We'll play a little game, and I'll show you how I think before making my moves. Ready? Let's gooo!";
      RobotAudio.playSfx('chirp');
      RobotAudio.speak(introText, { pitch: 1.28, rate: 0.96 });
    }
  }, [isOpen, phase]);

  if (!isOpen) return null;

  const handleProceedToName = () => {
    RobotAudio.stopSpeaking();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mini_intro_played', 'true');
    }
    setPhase('name_input');
    const promptText = 'First, tell me what I should call you!';
    RobotAudio.playSfx('chirp');
    RobotAudio.speak(promptText, { pitch: 1.28, rate: 0.96 });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please tell me your name so I know what to call you! 😊');
      return;
    }
    if (trimmed.length > 20) {
      setError('That name is a little long! Could you shorten it to 20 letters or less?');
      return;
    }
    setError('');

    // Mark intro played in case entered directly
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mini_intro_played', 'true');
    }

    setPhase('greeting');
    const greeting = `Yayyy! Nice to meet you, ${trimmed}! Let's play!`;
    RobotAudio.playSfx('chirp');
    RobotAudio.speak(greeting, { pitch: 1.28, rate: 0.96 });

    setTimeout(() => {
      onStartGame(trimmed);
    }, 750);
  };

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true">
      <div className="welcome-card animate-pop-in">
        
        {/* ===================================================================
            1. ADORABLE TOP HEADER
            =================================================================== */}
        <div className="welcome-header">
          <div className="welcome-badge">
            <Heart size={14} className="welcome-heart-icon" />
            <span>MINIMAX AI LAB • ARCADE COMPANION</span>
          </div>
          <h2 className="welcome-title">
            {phase === 'intro' ? 'MEET MINI! 🤖' : phase === 'greeting' ? 'YAYYY! LET’S PLAY! 🎉' : 'HEY THERE, PLAYER! 💗'}
          </h2>
        </div>

        {/* ===================================================================
            2. ROBOT GREETING & SPEECH SHOWCASE
            =================================================================== */}
        <div className="welcome-robot-showcase">
          <div className="welcome-speech-bubble">
            {phase === 'intro' ? (
              <p>
                "Heyyyy! <strong>MINI</strong> here! 🤖 I'm SO excited to show you how Tic-Tac-Toe works! We'll play a little game, and I'll show you how I think before making my moves. Ready? Let's gooo!"
              </p>
            ) : phase === 'greeting' ? (
              <p>
                "Yayyy! Nice to meet you, <strong>{name.trim()}</strong>! Let's play!"
              </p>
            ) : (
              <p>
                "First, tell me what I should call you! ✨"
              </p>
            )}
            <span className="bubble-tail"></span>
          </div>

          <div className="welcome-robot-avatar">
            <MiniRobot
              size="medium"
              expression={phase === 'intro' ? 'waving' : phase === 'greeting' ? 'winning' : 'excited'}
              isInteractive={false}
            />
          </div>
        </div>

        {/* ===================================================================
            3. INTERACTIVE PHASE BODY (INTRO vs NAME INPUT vs GREETING)
            =================================================================== */}
        {phase === 'intro' ? (
          <div className="welcome-intro-actions">
            <button
              type="button"
              className="btn-welcome-submit"
              onClick={handleProceedToName}
              autoFocus
            >
              <Play size={18} fill="currentColor" />
              <span>READY? LET'S GOOO! 🚀</span>
            </button>
          </div>
        ) : phase === 'name_input' ? (
          <form onSubmit={handleSubmit} className="welcome-form">
            <div className="input-group">
              <label htmlFor="player-name-input" className="input-label">
                <User size={14} /> YOUR GAMER TAG:
              </label>
              <div className="input-wrapper">
                <input
                  id="player-name-input"
                  type="text"
                  className={`welcome-input ${error ? 'input-error' : ''}`}
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  maxLength={20}
                  autoFocus
                  autoComplete="off"
                />
                <Sparkles size={16} className="input-sparkle" />
              </div>
              {error && <span className="welcome-error-msg">{error}</span>}
            </div>

            <button type="submit" className="btn-welcome-submit">
              <Play size={18} fill="currentColor" />
              <span>LET'S PLAY!</span>
            </button>
          </form>
        ) : (
          <div className="welcome-greeting-loader">
            <div className="badge badge-mint" style={{ padding: '8px 18px', fontSize: '13px' }}>
              <Bot size={16} /> Opening MINI's Arcade Arena...
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
