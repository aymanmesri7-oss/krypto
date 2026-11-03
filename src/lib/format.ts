export function formatUsd(value: number | null | undefined): string {
  const v = value ?? 0;
  const digits = v !== 0 && Math.abs(v) < 1 ? 4 : 2;
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: digits });
}

export function formatAmount(value: number, maxDigits = 8): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: maxDigits });
}

export function formatPct(value: number | null | undefined): string {
  const v = value ?? 0;
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function shortAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function compactUsd(value: number | null | undefined): string {
  const v = value ?? 0;
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return formatUsd(v);
}
