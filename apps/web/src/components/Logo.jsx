import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { HOTEL_IMAGES } from '@/config/siteContent.js';

export const LogoEmblem = ({ className = 'w-10 h-10' }) => {
  const [src, setSrc] = useState(HOTEL_IMAGES.logo || '/assets/images/logo.png');

  return (
    <div className={cn('relative aspect-square select-none shrink-0 flex items-center justify-center', className)}>
      <img
        src={src}
        alt="Peace Royal Resort"
        className="w-full h-full object-contain"
        onError={() => {
          if (src !== '/assets/images/peace-royal-logo.png') {
            setSrc('/assets/images/peace-royal-logo.png');
          }
        }}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

const Logo = ({ size = 'medium', className, showText = false, lightBg = false }) => {
  const sizeMap = {
    small: 'w-10 h-10',
    medium: 'w-12 h-12',
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
            Resort &middot; Gwarimpa
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
