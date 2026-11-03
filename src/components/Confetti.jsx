import React, { useEffect, useState } from 'react';

const CONFETTI_COLORS = [
  '#F472B6', // Baby Pink
  '#38BDF8', // Soft Sky Blue
  '#C084FC', // Pastel Lavender
  '#34D399', // Mint Green
  '#FBBF24', // Sunny Gold
  '#FB923C', // Warm Peach
  '#FFFFFF', // Crisp White
];

export function Confetti({ active = false, duration = 3500 }) {
  const [pieces, setPieces] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      // Generate 45 cute confetti particles
      const newPieces = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // 0 to 100% width
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 8 + 6, // 6px to 14px
        delay: Math.random() * 0.4, // Staggered drop
        duration: Math.random() * 1.5 + 2.0, // 2s to 3.5s
        isCircle: Math.random() > 0.5,
        rotation: Math.random() * 360,
      }));

      setPieces(newPieces);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [active, duration]);

  if (!visible || pieces.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: p.isCircle ? `${p.size}px` : `${p.size * 1.5}px`,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '3px',
            boxShadow: `0 0 8px ${p.color}`,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(0.8);
          }
          20% {
            opacity: 1;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translateY(105vh) rotate(720deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

