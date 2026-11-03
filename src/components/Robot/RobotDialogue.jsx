import React from 'react';
import { Volume2, VolumeX, Bell, BellOff } from 'lucide-react';

/**
 * RobotDialogue — Animated Cyber Dialogue Bubble with Subtitle Bar
 */
export function RobotDialogue({
  text = '',
  speaker = 'MINI',
  mood = 'idle',
  voiceEnabled = true,
  onToggleVoice,
  sfxEnabled = true,
  onToggleSfx,
  placement = 'top', // 'top' | 'bottom' | 'side'
}) {
  // Cute badge color mapping according to mood
  let moodBadgeClass = 'badge-blue';
  if (mood === 'winning' || mood === 'excited' || mood === 'happy') {
    moodBadgeClass = 'badge-pink';
  } else if (mood === 'losing') {
    moodBadgeClass = 'badge-red';
  } else if (mood === 'draw') {
    moodBadgeClass = 'badge-lavender';
  } else if (mood === 'thinking' || mood === 'analysing') {
    moodBadgeClass = 'badge-peach';
  } else if (mood === 'playful') {
    moodBadgeClass = 'badge-mint';
  }

  return (
    <div className={`robot-dialogue-bubble placement-${placement} animate-fade-in`}>
      <div className="dialogue-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="dialogue-speaker-name">{speaker}</span>
          <span className={`badge ${moodBadgeClass}`} style={{ fontSize: '9px', padding: '1px 8px' }}>
            {mood.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onToggleSfx && (
            <button
              className="btn-cmd btn-cmd-icon voice-toggle-btn"
              onClick={onToggleSfx}
              title={sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            >
              {sfxEnabled ? <Bell size={12} style={{ color: 'var(--accent-cyan)' }} /> : <BellOff size={12} style={{ color: 'var(--text-muted)' }} />}
            </button>
          )}

          {onToggleVoice && (
            <button
              className="btn-cmd btn-cmd-icon voice-toggle-btn"
              onClick={onToggleVoice}
              title={voiceEnabled ? 'Mute Robot Voice' : 'Unmute Robot Voice'}
            >
              {voiceEnabled ? <Volume2 size={13} style={{ color: 'var(--accent-cyan)' }} /> : <VolumeX size={13} style={{ color: 'var(--text-muted)' }} />}
            </button>
          )}
        </div>
      </div>

      <p className="dialogue-text">"{text}"</p>

      {/* Futuristic corner accent ticks */}
      <span className="dialogue-tick-tl"></span>
      <span className="dialogue-tick-br"></span>
    </div>
  );
}

