"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Sparkline from "@/components/Sparkline";
import type { CryptoPrice } from "@/lib/coingecko";

export default function MarketPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/prices");
      if (res.ok) setPrices(await res.json());
    } catch {
      // network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const top2 = prices.slice(0, 2);
  const rest = prices;

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <h1 className="text-xl font-bold text-center mb-5">Markets</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-kb-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Bluechip cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {top2.map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => router.push(`/market/${coin.id}`)}
                  className="card p-4 cursor-pointer hover:bg-kb-card-hover transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {coin.image && <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />}
                    <span className="font-bold text-sm">{coin.symbol?.toUpperCase()}</span>
                  </div>
                  <p className="font-semibold text-sm">
                    ${coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs font-medium ${coin.price_change_percentage_24h >= 0 ? "text-kb-green" : "text-kb-red"}`}>
                    {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>

            {/* Section header */}
            <div className="flex items-center gap-4 mb-4 border-b border-kb-border pb-3">
              <span className="text-sm font-semibold text-kb-text">Trending</span>
              <span className="text-xs text-kb-muted ml-auto">Volume ↓</span>
            </div>

            {/* Token list */}
            <div className="space-y-1">
              {rest.map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => router.push(`/market/${coin.id}`)}
                  className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-kb-card/50 rounded-xl transition-colors"
                >
                  {coin.image ? (
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full gradient-bg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{coin.name}</p>
                    <p className="text-xs text-kb-muted">
                      {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B Cap.` : coin.symbol?.toUpperCase()}
                    </p>
                  </div>
                  <div className="shrink-0 w-[60px]">
                    {coin.sparkline_in_7d && (
                      <Sparkline
                        data={coin.sparkline_in_7d.price}
                        positive={coin.price_change_percentage_24h >= 0}
                        width={60}
                        height={24}
                      />
                    )}
                  </div>
                  <div className="text-right shrink-0 min-w-[90px]">
                    <p className="font-semibold text-sm">
                      ${coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                    </p>
                    <p className={`text-xs font-medium ${coin.price_change_percentage_24h >= 0 ? "text-kb-green" : "text-kb-red"}`}>
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
