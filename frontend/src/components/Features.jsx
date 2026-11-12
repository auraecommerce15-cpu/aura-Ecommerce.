import { Truck, ShieldCheck, Headphones } from 'lucide-react';

const Features = () => {
  const items = [
    {
      icon: <Truck className="h-6 w-6 text-purple-600" />,
      title: "Free Shipping",
      description: "On Orders Over $50"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-purple-600" />,
      title: "Easy Returns",
      description: "30-Day Return Policy"
    },
    {
      icon: <Headphones className="h-6 w-6 text-purple-600" />,
      title: "24/7 Support",
      description: "Always Here"
    }
  ];

  return (
    <section className="relative z-20 -mt-8 sm:-mt-10 max-w-5xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-purple-950/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0 shadow-inner">
              {item.icon}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
