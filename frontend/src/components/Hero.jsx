import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title1: "Next-Gen",
      title2: "Electronics",
      subtitle: "Explore the latest tech with unbeatable prices.",
      link: "/products",
      image: "/slide_headphones.png",
      alt: "Next-Gen Electronics - Premium Headphones"
    },
    {
      title1: "Flagship",
      title2: "Smartphones",
      subtitle: "Stunning displays, pro cameras, and all-day battery life.",
      link: "/products?category=Smartphones",
      image: "/slide_phone.png",
      alt: "Flagship Smartphones"
    },
    {
      title1: "Pro Power",
      title2: "Ultrabooks",
      subtitle: "Uncompromising speed and endurance for creators.",
      link: "/products?category=Laptops",
      image: "/slide_laptop.png",
      alt: "Pro Power Ultrabooks"
    },
    {
      title1: "Smart Living",
      title2: "Wearables",
      subtitle: "Precision health metrics and active lifestyle tracking.",
      link: "/products?category=Smartwatches",
      image: "/slide_watch.png",
      alt: "Smart Living Wearables"
    }
  ];

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const current = slides[currentSlide];

  return (
    <section className="relative w-full bg-gradient-to-r from-[#070918] via-[#12052E] to-[#251052] text-white overflow-hidden py-6 sm:py-8 md:py-10 select-none">
      
      {/* ── Ambient Radial Purple Halos ── */}
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#7C3AED]/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-[#6D28D9]/20 blur-[90px] pointer-events-none" />

      {/* ── Carousel Left Arrow (<) ── */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
      >
        <ChevronLeft size={20} />
      </button>

      {/* ── Carousel Right Arrow (>) ── */}
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
      >
        <ChevronRight size={20} />
      </button>

      <div className="max-w-7xl mx-auto px-8 sm:px-12 md:px-16 w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-center min-h-[260px] sm:min-h-[300px] md:min-h-[340px]">
          
          {/* ─── Left Copy: Headline + Subtitle + Pill Button ─── */}
          <div className="space-y-3 sm:space-y-4 text-left">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.08] text-white">
                {current.title1}{" "}
                <span className="block text-[#A855F7] drop-shadow-[0_0_20px_rgba(168,85,247,0.45)]">
                  {current.title2}
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal mt-2.5 max-w-md leading-relaxed">
                {current.subtitle}
              </p>
            </div>

            {/* Pill CTA button */}
            <div className="pt-1">
              <Link to={current.link}>
                <Button
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-6 sm:px-7 h-10 sm:h-11 rounded-full transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-purple-600/35 flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  Shop Now <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </div>

          {/* ─── Right Visual: Clean isolated product on purple circular halo ─── */}
          <div className="relative flex justify-center items-center h-[220px] sm:h-[270px] md:h-[310px] lg:h-[330px]">
            
            {/* The circular purple disc from the mockup */}
            <div className="absolute w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[280px] md:h-[280px] lg:w-[300px] lg:h-[300px] rounded-full bg-gradient-to-tr from-[#6D28D9]/70 via-[#7C3AED]/60 to-[#A855F7]/40 shadow-[0_0_60px_rgba(124,58,237,0.4)] pointer-events-none transition-all duration-700" />
            
            {/* The isolated cutout product with no rectangular background */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
              <img
                key={current.image}
                src={current.image}
                alt={current.alt}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-400"
              />
            </div>
          </div>

        </div>

        {/* ── Carousel Dots ── */}
        <div className="flex justify-center items-center gap-2 pt-4 sm:pt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 cursor-pointer rounded-full ${
                currentSlide === i
                  ? "w-6 h-2 bg-[#8B5CF6]"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Hero;
