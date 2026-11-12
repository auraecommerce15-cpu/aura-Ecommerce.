import { Truck, ShieldCheck, Headphones } from "lucide-react";

const Features = () => {
  const items = [
    {
      icon: <Truck className="w-8 h-8 text-slate-900 shrink-0" strokeWidth={1.8} />,
      title: "Free Shipping",
      description: "On orders Over $50"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-slate-900 shrink-0" strokeWidth={1.8} />,
      title: "Easy Returns",
      description: "30-Day Return Policy"
    },
    {
      icon: <Headphones className="w-8 h-8 text-slate-900 shrink-0" strokeWidth={1.8} />,
      title: "24/7 Support",
      description: "Always here"
    }
  ];

  return (
    <section className="w-full bg-white border-b border-slate-100 shadow-xs py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-4 py-3 sm:py-2 px-4 text-left"
            >
              {item.icon}
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
