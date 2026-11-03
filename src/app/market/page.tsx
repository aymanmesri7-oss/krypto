"use client";

import { useState } from "react";
import Link from "next/link";
import TabBar from "@/components/TabBar";
import TokenIcon from "@/components/TokenIcon";
import Sparkline from "@/components/Sparkline";
import { Search } from "@/components/icons";
import { compactUsd, formatPct, formatUsd } from "@/lib/format";
import { useWalletData } from "@/lib/useWalletData";

const FILTERS = [
  { key: "all", label: "Top" },
  { key: "up", label: "Hausse" },
  { key: "down", label: "Baisse" },
] as const;

export default function MarketPage() {
  const { prices, loading } = useWalletData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const q = query.trim().toLowerCase();
  let list = prices.filter((c) => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  if (filter === "up") list = list.filter((c) => c.price_change_percentage_24h >= 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
  if (filter === "down") list = list.filter((c) => c.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-center">
        <h1 className="text-[17px] font-semibold">Marché</h1>
      </header>

      <div className="px-4">
        <div className="flex items-center gap-2 rounded-xl bg-kb-card px-3">
          <Search size={18} className="text-kb-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une crypto"
            className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-kb-muted"
          />
        </div>
        <div className="mt-4 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === f.key ? "bg-kb-text text-kb-dark" : "bg-kb-card text-kb-muted"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex px-4 pb-1 text-xs text-kb-muted">
        <span className="flex-1">Nom / Cap. marché</span>
        <span>Prix / 24h</span>
      </div>

      {loading ? (
        <div className="space-y-2 px-4 pt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-kb-card" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="py-16 text-center text-sm text-kb-muted">Aucun résultat</p>
      ) : (
        list.map((coin) => {
          const up = coin.price_change_percentage_24h >= 0;
          return (
            <Link key={coin.id} href={`/market/${coin.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-kb-card">
              <TokenIcon id={coin.id} image={coin.image} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{coin.symbol.toUpperCase()}</p>
                <p className="text-[13px] text-kb-muted">{compactUsd(coin.market_cap)}</p>
              </div>
              <div className="w-16 shrink-0">
                {coin.sparkline_in_7d && <Sparkline data={coin.sparkline_in_7d.price} positive={up} width={64} height={28} />}
              </div>
              <div className="w-[96px] shrink-0 text-right">
                <p className="text-[15px] font-semibold">{formatUsd(coin.current_price)}</p>
                <p className={`text-[13px] font-medium ${up ? "text-kb-green" : "text-kb-red"}`}>{formatPct(coin.price_change_percentage_24h)}</p>
              </div>
            </Link>
          );
        })
      )}

      <TabBar />
    </div>
  );
}
