import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";

const PageHero = ({
  badge = "AURA PREMIUM TECH",
  title = "Explore Our Collection",
  subtitle = "Discover high-performance electronics engineered for the modern digital era.",
  breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/products" }
  ],
  rightIcon: RightIcon = null,
  gradientText = ""
}) => {
  return (
    <div className="relative w-full bg-gradient-to-r from-[#070918] via-[#11052C] to-[#251052] text-white py-10 sm:py-12 md:py-14 overflow-hidden border-b border-purple-900/30">
      
      {/* ── Ambient Radial Purple Halos ── */}
      <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-[#7C3AED]/25 blur-[90px] pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-[240px] h-[240px] rounded-full bg-[#6D28D9]/20 blur-[80px] pointer-events-none" />

      {/* ── Subtle Technical Grid Overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left Text & Breadcrumbs */}
          <div className="space-y-3 max-w-2xl text-left">
            
            {/* Breadcrumb row */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={13} className="text-slate-600" />}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-purple-400 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-purple-300 font-bold">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Eyebrow Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                <Sparkles size={11} className="text-purple-400 animate-pulse" />
                <span>{badge}</span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {title}{" "}
              {gradientText && (
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">
                  {gradientText}
                </span>
              )}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Icon / Accent */}
          {RightIcon && (
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-purple-600/15 border border-purple-500/30 backdrop-blur-md flex items-center justify-center shadow-2xl text-purple-400">
                <RightIcon size={44} strokeWidth={1.5} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PageHero;
