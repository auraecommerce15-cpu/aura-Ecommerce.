import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.categories": "Categories",
    "nav.selectCategory": "Select Category",
    "nav.allCategories": "View All Categories",
    "nav.deals": "Flash Deals",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.admin": "Admin",
    "nav.search": "Search Products",
    "nav.cart": "Shopping Cart",
    "nav.login": "Login / Register",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.toggleTheme": "Toggle Theme",
    "nav.language": "Language",
    "nav.currency": "Currency",

    // Hero Section
    "hero.badge": "AURA LUXURY TECH",
    "hero.title": "Next-Gen",
    "hero.gradient": "Electronics",
    "hero.subtitle": "Explore the latest tech with unbeatable prices.",
    "hero.cta": "Shop Now",
    "hero.viewDeals": "View Deals",

    // Features Bar
    "features.freeShipping": "Free Shipping",
    "features.freeShippingDesc": "On Orders Over $50",
    "features.easyReturns": "Easy Returns",
    "features.easyReturnsDesc": "30-Day Return Policy",
    "features.support": "24/7 Support",
    "features.supportDesc": "Always Here",

    // Home Page
    "home.popularTitle": "Our Popular",
    "home.popularGradient": "Products",
    "home.popularSubtitle": "Curated premium electronics engineered for performance and reliability.",
    "home.viewAll": "View All",
    "home.all": "All",
    "home.addToCart": "Add to Cart",
    "home.outOfStock": "Out of Stock",
    "home.reviews": "reviews",

    // Products
    "products.title": "Explore Our",
    "products.gradient": "Collection",
    "products.subtitle": "Find the perfect gadget from our authentic, warranty-backed catalog.",
    "products.filterCategory": "Filter by Category",
    "products.priceRange": "Price Range",
    "products.min": "Min",
    "products.max": "Max",
    "products.apply": "Apply",
    "products.sortBy": "Sort By",
    "products.sortFeatured": "Featured",
    "products.sortPriceAsc": "Price: Low to High",
    "products.sortPriceDesc": "Price: High to Low",
    "products.sortTopRated": "Top Rated",
    "products.resetFilters": "Reset All Filters",
    "products.noProducts": "No Products Found",
    "products.noProductsDesc": "We couldn't find any products matching your search criteria.",
    "products.clearFilters": "Clear Filters",

    // Cart
    "cart.title": "Shopping",
    "cart.gradient": "Cart",
    "cart.empty": "Your Cart is Empty",
    "cart.emptyDesc": "Looks like you haven't added anything to your cart yet.",
    "cart.browse": "Browse Products",
    "cart.orderSummary": "Order Summary",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.free": "FREE",
    "cart.tax": "Tax (8%)",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
    "cart.continue": "Continue Shopping",

    // Checkout
    "checkout.title": "Complete Your",
    "checkout.gradient": "Order",
    "checkout.subtitle": "Secure, encrypted payment processing. Your data is always protected.",
    "checkout.shipping": "Shipping Address",
    "checkout.paymentMethod": "Payment Method",
    "checkout.card": "Credit / Debit Card",
    "checkout.cod": "Cash on Delivery",
    "checkout.placeOrder": "Place Order",
    "checkout.orderSummary": "Order Summary",

    // Admin & Alerts
    "admin.title": "Admin",
    "admin.gradient": "Console",
    "admin.products": "Products",
    "admin.categories": "Categories",
    "admin.orders": "Orders",
    "admin.notifications": "Notifications",
    "admin.unread": "unread",
    "admin.markAllRead": "Mark All as Read",
    "admin.noNotifications": "No notifications yet",

    // Footer
    "footer.tagline": "Shop Smarter. Live Better.",
    "footer.newsletterTitle": "Stay Ahead of the Tech Curve",
    "footer.newsletterDesc": "Get exclusive discounts, early access to new releases, and weekly tech roundups.",
    "footer.subscribe": "Subscribe",
    "footer.rights": "All rights reserved.",
  },
  ur: {
    // Navigation
    "nav.home": "ہوم",
    "nav.shop": "شاپ",
    "nav.categories": "زمرہ جات",
    "nav.selectCategory": "زمرہ منتخب کریں",
    "nav.allCategories": "تمام زمرہ جات دیکھیں",
    "nav.deals": "خصوصی ڈیلز",
    "nav.about": "ہمارے بارے میں",
    "nav.contact": "رابطہ کریں",
    "nav.admin": "ایڈمن پینل",
    "nav.search": "مصنوعات تلاش کریں",
    "nav.cart": "خریداری کی ٹوکری",
    "nav.login": "لاگ ان / رجسٹر",
    "nav.profile": "پروفائل",
    "nav.logout": "لاگ آؤٹ",
    "nav.toggleTheme": "تھیم تبدیل کریں",
    "nav.language": "زبان",
    "nav.currency": "کرنسی",

    // Hero Section
    "hero.badge": "اورا لگژری ٹیک",
    "hero.title": "جدید ترین",
    "hero.gradient": "الیکٹرانکس",
    "hero.subtitle": "بہترین اور سستی قیمتوں پر جدید ترین ٹیکنالوجی دریافت کریں۔",
    "hero.cta": "ابھی خریداری کریں",
    "hero.viewDeals": "ڈیلز دیکھیں",

    // Features Bar
    "features.freeShipping": "مفت شپنگ",
    "features.freeShippingDesc": "50 ڈالر سے زیادہ کے آرڈرز پر",
    "features.easyReturns": "آسان واپسی",
    "features.easyReturnsDesc": "30 دن کی واپسی پالیسی",
    "features.support": "24/7 سپورٹ",
    "features.supportDesc": "ہمیشہ آپ کے ساتھ",

    // Home Page
    "home.popularTitle": "ہماری مقبول",
    "home.popularGradient": "مصنوعات",
    "home.popularSubtitle": "بہترین کارکردگی اور وارنٹی کے ساتھ منتخب کردہ پریمیم الیکٹرانکس۔",
    "home.viewAll": "سب دیکھیں",
    "home.all": "تمام",
    "home.addToCart": "ٹوکری میں ڈالیں",
    "home.outOfStock": "اسٹاک ختم",
    "home.reviews": "تبصرے",

    // Products
    "products.title": "ہماری مصنوعات",
    "products.gradient": "دیکھیں",
    "products.subtitle": "ہماری اصلی اور وارنٹی شدہ کلیکشن سے اپنی پسندیدہ ڈیوائس چنیں۔",
    "products.filterCategory": "زمرہ کے لحاظ سے فلٹر کریں",
    "products.priceRange": "قیمت کی حد",
    "products.min": "کم از کم",
    "products.max": "زیادہ سے زیادہ",
    "products.apply": "لاگو کریں",
    "products.sortBy": "ترتیب دیں",
    "products.sortFeatured": "نمایاں",
    "products.sortPriceAsc": "قیمت: کم سے زیادہ",
    "products.sortPriceDesc": "قیمت: زیادہ سے کم",
    "products.sortTopRated": "اعلیٰ ترین درجہ بندی",
    "products.resetFilters": "تمام فلٹرز ری سیٹ کریں",
    "products.noProducts": "کوئی پروڈکٹ نہیں ملی",
    "products.noProductsDesc": "آپ کی تلاش سے مماثل کوئی پروڈکٹ دستیاب نہیں ہے۔",
    "products.clearFilters": "فلٹرز ختم کریں",

    // Cart
    "cart.title": "خریداری کی",
    "cart.gradient": "ٹوکری",
    "cart.empty": "آپ کی ٹوکری خالی ہے",
    "cart.emptyDesc": "لگتا ہے آپ نے ابھی تک ٹوکری میں کچھ شامل نہیں کیا۔",
    "cart.browse": "مصنوعات دیکھیں",
    "cart.orderSummary": "آرڈر کا خلاصہ",
    "cart.subtotal": "ذیلی کل",
    "cart.shipping": "شپنگ",
    "cart.free": "مفت",
    "cart.tax": "ٹیکس (8%)",
    "cart.total": "کل رقم",
    "cart.checkout": "چیک آؤٹ پر جائیں",
    "cart.continue": "خریداری جاری رکھیں",

    // Checkout
    "checkout.title": "اپنا آرڈر",
    "checkout.gradient": "مکمل کریں",
    "checkout.subtitle": "محفوظ اور انکرپٹڈ ادائیگی۔ آپ کا ڈیٹا ہمیشہ محفوظ ہے۔",
    "checkout.shipping": "شپنگ کا پتہ",
    "checkout.paymentMethod": "ادائیگی کا طریقہ",
    "checkout.card": "کریڈٹ / ڈیبٹ کارڈ",
    "checkout.cod": "کیش آن ڈیلیوری",
    "checkout.placeOrder": "آرڈر مکمل کریں",
    "checkout.orderSummary": "آرڈر کا خلاصہ",

    // Admin & Alerts
    "admin.title": "ایڈمن",
    "admin.gradient": "کنسول",
    "admin.products": "مصنوعات",
    "admin.categories": "زمرہ جات",
    "admin.orders": "آرڈرز",
    "admin.notifications": "اطلاعات",
    "admin.unread": "غیر پڑھا",
    "admin.markAllRead": "سب کو پڑھا ہوا نشان زد کریں",
    "admin.noNotifications": "ابھی تک کوئی اطلاع نہیں ہے",

    // Footer
    "footer.tagline": "ہوشیاری سے خریداری کریں۔ بہتر زندگی گزاریں۔",
    "footer.newsletterTitle": "ٹیکنالوجی کے ساتھ آگے رہیں",
    "footer.newsletterDesc": "خصوصی ڈسکاؤنٹس اور نئی پروڈکٹس کی معلومات حاصل کریں۔",
    "footer.subscribe": "سبسکرائب کریں",
    "footer.rights": "جملہ حقوق محفوظ ہیں۔",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("aura_language");
      return saved === "ur" ? "ur" : "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang) => {
    const valid = lang === "ur" ? "ur" : "en";
    setLanguageState(valid);
    try {
      localStorage.setItem("aura_language", valid);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ur" : "en");
  };

  useEffect(() => {
    // Add urdu attribute to body for optional RTL or font enhancements
    const root = document.documentElement;
    if (language === "ur") {
      root.setAttribute("lang", "ur");
      root.classList.add("lang-ur");
    } else {
      root.setAttribute("lang", "en");
      root.classList.remove("lang-ur");
    }
  }, [language]);

  const t = (key, fallback) => {
    const langDict = translations[language] || translations.en;
    if (langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = translations.en;
    if (enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isUrdu: language === "ur" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
