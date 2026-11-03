import React from 'react';
import './MiniRobot.css';

/**
 * MINI — The Playful AI Robot Character
 * 100% Vector SVG & CSS3 animation.
 *
 * @param {'idle' | 'happy' | 'thinking' | 'confused' | 'confident' | 'excited' | 'playful'} expression
 * @param {'small' | 'medium' | 'large'} size
 * @param {boolean} isInteractive
 * @param {function} onClick
 */
export function MiniRobot({
  expression = 'idle',
  size = 'medium',
  isInteractive = true,
  onClick,
  lookDirection = 'center', // 'center' | 'left' | 'right' | 'board'
}) {
  const isWinning = expression === 'winning';
  const isExcited = expression === 'excited' || expression === 'happy';
  const isLosing = expression === 'losing';
  const isDraw = expression === 'draw';
  const isAnalysing = expression === 'analysing';
  const isThinking = expression === 'thinking';
  const isPointing = expression === 'pointing' || expression === 'ready';
  const isConfident = expression === 'confident';
  const isExecuting = expression === 'executing';
  const isDrawing = expression === 'drawing';
  const isWaving = expression === 'waving';
  const isPlayful = expression === 'playful';
  const isConfused = expression === 'confused';
  const isIdle =
    expression === 'idle' ||
    (!isWinning &&
      !isExcited &&
      !isLosing &&
      !isDraw &&
      !isAnalysing &&
      !isThinking &&
      !isPointing &&
      !isConfident &&
      !isExecuting &&
      !isDrawing &&
      !isWaving &&
      !isPlayful &&
      !isConfused);
  const isBlinking = isIdle || isConfident;
  const showCuteBlush = isIdle || isWinning || isExcited || isDraw || isPlayful || isConfident || isWaving;

  const isLookingLeft = lookDirection === 'left' || lookDirection === 'board' || isThinking || isDrawing || isAnalysing;
  const isLookingRight = lookDirection === 'right';

  return (
    <div
      className={`mini-robot-wrapper robot-size-${size} ${isInteractive ? 'robot-clickable' : ''}`}
      onClick={onClick}
      title={isInteractive ? 'Click MINI to interact!' : undefined}
    >
      <div className="mini-robot-motion-base robot-floating">
        <div className={`mini-robot-expression-layer expression-${expression}`}>
          <svg
            className="mini-robot-svg"
            viewBox="0 0 200 230"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
          <defs>
            {/* Metallic Head & Body Gradient */}
            <linearGradient id="miniChassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            {/* Dark Visor Gradient */}
            <linearGradient id="miniVisor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#080E1C" />
              <stop offset="100%" stopColor="#0B1328" />
            </linearGradient>

            {/* Cyan Energy Glow Gradient */}
            <linearGradient id="miniCyanEnergy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#168BFF" />
            </linearGradient>

            {/* Visor Glass Highlight */}
            <linearGradient id="visorGlassHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#00F0FF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Outer Cyan Glow Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ==============================================================
              1. ANTENNA & ENERGY BEACON
              ============================================================== */}
          <g className="robot-antenna">
            <line
              x1="100"
              y1="34"
              x2="100"
              y2="14"
              stroke="#94A3B8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Glowing Antenna Orb */}
            <circle
              cx="100"
              cy="12"
              r="7"
              fill="url(#miniCyanEnergy)"
              filter="url(#cyanGlow)"
            />
            <circle cx="100" cy="12" r="3" fill="#FFFFFF" />
          </g>

          {/* ==============================================================
              2. CONFUSED FLOATING QUESTION MARK (?)
              ============================================================== */}
          {isConfused && (
            <g className="robot-confused-mark" transform="translate(140, 10)">
              <text
                x="0"
                y="0"
                fill="#00F0FF"
                fontSize="22"
                fontWeight="bold"
                fontFamily="sans-serif"
                filter="url(#cyanGlow)"
              >
                ?
              </text>
            </g>
          )}

          {/* ==============================================================
              3. ROBOTIC HEAD CHASSIS
              ============================================================== */}
          <g className="robot-head">
            {/* Outer Head Capsule */}
            <rect
              x="42"
              y="32"
              width="116"
              height="88"
              rx="44"
              fill="url(#miniChassis)"
              stroke="rgba(0, 240, 255, 0.4)"
              strokeWidth="1.5"
            />

            {/* Head Side Ear Caps / Audio Sensors */}
            <rect
              x="36"
              y="60"
              width="8"
              height="32"
              rx="4"
              fill="#64748B"
              stroke="#00F0FF"
              strokeWidth="1"
            />
            <rect
              x="156"
              y="60"
              width="8"
              height="32"
              rx="4"
              fill="#64748B"
              stroke="#00F0FF"
              strokeWidth="1"
            />

            {/* Dark Face Visor */}
            <rect
              x="52"
              y="44"
              width="96"
              height="64"
              rx="32"
              fill="url(#miniVisor)"
              stroke="rgba(0, 240, 255, 0.25)"
              strokeWidth="1.2"
            />

            {/* Visor Glass Diagonal Gloss Highlight */}
            <path
              d="M 58 56 Q 100 48 142 56 L 140 68 Q 100 60 60 68 Z"
              fill="url(#visorGlassHighlight)"
            />

            {/* Cute Cheek Blush Marks */}
            {showCuteBlush && (
              <g className="cute-blush">
                <ellipse cx="64" cy="88" rx="6.5" ry="3.5" fill="#F472B6" opacity="0.75" />
                <ellipse cx="136" cy="88" rx="6.5" ry="3.5" fill="#F472B6" opacity="0.75" />
              </g>
            )}

            {/* ============================================================
                4. EXPRESSIVE EYES & VISOR DISPLAY
                ============================================================ */}

            {/* A. IDLE EXPRESSION (Friendly big cute eyes + dual shine reflections + sweet smile) */}
            {isIdle && (
              <g className={`${isBlinking ? 'eye-blink' : ''} ${isLookingLeft ? 'look-left' : isLookingRight ? 'look-right' : ''}`}>
                {/* Left Eye */}
                <rect
                  x="68"
                  y="60"
                  width="18"
                  height="26"
                  rx="9"
                  fill="#38BDF8"
                  filter="url(#cyanGlow)"
                />
                <circle cx="73" cy="67" r="4.5" fill="#FFFFFF" />
                <circle cx="80" cy="78" r="2.2" fill="#FFFFFF" />

                {/* Right Eye */}
                <rect
                  x="114"
                  y="60"
                  width="18"
                  height="26"
                  rx="9"
                  fill="#38BDF8"
                  filter="url(#cyanGlow)"
                />
                <circle cx="119" cy="67" r="4.5" fill="#FFFFFF" />
                <circle cx="126" cy="78" r="2.2" fill="#FFFFFF" />

                {/* Sweet Rounded Smile */}
                <path
                  d="M 93 92 Q 100 97 107 92"
                  stroke="#38BDF8"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* B. EXCITED / GOOD MOVE FOUND (Starry sparkling eyes + joyful open smile!) */}
            {isExcited && (
              <g className="eyes-excited">
                {/* Left Star Eye */}
                <path
                  className="star-sparkle"
                  d="M 77 60 L 80 67 L 87 70 L 80 73 L 77 80 L 74 73 L 67 70 L 74 67 Z"
                  fill="#FBBF24"
                  filter="url(#cyanGlow)"
                />
                <circle cx="77" cy="70" r="3" fill="#FFFFFF" />

                {/* Right Star Eye */}
                <path
                  className="star-sparkle"
                  d="M 123 60 L 126 67 L 133 70 L 126 73 L 123 80 L 120 73 L 113 70 L 120 67 Z"
                  fill="#FBBF24"
                  filter="url(#cyanGlow)"
                />
                <circle cx="123" cy="70" r="3" fill="#FFFFFF" />

                {/* Big Happy Open Smile */}
                <path
                  d="M 91 88 Q 100 102 109 88 Z"
                  fill="#F472B6"
                  stroke="#F472B6"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* C. WINNING / CELEBRATION (Joyful starburst eyes + big happy smile) */}
            {isWinning && (
              <g className="eyes-winning">
                <circle
                  cx="77"
                  cy="69"
                  r="12"
                  fill="#FBBF24"
                  filter="url(#cyanGlow)"
                />
                <circle cx="77" cy="69" r="6" fill="#FFFFFF" />
                <circle cx="83" cy="65" r="2.5" fill="#FFFFFF" />

                <circle
                  cx="123"
                  cy="69"
                  r="12"
                  fill="#FBBF24"
                  filter="url(#cyanGlow)"
                />
                <circle cx="123" cy="69" r="6" fill="#FFFFFF" />
                <circle cx="129" cy="65" r="2.5" fill="#FFFFFF" />

                {/* Big Joyful Smile */}
                <path
                  d="M 88 86 Q 100 102 112 86 Z"
                  fill="#F472B6"
                  filter="url(#cyanGlow)"
                />
              </g>
            )}

            {/* C. LOSING EXPRESSION (Sad downward eyes + drooping + animated falling teardrops!) */}
            {isLosing && (
              <g className="eyes-losing">
                {/* Downward sad curved eyes */}
                <path
                  d="M 68 74 Q 78 86 88 74"
                  stroke="#00F0FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#cyanGlow)"
                />
                <path
                  d="M 112 74 Q 122 86 132 74"
                  stroke="#00F0FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#cyanGlow)"
                />

                {/* Sad Trembling Mouth */}
                <path
                  d="M 93 94 Q 100 88 107 94"
                  stroke="#00F0FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Visible Animated Teardrops */}
                <g className="robot-teardrops-container">
                  <path
                    className="robot-teardrop tear-left"
                    d="M 76 77 C 73 81 71 86 75 89 C 79 89 80 85 76 77 Z"
                    fill="#38BDF8"
                    filter="url(#cyanGlow)"
                  />
                  <path
                    className="robot-teardrop tear-right"
                    d="M 124 77 C 121 81 119 86 123 89 C 127 89 128 85 124 77 Z"
                    fill="#38BDF8"
                    filter="url(#cyanGlow)"
                  />
                </g>
              </g>
            )}

            {/* D. DRAW EXPRESSION (Warm relaxed crescent eyes + friendly smile) */}
            {isDraw && (
              <g className="eyes-draw">
                <path
                  d="M 70 76 Q 80 64 90 76"
                  stroke="#00F0FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#cyanGlow)"
                />
                <path
                  d="M 110 76 Q 120 64 130 76"
                  stroke="#00F0FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#cyanGlow)"
                />
                {/* Friendly Smile */}
                <path
                  d="M 93 91 Q 100 96 107 91"
                  stroke="#00F0FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* E. THINKING EXPRESSION (Focused eyes + cyber scanning laser beam sweeping across) */}
            {isThinking && (
              <g className="eyes-thinking">
                {/* Laser Bar */}
                <g className="visor-scanner-beam">
                  <line
                    x1="100"
                    y1="60"
                    x2="100"
                    y2="92"
                    stroke="#00F0FF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#cyanGlow)"
                  />
                  <line
                    x1="100"
                    y1="60"
                    x2="100"
                    y2="92"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
                {/* Computing HUD Dots */}
                <circle cx="68" cy="76" r="2.5" fill="rgba(0, 240, 255, 0.5)" />
                <circle cx="78" cy="76" r="2.5" fill="rgba(0, 240, 255, 0.7)" />
                <circle cx="122" cy="76" r="2.5" fill="rgba(0, 240, 255, 0.7)" />
                <circle cx="132" cy="76" r="2.5" fill="rgba(0, 240, 255, 0.5)" />
                <path
                  d="M 95 90 L 105 90"
                  stroke="#00F0FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* F. ANALYSING EXPRESSION (Eyes shifted right, looking at holographic board display) */}
            {isAnalysing && (
              <g className="eyes-analysing">
                {/* Eyes shifted rightwards */}
                <circle
                  cx="85"
                  cy="72"
                  r="8.5"
                  fill="#00F0FF"
                  filter="url(#cyanGlow)"
                />
                <circle cx="87" cy="71" r="3" fill="#FFFFFF" />

                <circle
                  cx="127"
                  cy="72"
                  r="8.5"
                  fill="#00F0FF"
                  filter="url(#cyanGlow)"
                />
                <circle cx="129" cy="71" r="3" fill="#FFFFFF" />

                {/* Analytical HUD Dots on right visor edge */}
                <circle cx="138" cy="66" r="2" fill="#00F0FF" />
                <circle cx="140" cy="74" r="1.5" fill="#38BDF8" />
                <circle cx="138" cy="82" r="2" fill="#00F0FF" />

                {/* Attentive small mouth */}
                <path
                  d="M 94 91 Q 100 94 106 91"
                  stroke="#00F0FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* G. CONFIDENT / POINTING EXPRESSION (Smug sleek angled eye slits + smirk) */}
            {(isConfident || isPointing) && (
              <g className="eyes-confident">
                <path
                  d="M 68 70 L 88 75"
                  stroke="#00F0FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#cyanGlow)"
                />
                <path
                  d="M 132 70 L 112 75"
                  stroke="#00F0FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#cyanGlow)"
                />
                {/* Confident Smirk */}
                <path
                  d="M 94 91 Q 102 91 108 86"
                  stroke="#00F0FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* H. PLAYFUL EXPRESSION (Winking left eye, happy arched right eye) */}
            {isPlayful && (
              <g className="eyes-playful">
                {/* Wink line */}
                <path
                  d="M 68 76 Q 78 82 88 76"
                  stroke="#00F0FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#cyanGlow)"
                />
                {/* Happy arch eye */}
                <path
                  d="M 112 76 Q 122 62 132 76"
                  stroke="#00F0FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#cyanGlow)"
                />
                {/* Playful curved mouth */}
                <path
                  d="M 94 90 Q 102 96 109 89"
                  stroke="#00F0FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* I. CONFUSED EXPRESSION (Asymmetric quizzical eyes) */}
            {isConfused && (
              <g className="eyes-confused">
                <ellipse
                  cx="78"
                  cy="68"
                  rx="7"
                  ry="10"
                  fill="#00F0FF"
                  filter="url(#cyanGlow)"
                />
                <circle cx="78" cy="67" r="2.5" fill="#FFFFFF" />

                <line
                  x1="112"
                  y1="78"
                  x2="128"
                  y2="78"
                  stroke="#00F0FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#cyanGlow)"
                />
                <path
                  d="M 94 92 Q 100 89 106 91"
                  stroke="#00F0FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* J. EXECUTING EXPRESSION (Target lock crosshairs & energized visor) */}
            {isExecuting && (
              <g className="eyes-executing">
                {/* Left Targeting Reticle */}
                <circle cx="78" cy="72" r="12" fill="none" stroke="#00F0FF" strokeWidth="2" filter="url(#cyanGlow)" />
                <circle cx="78" cy="72" r="4" fill="#FFFFFF" />
                <line x1="62" y1="72" x2="94" y2="72" stroke="#00F0FF" strokeWidth="1.5" />
                <line x1="78" y1="56" x2="78" y2="88" stroke="#00F0FF" strokeWidth="1.5" />

                {/* Right Targeting Reticle */}
                <circle cx="122" cy="72" r="12" fill="none" stroke="#00F0FF" strokeWidth="2" filter="url(#cyanGlow)" />
                <circle cx="122" cy="72" r="4" fill="#FFFFFF" />
                <line x1="106" y1="72" x2="138" y2="72" stroke="#00F0FF" strokeWidth="1.5" />
                <line x1="122" y1="56" x2="122" y2="88" stroke="#00F0FF" strokeWidth="1.5" />

                {/* Confident energetic mouth */}
                <path
                  d="M 92 90 L 108 90"
                  stroke="#00F0FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>

          {/* ==============================================================
              5. ROBOTIC NECK JOINT & TORSO
              ============================================================== */}
          <g className="robot-body">
            {/* Neck Collar */}
            <rect
              x="84"
              y="118"
              width="32"
              height="10"
              rx="4"
              fill="#64748B"
              stroke="#00F0FF"
              strokeWidth="1"
            />

            {/* Main Rounded Torso */}
            <path
              d="M 62 126 C 62 126 50 144 50 174 C 50 190 70 198 100 198 C 130 198 150 190 150 174 C 150 144 138 126 138 126 Z"
              fill="url(#miniChassis)"
              stroke="rgba(0, 240, 255, 0.4)"
              strokeWidth="1.5"
            />

            {/* Chest Arc Reactor Core */}
            <circle
              cx="100"
              cy="160"
              r="14"
              fill="#080E1C"
              stroke="#64748B"
              strokeWidth="2"
            />
            <circle
              className="robot-core-pulse"
              cx="100"
              cy="160"
              r="9"
              fill="url(#miniCyanEnergy)"
              filter="url(#cyanGlow)"
            />
            <circle cx="100" cy="160" r="4" fill="#FFFFFF" />

            {/* Torso Detail Panel Lines */}
            <path
              d="M 68 142 L 82 142"
              stroke="rgba(0, 240, 255, 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M 118 142 L 132 142"
              stroke="rgba(0, 240, 255, 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* ==============================================================
              6. ROBOTIC ARMS & HANDS
              ============================================================== */}
          {isDrawing ? (
            /* Digital Stylus Drawing Arm extending towards board */
            <g className="robot-arms-drawing">
              <ellipse
                cx="38"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(15 38 146)"
              />
              <circle cx="33" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />

              <g className="arm-drawing-stylus">
                <path
                  d="M 148 140 Q 172 122 198 112"
                  stroke="#94A3B8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="198" cy="112" r="7.5" fill="#64748B" stroke="#00F0FF" strokeWidth="1" />
                <line x1="198" y1="112" x2="224" y2="100" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />
                <polygon points="224,96 234,98 224,104" fill="#00F0FF" filter="url(#cyanGlow)" />
                <circle cx="232" cy="98" r="3.5" fill="#FFFFFF" />
              </g>
            </g>
          ) : isWaving ? (
            /* Introduction Greeting Wave */
            <g className="robot-arms-waving">
              <ellipse
                cx="38"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(15 38 146)"
              />
              <circle cx="33" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />

              <g className="arm-wave-active">
                <path
                  d="M 148 136 Q 166 110 168 84"
                  stroke="#94A3B8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="168" cy="82" r="7" fill="#00F0FF" filter="url(#cyanGlow)" />
                <circle cx="174" cy="74" r="3" fill="#FBBF24" className="star-sparkle" />
              </g>
            </g>
          ) : isWinning || isExcited ? (
            /* Celebration / Victory Arms raised high */
            <g className="robot-arms-raised">
              {/* Left Arm Raised */}
              <path
                d="M 52 136 Q 28 118 36 94"
                stroke="#94A3B8"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="36" cy="92" r="7" fill="#00F0FF" filter="url(#cyanGlow)" />

              {/* Right Arm Raised */}
              <path
                d="M 148 136 Q 172 118 164 94"
                stroke="#94A3B8"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="164" cy="92" r="7" fill="#00F0FF" filter="url(#cyanGlow)" />
            </g>
          ) : isLosing ? (
            /* Losing / Drooping shoulders & low hanging arms */
            <g className="robot-arms-drooping">
              <ellipse
                cx="42"
                cy="164"
                rx="6"
                ry="20"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(6 42 164)"
              />
              <circle cx="44" cy="182" r="5" fill="#38BDF8" opacity="0.6" />

              <ellipse
                cx="158"
                cy="164"
                rx="6"
                ry="20"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(-6 158 164)"
              />
              <circle cx="156" cy="182" r="5" fill="#38BDF8" opacity="0.6" />
            </g>
          ) : isDraw ? (
            /* Draw: Friendly Thumbs-Up Gesture */
            <g className="robot-arms-draw">
              {/* Left Arm relaxed */}
              <ellipse
                cx="38"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(15 38 146)"
              />
              <circle cx="33" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />

              {/* Right Arm Thumbs Up */}
              <g className="arm-thumbs-up">
                <path
                  d="M 148 142 Q 170 148 172 126"
                  stroke="#94A3B8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="172" cy="126" r="7" fill="#64748B" />
                <path
                  d="M 172 126 L 172 110"
                  stroke="#94A3B8"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle cx="172" cy="108" r="4.5" fill="#00F0FF" filter="url(#cyanGlow)" />
              </g>
            </g>
          ) : isPointing || isExecuting ? (
            /* Pointing towards the board / Executing move */
            <g className="robot-arms-pointing">
              <ellipse
                cx="38"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(15 38 146)"
              />
              <circle cx="33" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />

              <g className="arm-pointing">
                <path
                  d="M 148 140 L 194 128"
                  stroke="#94A3B8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="194" cy="128" r="8" fill="#00F0FF" filter="url(#cyanGlow)" />
                <circle cx="194" cy="128" r="4" fill="#FFFFFF" />
                {isExecuting && (
                  <circle
                    cx="198"
                    cy="128"
                    r="14"
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="2"
                    opacity="0.8"
                    className="energy-flare"
                  />
                )}
              </g>
            </g>
          ) : isThinking ? (
            /* Thinking Arm towards Chin */
            <g className="robot-arms-thinking">
              <ellipse
                cx="38"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(15 38 146)"
              />
              <circle cx="33" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />

              <g className="arm-thinking">
                <path
                  d="M 152 142 Q 168 152 148 116"
                  stroke="#94A3B8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="148" cy="114" r="7" fill="#00F0FF" filter="url(#cyanGlow)" />
              </g>
            </g>
          ) : isAnalysing ? (
            /* Analysing gesture towards holographic display */
            <g className="robot-arms-analysing">
              <ellipse
                cx="38"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(15 38 146)"
              />
              <circle cx="33" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />

              <g className="arm-analysing">
                <path
                  d="M 150 140 Q 172 136 182 122"
                  stroke="#94A3B8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <circle cx="182" cy="122" r="6.5" fill="#00F0FF" filter="url(#cyanGlow)" />
              </g>
            </g>
          ) : (
            /* Default / Idle Arms */
            <g className="robot-arms-default">
              <ellipse
                cx="38"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(15 38 146)"
              />
              <circle cx="33" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />

              <ellipse
                cx="162"
                cy="146"
                rx="6"
                ry="18"
                fill="url(#miniChassis)"
                stroke="#64748B"
                strokeWidth="1.5"
                transform="rotate(-15 162 146)"
              />
              <circle cx="167" cy="166" r="6" fill="#00F0FF" filter="url(#cyanGlow)" />
            </g>
          )}

          {/* ==============================================================
              7. HOVER THRUSTER & ION ENERGY RING
              ============================================================== */}
          <g className="robot-thruster" transform="translate(0, 196)">
            {/* Thruster Nozzle */}
            <ellipse
              cx="100"
              cy="2"
              rx="24"
              ry="6"
              fill="#1E293B"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            {/* Glowing Ion Beam Rings */}
            <ellipse
              className="thruster-glow"
              cx="100"
              cy="10"
              rx="18"
              ry="5"
              fill="url(#miniCyanEnergy)"
              filter="url(#cyanGlow)"
            />
            <ellipse cx="100" cy="18" rx="10" ry="3" fill="#00F0FF" opacity="0.6" />
          </g>
        </svg>
        </div>
      </div>
    </div>
  );
}
