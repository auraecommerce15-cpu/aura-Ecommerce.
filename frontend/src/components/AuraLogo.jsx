import React from "react";

export const AuraLogoIcon = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="auraA1" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6D28D9" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
      <linearGradient id="auraA2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="auraFold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4C1D95" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    {/* Stylized geometric folded origami A */}
    <path
      d="M24 6L41 40H30.5L24 25.5L17.5 40H7L24 6Z"
      fill="url(#auraA1)"
    />
    <path
      d="M17.5 40L24 25.5L30.5 40H17.5Z"
      fill="url(#auraFold)"
    />
    <path
      d="M14 31H34L30.5 24H17.5L14 31Z"
      fill="url(#auraA2)"
    />
    <path
      d="M24 6L30.5 24H17.5L24 6Z"
      fill="#C4B5FD"
      opacity="0.95"
    />
  </svg>
);

const AuraLogo = ({ showText = true, textClassName = "text-2xl font-black tracking-wider text-slate-900", iconClassName = "w-8 h-8" }) => {
  return (
    <div className="flex items-center gap-2.5">
      <AuraLogoIcon className={iconClassName} />
      {showText && (
        <span className={textClassName}>
          AURA
        </span>
      )}
    </div>
  );
};

export default AuraLogo;
