import React from "react";

export const AuraLogoIcon = ({ className = "w-8 h-8" }) => (
  <img
    src="/favicon.svg"
    alt="AURA"
    className={`${className} object-contain shrink-0`}
  />
);

const AuraLogo = ({
  showText = true,
  textClassName = "text-2xl font-black tracking-wider text-slate-900 dark:text-white",
  iconClassName = "w-8 h-8",
}) => {
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
