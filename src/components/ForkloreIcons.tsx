import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const SpoonIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C10.5 2 9 3 9 5.5C9 7 10 8 11 8.5V20C11 21 13 21 13 20V8.5C14 8 15 7 15 5.5C15 3 13.5 2 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ForkIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 2V8M12 2V8M16 2V8M8 8C8 10 9 11 10 11.5V20C10 21 14 21 14 20V11.5C15 11 16 10 16 8M8 8H16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FlameIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3C10 7 8 9 8 13C8 17 10 20 12 20C14 20 16 17 16 13C16 9 14 7 12 3Z"
      fill={color}
      opacity="0.3"
    />
    <path
      d="M12 3C10 7 8 9 8 13C8 17 10 20 12 20C14 20 16 17 16 13C16 9 14 7 12 3ZM12 7C11 9 10 10 10 12C10 14 11 15 12 15C13 15 14 14 14 12C14 10 13 9 12 7Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LeafIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 18C4 13 7 8 12 6C17 4 20 4 20 4C20 4 20 7 18 12C16 17 11 20 6 20C4 20 4 18 4 18Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M10 14L18 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const MixingBowlIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 10C5 10 5.5 8 8 8C10.5 8 11 10 13 10C15 10 15.5 8 18 8C20.5 8 21 10 21 10L19 18C19 19 18 20 17 20H9C8 20 7 19 7 18L5 10Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="14" r="1" fill={color} />
    <circle cx="14" cy="15" r="1" fill={color} />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

export const RecipeBookIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 3H18C19 3 20 4 20 5V19C20 20 19 21 18 21H6C5 21 4 20 4 19V3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 3V19C4 20 5 21 6 21H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 8H16M8 12H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 2L20 4L18 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CookingPotIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 10H19V18C19 19 18 20 17 20H7C6 20 5 19 5 18V10Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 6V10M12 5V10M16 6V10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const HourglassIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 2H16V8L12 12L16 16V22H8V16L12 12L8 8V2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 2H16M8 22H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 6H15L12 10L9 6Z" fill={color} opacity="0.4" />
  </svg>
);

export const CuttingBoardIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="16" height="14" rx="2" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="4" r="1.5" fill={color} />
    <path d="M16 12L18 10M16 15L19 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const DinnerPlateIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" fill={color} opacity="0.3" />
  </svg>
);

export const HeartSpoonIcon = ({ size = 24, color = 'currentColor', className = '', filled = false }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21C12 21 4 15 4 10C4 7 6 5 8 5C9.5 5 11 6 12 7C13 6 14.5 5 16 5C18 5 20 7 20 10C20 15 12 21 12 21Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {!filled && (
      <path d="M12 10V16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    )}
  </svg>
);

export const CommentForkIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 6C3 5 4 4 5 4H19C20 4 21 5 21 6V15C21 16 20 17 19 17H8L3 21V6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 9V11M12 9V11M14 9V11M10 11H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CookbookIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 3H18C19 3 20 4 20 5V19C20 20 19 21 18 21H6C5 21 4 20 4 19V5C4 4 5 3 6 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 3V21" stroke={color} strokeWidth="2" />
    <path d="M8 8H11M13 8H16M8 12H11M13 12H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const WheatIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 4L9 7L12 10M12 4L15 7L12 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8L9 11L12 14M12 8L15 11L12 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12L9 15L12 18M12 12L15 15L12 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChefHatsIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 12C6 10 7 9 8 9C8 7 10 6 12 6C14 6 16 7 16 9C17 9 18 10 18 12V18H6V12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M6 15H18" stroke={color} strokeWidth="2" />
  </svg>
);

export const LightbulbForkIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C9 2 7 4 7 7C7 9 8 10 9 12V15H15V12C16 10 17 9 17 7C17 4 15 2 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 15V17C9 18 10 19 11 19H13C14 19 15 18 15 17V15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 8V9M12 8V9M14 8V9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SearchMagnifyIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <path d="M16 16L21 21M16 16C16 16 15 17 15 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FilterFunnelIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 4H20L14 12V19L10 21V12L4 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 4L6 2M20 4L18 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const AppleNutritionIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3C8 3 5 7 5 11C5 15 8 21 12 21C16 21 19 15 19 11C19 7 16 3 12 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 3C12 3 13 2 14 2C15 2 15 3 15 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 10H14M10 13H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const WandSparklesIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20L14 10M14 10L16 8L18 10L16 12L14 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 4V6M8 5H6M8 5H10M20 8V10M20 9H18M20 9H22M18 16V18M18 17H16M18 17H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CheckSpoonIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LoadingSpoonForkIcon = ({ size = 24, color = 'currentColor', className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C10.5 2 9 3 9 5.5C9 6.5 9.5 7 10 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 8C16 9 15 10 14 10.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);
