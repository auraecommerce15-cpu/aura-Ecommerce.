import { Truck, ShieldCheck, Headphones } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

const Features = () => {
  const { t, isUrdu } = useLanguage();
  const { formatPrice } = useCurrency();

  const threshold = formatPrice(50);

  const items = [
    {
      icon: <Truck className="w-8 h-8 text-slate-900 dark:text-purple-400 shrink-0" strokeWidth={1.8} />,
      title: t("features.freeShipping"),
      description: isUrdu ? `${threshold} سے زیادہ کے آرڈرز پر` : `On Orders Over ${threshold}`
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-slate-900 dark:text-purple-400 shrink-0" strokeWidth={1.8} />,
      title: t("features.easyReturns"),
      description: t("features.easyReturnsDesc")
    },
    {
      icon: <Headphones className="w-8 h-8 text-slate-900 dark:text-purple-400 shrink-0" strokeWidth={1.8} />,
      title: t("features.support"),
      description: t("features.supportDesc")
    }
  ];

  return (
    <section className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs py-6 md:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center gap-4 py-3 sm:py-2 px-4 text-left"
            >
              {item.icon}
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base tracking-tight leading-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
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
