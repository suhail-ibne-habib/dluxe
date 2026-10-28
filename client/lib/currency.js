/** Display currency for public pricing (Saint Martin / Saint Barths). */
export const CURRENCY_CODE = "EUR";
export const CURRENCY_SYMBOL = "€";

export function formatMoney(amount, { withCode = false } = {}) {
  const n = Number(amount);
  const value = Number.isFinite(n) ? n.toLocaleString() : "0";
  if (withCode) return `${CURRENCY_CODE} ${value}`;
  return `${CURRENCY_SYMBOL}${value}`;
}
