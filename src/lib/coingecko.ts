export const SUPPORTED_CRYPTOS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "tether", symbol: "USDT", name: "Tether", image: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png" },
  { id: "solana", symbol: "SOL", name: "Solana", image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", image: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  { id: "ripple", symbol: "XRP", name: "XRP", image: "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", image: "https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "cardano", symbol: "ADA", name: "Cardano", image: "https://coin-images.coingecko.com/coins/images/975/large/cardano.png" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", image: "https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", image: "https://coin-images.coingecko.com/coins/images/4713/large/polygon.png" },
];

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
  sparkline_in_7d?: { price: number[] };
}

let priceCache: { data: CryptoPrice[]; timestamp: number } | null = null;
const CACHE_TTL = 30_000;

export async function getPrices(): Promise<CryptoPrice[]> {
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
    return priceCache.data;
  }

  const ids = SUPPORTED_CRYPTOS.map((c) => c.id).join(",");
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      if (priceCache) return priceCache.data;
      return getFallbackPrices();
    }

    const data: CryptoPrice[] = await res.json();
    priceCache = { data, timestamp: Date.now() };
    return data;
  } catch {
    if (priceCache) return priceCache.data;
    return getFallbackPrices();
  }
}

export async function getCoinHistory(
  coinId: string,
  days: number
): Promise<{ prices: [number, number][] }> {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return { prices: [] };
    return res.json();
  } catch {
    return { prices: [] };
  }
}

function getFallbackPrices(): CryptoPrice[] {
  const fallback: Record<string, { price: number; change: number; cap: number }> = {
    bitcoin: { price: 67432.12, change: 2.34, cap: 1324000000000 },
    ethereum: { price: 3521.45, change: -1.12, cap: 423000000000 },
    tether: { price: 1.0, change: 0.01, cap: 95000000000 },
    solana: { price: 172.34, change: 5.67, cap: 76000000000 },
    binancecoin: { price: 612.78, change: 0.89, cap: 94000000000 },
    ripple: { price: 0.5234, change: -2.45, cap: 28000000000 },
    dogecoin: { price: 0.1567, change: 8.12, cap: 22000000000 },
    cardano: { price: 0.4521, change: -0.78, cap: 16000000000 },
    "avalanche-2": { price: 36.78, change: 3.45, cap: 14000000000 },
    "matic-network": { price: 0.7234, change: 1.23, cap: 7000000000 },
  };

  return SUPPORTED_CRYPTOS.map((c) => ({
    id: c.id,
    symbol: c.symbol.toLowerCase(),
    name: c.name,
    current_price: fallback[c.id]?.price ?? 0,
    price_change_percentage_24h: fallback[c.id]?.change ?? 0,
    market_cap: fallback[c.id]?.cap ?? 0,
    image: c.image,
    sparkline_in_7d: { price: Array.from({ length: 168 }, () => (fallback[c.id]?.price ?? 100) * (0.95 + Math.random() * 0.1)) },
  }));
}
