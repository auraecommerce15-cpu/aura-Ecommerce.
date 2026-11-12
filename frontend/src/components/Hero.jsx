import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-slate-950 text-white min-h-[82vh] md:min-h-[88vh] flex items-center overflow-hidden pt-12 pb-20">

      {/* ── Ambient Violet & Indigo Glow Lights ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[55%] h-[55%] bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Subtle Technical Grid Overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-10 w-full z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ─── Left Content ─── */}
          <div className="space-y-6 text-left">

            {/* Subtle Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide backdrop-blur-md">
              <Sparkles size={13} className="text-purple-400 animate-pulse" />
              <span>Next-Gen Tech Platform</span>
            </div>

            {/* Main Headline from the flyer */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-[4.75rem] font-black tracking-tight leading-[1.05]">
                Next-Gen <br />
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
                  Electronics
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300/90 max-w-lg leading-relaxed font-normal pt-1">
                Explore the latest tech with unbeatable prices.
              </p>
            </div>

            {/* CTA Button from the flyer */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link to="/products">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 h-12 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-purple-600/35 flex items-center gap-2.5 text-sm cursor-pointer"
                >
                  Shop Now <ArrowRight size={17} />
                </Button>
              </Link>
              <Link to="/deals">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-800 hover:border-purple-500/40 bg-slate-900/60 hover:bg-slate-900 text-slate-200 px-6 h-12 rounded-xl transition-all duration-300 text-sm font-semibold cursor-pointer backdrop-blur-sm"
                >
                  Explore Deals
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-900/80 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-purple-400" />
                <span>100% Genuine Tech</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-cyan-400" />
                <span>Fast Express Delivery</span>
              </div>
            </div>

          </div>

          {/* ─── Right: Glowing Neon Headphones Visual from the flyer ─── */}
          <div className="flex justify-center items-center relative">
            
            {/* Concentric Neon Halo */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-cyan-500/20 blur-[60px] pointer-events-none" />

            {/* Glow framing */}
            <div className="relative group w-full max-w-md lg:max-w-lg">
              <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-b from-purple-500/30 via-slate-800/60 to-transparent border border-purple-500/20 shadow-2xl backdrop-blur-sm">
                <img
                  src="/headphones-hero.jpg"
                  alt="Next-Gen Electronics - Premium Glowing Headphones"
                  width={640}
                  height={520}
                  className="w-full h-auto object-cover rounded-[22px] transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.src = "/luxury-hero.jpg";
                  }}
                />

                {/* Floating badge */}
                <div className="absolute bottom-5 left-5 bg-slate-950/85 border border-purple-500/30 text-white rounded-xl px-3.5 py-2.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Featured Flagship</span>
                    <span className="text-xs font-black text-purple-300">Ultra-Low Latency ANC</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
