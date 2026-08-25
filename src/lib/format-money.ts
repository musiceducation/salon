/** Format catalog / order amounts. Macau salon default is MOP — never assume HK$. */
export function formatMoney(cents: number, currency = "mop"): string {
  const code = (currency || "mop").toLowerCase();
  const amountNum = cents / 100;
  const amount = Number.isInteger(amountNum)
    ? amountNum.toLocaleString("en-US")
    : amountNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (code === "mop") {
    return `MOP ${amount}`;
  }
  if (code === "hkd") {
    return `HK$ ${amount}`;
  }
  return `${code.toUpperCase()} ${amount}`;
}
