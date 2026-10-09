import React from 'react';

interface MinionLogoProps {
  className?: string;
  size?: number;
}

export const MinionLogo: React.FC<MinionLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      aria-label="Minion Logo"
    >
      <defs>
        <linearGradient id="logoMinionYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE033" />
          <stop offset="100%" stopColor="#FFD60A" />
        </linearGradient>
        <linearGradient id="logoGoggleRim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7B8391" />
          <stop offset="50%" stopColor="#4B5361" />
          <stop offset="100%" stopColor="#313843" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="128" fill="#18191E" />

      {/* Pill body */}
      <rect x="116" y="96" width="280" height="320" rx="140" fill="url(#logoMinionYellow)" />

      {/* Headband strap */}
      <rect x="76" y="210" width="360" height="36" rx="18" fill="#1A1C23" />
      <rect x="76" y="213" width="360" height="10" rx="5" fill="#2B5BA8" opacity="0.8" />

      {/* Ear cups */}
      <rect x="68" y="180" width="36" height="96" rx="18" fill="#2B5BA8" />
      <rect x="72" y="188" width="16" height="80" rx="8" fill="#FFD60A" opacity="0.8" />
      <rect x="408" y="180" width="36" height="96" rx="18" fill="#2B5BA8" />
      <rect x="424" y="188" width="16" height="80" rx="8" fill="#FFD60A" opacity="0.8" />
      <path d="M 96 190 A 160 140 0 0 1 416 190" fill="none" stroke="#2B5BA8" strokeWidth="20" strokeLinecap="round" />

      {/* Goggle Eye */}
      <circle cx="256" cy="228" r="76" fill="url(#logoGoggleRim)" stroke="#20252D" strokeWidth="4" />
      <circle cx="256" cy="228" r="62" fill="#E2E8F0" />
      <circle cx="256" cy="228" r="32" fill="#6F441E" />
      <circle cx="256" cy="228" r="18" fill="#0F0F12" />
      <circle cx="246" cy="218" r="8" fill="#FFFFFF" />
      <circle cx="266" cy="236" r="3.5" fill="#FFFFFF" opacity="0.9" />

      {/* Playful grin */}
      <path d="M 206 332 Q 256 368 306 332" fill="none" stroke="#2D2305" strokeWidth="12" strokeLinecap="round" />
      <path d="M 236 345 Q 256 362 276 345" fill="#E63946" stroke="#2D2305" strokeWidth="2" />
    </svg>
  );
};
