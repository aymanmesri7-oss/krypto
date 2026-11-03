"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";

interface PricePoint {
  prices: [number, number][];
}

export default function CoinDetail({ id }: { id: string }) {
  const router = useRouter();
  const [history, setHistory] = useState<[number, number][]>([]);
  const [days, setDays] = useState(7);
  const [coinPrice, setCoinPrice] = useState<{ current_price: number; price_change_percentage_24h: number; market_cap: number; image: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const meta = SUPPORTED_CRYPTOS.find((c) => c.id === id);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/prices?coinId=${id}&days=${days}`).then((r) => r.json()),
      fetch("/api/prices").then((r) => r.json()),
    ])
      .then(([historyData, prices]: [PricePoint, Array<{ id: string; current_price: number; price_change_percentage_24h: number; market_cap: number; image: string }>]) => {
        setHistory(historyData.prices || []);
        const coin = prices.find((p: { id: string }) => p.id === id);
        if (coin) setCoinPrice(coin);
      })
      .finally(() => setLoading(false));
  }, [id, days]);

  const renderChart = () => {
    if (history.length < 2) return <div className="text-kb-muted text-center py-8 text-sm">Pas de données disponibles</div>;

    const prices = history.map(([, p]) => p);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const width = 800;
    const height = 250;
    const padding = 20;

    const points = history.map(([, p], i) => {
      const x = padding + (i / (history.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (p - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    const isPositive = prices[prices.length - 1] >= prices[0];
    const color = isPositive ? "#2EBD85" : "#F6465D";

    const areaPoints = [
      `${padding},${height - padding}`,
      ...points,
      `${width - padding},${height - padding}`,
    ].join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#areaGrad)" />
        <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const priceChange = coinPrice?.price_change_percentage_24h ?? 0;
  const priceChangeAbs = coinPrice ? Math.abs(priceChange / 100 * coinPrice.current_price) : 0;

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-kb-card border border-kb-border flex items-center justify-center text-kb-muted hover:text-kb-text">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {coinPrice?.image ? (
              <img src={coinPrice.image} alt={meta?.name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full gradient-bg" />
            )}
            <span className="font-bold">{meta?.symbol?.toUpperCase()}</span>
            <span className="text-kb-muted text-sm">{meta?.name}</span>
          </div>
          <div className="w-9" />
        </div>

        {coinPrice && (
          <div className="text-center mb-2">
            <p className="text-3xl font-bold">
              ${coinPrice.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: coinPrice.current_price < 1 ? 4 : 2 })}
            </p>
            <p className={`text-sm font-medium ${priceChange >= 0 ? "text-kb-green" : "text-kb-red"}`}>
              {priceChange >= 0 ? "+" : "-"}${priceChangeAbs.toFixed(2)} ({priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%)
            </p>
          </div>
        )}

        <div className="mb-2">
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-kb-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            renderChart()
          )}
        </div>

        <div className="flex justify-center gap-1 mb-6">
          {[
            { label: "7j", value: 7 },
            { label: "1M", value: 30 },
            { label: "1A", value: 365 },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setDays(period.value)}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                days === period.value
                  ? "bg-kb-blue text-white"
                  : "bg-kb-card text-kb-muted hover:text-kb-text border border-kb-border"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {coinPrice && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-3 text-center">
              <p className="text-[10px] text-kb-muted mb-1">Prix</p>
              <p className="text-sm font-bold">
                ${coinPrice.current_price < 1 ? coinPrice.current_price.toFixed(4) : coinPrice.current_price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-[10px] text-kb-muted mb-1">24h</p>
              <p className={`text-sm font-bold ${priceChange >= 0 ? "text-kb-green" : "text-kb-red"}`}>
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
              </p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-[10px] text-kb-muted mb-1">Cap.</p>
              <p className="text-sm font-bold">
                ${(coinPrice.market_cap / 1e9).toFixed(1)}B
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Link href="/send" className="btn-secondary text-center text-sm !py-3 !rounded-xl flex items-center justify-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            Envoyer
          </Link>
          <Link href={`/receive?crypto=${id}`} className="btn-secondary text-center text-sm !py-3 !rounded-xl flex items-center justify-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
            Recevoir
          </Link>
          <Link href="/market" className="btn-secondary text-center text-sm !py-3 !rounded-xl flex items-center justify-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 17 8 12 12 15 21 6" /><polyline points="17 6 21 6 21 10" /></svg>
            Marché
          </Link>
        </div>

        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
