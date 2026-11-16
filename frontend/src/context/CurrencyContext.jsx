import React, { createContext, useContext, useEffect, useState } from "react";

export const CURRENCIES = {
  USD: { code: "USD", symbol: "$", rate: 1, label: "USD ($)", name: "US Dollar", flag: "🇺🇸" },
  PKR: { code: "PKR", symbol: "Rs ", rate: 280, label: "PKR (Rs)", name: "Pakistani Rupee", flag: "🇵🇰" },
  EUR: { code: "EUR", symbol: "€", rate: 0.92, label: "EUR (€)", name: "Euro", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", rate: 0.79, label: "GBP (£)", name: "British Pound", flag: "🇬🇧" },
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem("aura_currency");
      return CURRENCIES[saved] ? saved : "USD";
    } catch {
      return "USD";
    }
  });

  const setCurrency = (code) => {
    const valid = CURRENCIES[code] ? code : "USD";
    setCurrencyState(valid);
    try {
      localStorage.setItem("aura_currency", valid);
    } catch {}
  };

  const currentConfig = CURRENCIES[currency] || CURRENCIES.USD;

  // Convert USD price to current currency amount
  const convertPrice = (priceInUSD) => {
    const num = Number(priceInUSD) || 0;
    return num * currentConfig.rate;
  };

  // Format price into human-readable string with currency symbol
  const formatPrice = (priceInUSD, forceDecimals = null) => {
    const num = Number(priceInUSD) || 0;
    const converted = num * currentConfig.rate;

    if (currentConfig.code === "PKR") {
      // In PKR, whole numbers look much cleaner: Rs 139,720
      return `${currentConfig.symbol}${Math.round(converted).toLocaleString()}`;
    }

    const decimals = forceDecimals !== null ? forceDecimals : (converted % 1 === 0 ? 0 : 2);
    return `${currentConfig.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currentConfig,
        convertPrice,
        formatPrice,
        currencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
