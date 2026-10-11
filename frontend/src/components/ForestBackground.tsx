import React from 'react';

/**
 * Full-bleed organic jungle canvas: layered gradient, swaying canopy, hanging
 * liana vines, swinging monkeys, bobbing toucans and drifting fireflies.
 * Purely decorative — pointer-events are disabled so it never blocks the UI.
 */
export const ForestBackground: React.FC = () => {
  const fireflies = [
    { left: '12%', top: '18%', delay: '0s' },
    { left: '28%', top: '42%', delay: '1.4s' },
    { left: '48%', top: '26%', delay: '2.6s' },
    { left: '66%', top: '58%', delay: '0.8s' },
    { left: '82%', top: '34%', delay: '3.4s' },
    { left: '90%', top: '70%', delay: '2s' },
    { left: '38%', top: '74%', delay: '4.2s' },
    { left: '58%', top: '12%', delay: '1.1s' },
  ];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Layered organic jungle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#022c1e] via-[#064e3b] to-[#011c13]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.18),transparent_60%)]" />

      {/* Top canopy silhouette layer */}
      <svg
        className="absolute top-0 inset-x-0 w-full h-40 animate-canopy-sway opacity-90"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0 H1200 V70 C1120 110 1040 60 960 90 C880 120 800 70 720 95 C640 120 560 65 480 92 C400 119 320 68 240 96 C160 124 80 72 0 100 Z"
          fill="#064e3b"
        />
        <path
          d="M0 0 H1200 V40 C1100 80 1020 40 940 66 C860 92 780 46 700 70 C620 94 540 44 460 68 C380 92 300 46 220 72 C140 98 60 50 0 74 Z"
          fill="#047857"
          opacity="0.85"
        />
      </svg>

      {/* Hanging liana vines along borders */}
      <svg className="absolute top-0 left-0 w-24 h-72 animate-vine-sway" viewBox="0 0 60 220">
        <path d="M30 0 C20 60 40 120 26 220" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M30 40 C22 60 40 80 30 100" stroke="#22c55e" strokeWidth="3" fill="none" />
        <ellipse cx="24" cy="70" rx="6" ry="3" fill="#16a34a" transform="rotate(-30 24 70)" />
        <ellipse cx="38" cy="120" rx="6" ry="3" fill="#16a34a" transform="rotate(20 38 120)" />
      </svg>
      <svg className="absolute top-0 right-0 w-24 h-80 animate-vine-sway" viewBox="0 0 60 220">
        <path d="M30 0 C42 60 20 120 34 220" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="90" rx="6" ry="3" fill="#16a34a" transform="rotate(30 38 90)" />
        <ellipse cx="22" cy="150" rx="6" ry="3" fill="#16a34a" transform="rotate(-20 22 150)" />
      </svg>

      {/* Swinging monkey on a top vine */}
      <div className="absolute top-2 left-[22%] w-28 flex flex-col items-center animate-monkey-swing">
        <div className="w-0.5 h-14 bg-gradient-to-b from-[#15803d] to-[#166534]" />
        <svg width="46" height="46" viewBox="0 0 46 46">
          <circle cx="23" cy="26" r="11" fill="#78350f" />
          <circle cx="12" cy="20" r="5" fill="#78350f" />
          <circle cx="34" cy="20" r="5" fill="#78350f" />
          <circle cx="23" cy="16" r="9" fill="#92400e" />
          <circle cx="19" cy="15" r="2" fill="#fef3c7" />
          <circle cx="27" cy="15" r="2" fill="#fef3c7" />
          <circle cx="19" cy="15" r="1" fill="#1c1917" />
          <circle cx="27" cy="15" r="1" fill="#1c1917" />
          <path d="M19 20 Q23 24 27 20" stroke="#1c1917" strokeWidth="1.2" fill="none" />
          <path d="M14 34 C8 40 6 34 4 38" stroke="#78350f" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M32 34 C38 40 40 34 42 38" stroke="#78350f" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Chirping toucan */}
      <div className="absolute top-8 right-[30%] flex flex-col items-center animate-toucan-bob">
        <div className="w-0.5 h-8 bg-[#166534]" />
        <svg width="54" height="46" viewBox="0 0 54 46">
          <ellipse cx="22" cy="26" rx="13" ry="11" fill="#1c1917" />
          <circle cx="20" cy="18" r="8" fill="#f8fafc" />
          <circle cx="18" cy="17" r="2" fill="#0f172a" />
          <path d="M27 18 C40 16 50 22 52 26 C44 27 34 26 27 24 Z" fill="#f97316" />
          <path d="M27 22 C38 24 48 28 50 30 C42 31 33 29 27 26 Z" fill="#fb923c" />
          <ellipse cx="22" cy="30" rx="7" ry="6" fill="#f8fafc" />
          <circle cx="22" cy="30" r="3" fill="#ef4444" />
          <path d="M14 34 C10 40 8 38 6 42" stroke="#1c1917" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Drifting sparkling fireflies */}
      {fireflies.map((f, i) => (
        <span
          key={i}
          className="firefly-drift absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_4px_rgba(252,211,77,0.7)]"
          style={{ left: f.left, top: f.top, animationDelay: f.delay }}
        />
      ))}
    </div>
  );
};
