const currencySymbols: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  AUD: "$",
};

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = currencySymbols[currencyCode] || "$";
  return `${symbol}${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currencyCode: string): string {
  return currencySymbols[currencyCode] || "$";
}
