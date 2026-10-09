import React from 'react';

interface SoundWaveLogoProps {
  size?: number;
  className?: string;
}

export const SoundWaveLogo: React.FC<SoundWaveLogoProps> = ({ size = 36, className = '' }) => {
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
        <linearGradient id="soundwaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1ED760" />
          <stop offset="100%" stopColor="#1DB954" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#121212" stroke="#282828" strokeWidth="2" />
      <g fill="url(#soundwaveGrad)">
        <rect x="22" y="38" width="6" height="24" rx="3" />
        <rect x="32" y="26" width="6" height="48" rx="3" />
        <rect x="42" y="16" width="6" height="68" rx="3" />
        <rect x="52" y="24" width="6" height="52" rx="3" />
        <rect x="62" y="32" width="6" height="36" rx="3" />
        <rect x="72" y="42" width="6" height="16" rx="3" />
      </g>
    </svg>
  );
};
