import React from 'react';

interface SoundWaveLogoProps {
  size?: number;
  className?: string;
}

export const SoundWaveLogo: React.FC<SoundWaveLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="SoundWave Logo"
    >
      <defs>
        <linearGradient id="swYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE033" />
          <stop offset="100%" stopColor="#FFD60A" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="#18191E" stroke="#24252B" strokeWidth="3" />
      <g fill="url(#swYellowGrad)">
        <rect x="22" y="38" width="8" height="24" rx="4" />
        <rect x="34" y="24" width="8" height="52" rx="4" />
        <rect x="46" y="14" width="8" height="72" rx="4" />
        <rect x="58" y="28" width="8" height="44" rx="4" />
        <rect x="70" y="40" width="8" height="20" rx="4" />
      </g>
    </svg>
  );
};
