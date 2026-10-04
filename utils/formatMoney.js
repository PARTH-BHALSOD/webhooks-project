// Stripe sends amounts in the smallest currency unit.
// Most currencies have 2 decimals (cents/paise), but some have none.
const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export const formatMoney = (amount, currency = "usd") => {
  const code = String(currency).toUpperCase();
  const value = ZERO_DECIMAL.has(code) ? amount : amount / 100;
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
  }).format(value);
};

export default formatMoney;
