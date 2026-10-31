import React from 'react';
import { cn } from '@/lib/utils';

export const LogoEmblem = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 120 120"
    className={cn('aspect-square select-none shrink-0', className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E6CF9E" />
        <stop offset="50%" stopColor="#C9A66B" />
        <stop offset="100%" stopColor="#A88245" />
      </linearGradient>
      <linearGradient id="emblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3929" />
        <stop offset="100%" stopColor="#0F2016" />
      </linearGradient>
    </defs>

    <circle cx="60" cy="60" r="56" fill="url(#emblemBg)" stroke="url(#emblemGold)" strokeWidth="1.5" />
    <circle cx="60" cy="60" r="51" fill="none" stroke="url(#emblemGold)" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.6" />

    {/* Olive / Laurel Leaves */}
    <g fill="none" stroke="url(#emblemGold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
      <path d="M 32 68 C 30 50, 36 34, 60 25" />
      <path d="M 32 58 Q 28 54 33 50" />
      <path d="M 36 48 Q 32 44 38 41" />
      <path d="M 43 38 Q 40 33 47 32" />
      <path d="M 88 68 C 90 50, 84 34, 60 25" />
      <path d="M 88 58 Q 92 54 87 50" />
      <path d="M 84 48 Q 88 44 82 41" />
      <path d="M 77 38 Q 80 33 73 32" />
    </g>

    {/* Royal Diadem */}
    <path d="M 52 32 L 60 27 L 68 32 L 65 35 L 55 35 Z" fill="url(#emblemGold)" opacity="0.9" />

    {/* Serif Monogram PR */}
    <g fill="url(#emblemGold)">
      <path d="M 44 44 H 56 C 62 44, 65 47, 65 52 C 65 57, 62 60, 56 60 H 48.5 V 74 H 44 V 44 Z M 48.5 48 V 56.5 H 55.5 C 58.5 56.5, 60.5 54.8, 60.5 52 C 60.5 49.2, 58.5 48, 55.5 48 Z" />
      <path d="M 64 54 H 74 C 79 54, 82 56.5, 82 60 C 82 63.5, 79 66, 74 66 H 68 V 74 H 64 V 54 Z M 68 57.5 V 62.5 H 73.5 C 75.8 62.5, 77.5 61.5, 77.5 60 C 77.5 58.5, 75.8 57.5, 73.5 57.5 Z M 72 65 L 81 74 H 75.5 L 67.5 66 Z" />
    </g>

    {/* Subtle Star */}
    <polygon points="60,82 61.2,85 64.5,85 61.8,87 62.8,90 60,88 57.2,90 58.2,87 55.5,85 58.8,85" fill="url(#emblemGold)" opacity="0.85" />
  </svg>
);

const Logo = ({ size = 'medium', className, showText = false, lightBg = false }) => {
  const sizeMap = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const emblemClass = sizeMap[size] || sizeMap.medium;

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <LogoEmblem className={emblemClass} />
      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-serif tracking-tight text-base font-semibold leading-none text-foreground">
            Peace Royal
          </span>
          <span className="text-[10px] tracking-widest uppercase font-medium text-muted-foreground mt-0.5">
            Baile na Síochána
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
