import React, { useState } from 'react';
import { Compass, GitCompare, Sparkles, Play, CheckCircle2 } from 'lucide-react';

export const SIMPLE_EXPLANATION_STEPS = [
  {
    step: 1,
    icon: Compass,
    title: '1. Possible Moves',
    heading: 'These are my possible moves.',
    message: 'The AI looks at the board and finds all empty squares where it can legally place its symbol.',
    highlight: 'Identifies all legal open squares on the 3×3 matrix.',
  },
  {
    step: 2,
    icon: GitCompare,
    title: '2. Compare Possibilities',
    heading: 'Let me compare the possibilities.',
    message: 'The AI calculates future game branches using Minimax to determine whether each move leads to a Win, Draw, or Loss.',
    highlight: 'Evaluates every candidate branch to calculate exact outcomes.',
  },
  {
    step: 3,
    icon: Sparkles,
    title: '3. Best Move!',
    heading: 'This is my best move!',
    message: 'Out of all evaluated possibilities, the AI chooses the single square with the highest guaranteed mathematical score.',
    highlight: 'Selects and deploys the optimal, unbeatable square.',
  },
];

export function ExplanationPanel() {
  const [activeStep, setActiveStep] = useState(1);
  const current = SIMPLE_EXPLANATION_STEPS.find((s) => s.step === activeStep) || SIMPLE_EXPLANATION_STEPS[0];
  const Icon = current.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4-Step Educational Visual Guide */}
      <div className="cyber-panel" style={{ padding: '22px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#FFFFFF', margin: 0, letterSpacing: '0.04em' }}>
              HOW THE AI MAKES DECISIONS — 3 SIMPLE STEPS
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--cute-sky)', margin: '4px 0 0 0' }}>
              "These are the possibilities → I'm comparing them → This is my best move."
            </p>
          </div>
          <span className="badge badge-mint">SEMINAR READY</span>
        </div>

        {/* 3 Clickable Step Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {SIMPLE_EXPLANATION_STEPS.map((s) => {
            const StepIcon = s.icon;
            const isActive = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step)}
                style={{
                  background: isActive ? 'rgba(56, 189, 248, 0.16)' : 'var(--bg-surface-2)',
                  borderColor: isActive ? 'var(--cute-sky)' : 'var(--border-subtle)',
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <StepIcon size={18} style={{ color: isActive ? 'var(--cute-sky)' : 'var(--text-muted)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700 }}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed View */}
        <div
          style={{
            background: 'var(--bg-surface-2)',
            border: '1.5px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(56, 189, 248, 0.16)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cute-sky)',
              }}
            >
              <Icon size={24} />
            </div>
            <div>
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                STEP {current.step} OF 3
              </span>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#FFFFFF', margin: '4px 0 0 0' }}>
                "{current.heading}"
              </h4>
            </div>
          </div>

          <p style={{ fontSize: '15px', color: '#FFFFFF', lineHeight: 1.6, margin: 0 }}>
            {current.message}
          </p>

          <div
            style={{
              background: 'rgba(52, 211, 153, 0.1)',
              borderLeft: '4px solid var(--cute-mint)',
              padding: '12px 16px',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} style={{ color: 'var(--cute-mint)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#E2E8F0', fontWeight: 600 }}>
              {current.highlight}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
