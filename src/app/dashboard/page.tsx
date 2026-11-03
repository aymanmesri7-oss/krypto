"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Sparkline from "@/components/Sparkline";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";
import type { CryptoPrice } from "@/lib/coingecko";

interface Balance {
  crypto_id: string;
  amount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [priceRes, balanceRes, authRes] = await Promise.all([
        fetch("/api/prices"),
        fetch("/api/portfolio"),
        fetch("/api/auth/me"),
      ]);

      if (!authRes.ok) {
        router.push("/login");
        return;
      }

      if (priceRes.ok) setPrices(await priceRes.json());
      if (balanceRes.ok) setBalances(await balanceRes.json());
    } catch {
      // network error
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getPrice = (cryptoId: string) => prices.find((p) => p.id === cryptoId);
  const getCryptoMeta = (cryptoId: string) => SUPPORTED_CRYPTOS.find((c) => c.id === cryptoId);

  const totalValue = balances.reduce((sum, b) => {
    const price = getPrice(b.crypto_id);
    return sum + (price ? price.current_price * b.amount : 0);
  }, 0);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-kb-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-kb-muted text-sm">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        {/* Total value */}
        <div className="text-center mb-6">
          <p className="text-kb-muted text-sm mb-1">Solde total</p>
          <h2 className="text-4xl font-bold tracking-tight">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/receive" className="flex flex-col items-center gap-2 bg-kb-card rounded-2xl py-4 border border-kb-border hover:bg-kb-card-hover transition-colors">
            <div className="w-11 h-11 rounded-full bg-kb-blue/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3375FF" strokeWidth="2">
                <path d="M12 5v14" />
                <path d="M5 12l7 7 7-7" />
              </svg>
            </div>
            <span className="text-xs font-medium text-kb-text">Recevoir</span>
          </Link>
          <Link href="/send" className="flex flex-col items-center gap-2 bg-kb-card rounded-2xl py-4 border border-kb-border hover:bg-kb-card-hover transition-colors">
            <div className="w-11 h-11 rounded-full bg-kb-violet/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B3FE4" strokeWidth="2">
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </div>
            <span className="text-xs font-medium text-kb-text">Envoyer</span>
          </Link>
          <Link href="/market" className="flex flex-col items-center gap-2 bg-kb-card rounded-2xl py-4 border border-kb-border hover:bg-kb-card-hover transition-colors">
            <div className="w-11 h-11 rounded-full bg-kb-green/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2">
                <polyline points="3 17 8 12 12 15 21 6" />
                <polyline points="17 6 21 6 21 10" />
              </svg>
            </div>
            <span className="text-xs font-medium text-kb-text">Marché</span>
          </Link>
        </div>

        {/* Token list */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Vos tokens</h3>
          <span className="text-xs text-kb-muted">{balances.length} actif{balances.length !== 1 ? "s" : ""}</span>
        </div>

        {balances.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-kb-card-hover mx-auto mb-4 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5E6673" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-kb-muted text-sm mb-1">Portefeuille vide</p>
            <p className="text-xs text-kb-muted">
              Demandez à un admin de créditer votre compte ou recevez des cryptos.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {balances.map((balance) => {
              const price = getPrice(balance.crypto_id);
              const meta = getCryptoMeta(balance.crypto_id);
              const value = price ? price.current_price * balance.amount : 0;
              const change = price?.price_change_percentage_24h ?? 0;

              return (
                <div
                  key={balance.crypto_id}
                  className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-kb-card/50 rounded-xl transition-colors"
                  onClick={() => router.push(`/market/${balance.crypto_id}`)}
                >
                  {price?.image ? (
                    <img src={price.image} alt={meta?.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                      {meta?.symbol?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{meta?.name ?? balance.crypto_id}</p>
                    <p className="text-xs text-kb-muted">
                      {balance.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} {meta?.symbol?.toUpperCase()}
                    </p>
                  </div>
                  <div className="hidden sm:block shrink-0">
                    {price?.sparkline_in_7d && (
                      <Sparkline data={price.sparkline_in_7d.price} positive={change >= 0} width={60} height={24} />
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">
                      ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-medium ${change >= 0 ? "text-kb-green" : "text-kb-red"}`}>
                      {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Watchlist from market prices */}
        {prices.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Liste de surveillance</h3>
              <Link href="/market" className="text-xs text-kb-blue font-medium">
                Tout voir &rsaquo;
              </Link>
            </div>
            <div className="space-y-1">
              {prices.slice(0, 4).map((coin) => (
                <div
                  key={coin.id}
                  className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-kb-card/50 rounded-xl transition-colors"
                  onClick={() => router.push(`/market/${coin.id}`)}
                >
                  {coin.image ? (
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full gradient-bg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{coin.symbol?.toUpperCase()}</p>
                    <p className="text-xs text-kb-muted">
                      {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B Cap.` : coin.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
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
          </div>
        )}

        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
