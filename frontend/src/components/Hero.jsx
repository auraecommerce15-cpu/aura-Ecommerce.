import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title1: "Next-Gen",
      title2: "Electronics",
      subtitle: "Explore the latest tech with unbeatable prices.",
      link: "/products",
      image: "/headphones-hero.jpg"
    },
    {
      title1: "Studio Pro",
      title2: "Flagships",
      subtitle: "Immersive noise cancellation and acoustic precision.",
      link: "/products?category=Headphones",
      image: "/headphones-hero.jpg"
    },
    {
      title1: "Ultra-Fast",
      title2: "Laptops",
      subtitle: "Unleash extreme power for creatives and developers.",
      link: "/products?category=Laptops",
      image: "/headphones-hero.jpg"
    },
    {
      title1: "Smart Living",
      title2: "Wearables",
      subtitle: "Stay connected with precision health and fitness tracking.",
      link: "/products?category=Smartwatches",
      image: "/headphones-hero.jpg"
    }
  ];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const current = slides[currentSlide];

  return (
    <section className="relative w-full bg-[#0B0A16] text-white overflow-hidden py-10 md:py-16 lg:py-20 select-none">
      
      {/* ── Background Glow & Radial Purple Halo ── */}
      <div className="absolute top-1/2 right-[18%] -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-[#7C3AED]/25 blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#6D28D9]/15 blur-[100px] pointer-events-none" />

      {/* ── Carousel Left Arrow (<) ── */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer"
      >
        <ChevronLeft size={22} />
      </button>

      {/* ── Carousel Right Arrow (>) ── */}
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer"
      >
        <ChevronRight size={22} />
      </button>

      <div className="max-w-7xl mx-auto px-10 md:px-16 w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* ─── Left Copy Matching Mockup ─── */}
          <div className="space-y-4 md:space-y-6 text-left">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                {current.title1}
                <span className="block text-[#A855F7] drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                  {current.title2}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal mt-3.5 max-w-md leading-relaxed">
                {current.subtitle}
              </p>
            </div>

            {/* CTA Button matching pill in mockup */}
            <div className="pt-2">
              <Link to={current.link}>
                <Button
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-7 h-11 sm:h-12 rounded-full transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-purple-600/30 flex items-center gap-2 text-sm cursor-pointer"
                >
                  Shop Now <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          {/* ─── Right Visual Matching Mockup ─── */}
          <div className="relative flex justify-center items-center">
            
            {/* Luminous Purple Circular Accent Disk */}
            <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full bg-gradient-to-tr from-[#6D28D9]/40 via-[#8B5CF6]/30 to-[#C084FC]/20 blur-xl pointer-events-none" />
            
            <div className="relative w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[480px]">
              <img
                src={current.image}
                alt={`${current.title1} ${current.title2}`}
                className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-500"
              />
            </div>
          </div>

        </div>

        {/* ── Carousel Dots (Active wide purple pill, 3 small dots) ── */}
        <div className="flex justify-center items-center gap-2 pt-8 md:pt-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 cursor-pointer rounded-full ${
                currentSlide === i
                  ? "w-7 h-2 bg-[#8B5CF6]"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Hero;
