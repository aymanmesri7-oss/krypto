"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TabBar from "@/components/TabBar";
import TokenIcon from "@/components/TokenIcon";
import ActionButton from "@/components/ActionButton";
import TransactionList from "@/components/TransactionList";
import EmptyActivity from "@/components/EmptyActivity";
import { ArrowDown, ArrowUp, Chart, Clock, Eye, EyeOff, Search, Settings } from "@/components/icons";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";
import { CHAINS } from "@/lib/chains";
import { formatAmount, formatPct, formatUsd } from "@/lib/format";
import { useTransactions, useWalletData, WALLET_NAME } from "@/lib/useWalletData";

const HIDE_KEY = "kb_hide_balance";
const HIDDEN = "••••••";

export default function DashboardPage() {
  const { balances, priceOf, loading } = useWalletData();
  const { txs, loading: txLoading } = useTransactions();
  const [tab, setTab] = useState<"crypto" | "activity">("crypto");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDE_KEY) === "1");
    } catch {}
  }, []);

  const toggleHidden = () => {
    setHidden((h) => {
      try {
        localStorage.setItem(HIDE_KEY, h ? "0" : "1");
      } catch {}
      return !h;
    });
  };

  const tokens = SUPPORTED_CRYPTOS.map((c, order) => {
    const price = priceOf(c.id);
    const amount = balances[c.id] ?? 0;
    const value = amount * (price?.current_price ?? 0);
    return { ...c, order, price, amount, value };
  }).sort((a, b) => b.value - a.value || a.order - b.order);

  const total = tokens.reduce((sum, t) => sum + t.value, 0);
  const change = tokens.reduce((sum, t) => {
    const pct = t.price?.price_change_percentage_24h ?? 0;
    return sum + (t.value * pct) / (100 + pct);
  }, 0);
  const changePct = total - change > 0 ? (change / (total - change)) * 100 : 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-2">
        <Link href="/settings" aria-label="Paramètres" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-kb-card">
          <Settings size={22} strokeWidth={1.8} />
        </Link>
        <Link href="/settings" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 active:bg-kb-card">
          <span className="text-[15px] font-semibold">{WALLET_NAME}</span>
        </Link>
        <Link href="/market" aria-label="Rechercher" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-kb-card">
          <Search size={22} strokeWidth={1.8} />
        </Link>
      </header>

      <section className="flex flex-col items-center px-4 pb-6 pt-4">
        <button onClick={toggleHidden} className="flex items-center gap-2 text-kb-muted" aria-label="Masquer le solde">
          <span className="text-sm">Solde total</span>
          {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        {loading ? (
          <div className="mt-2 h-11 w-44 animate-pulse rounded-xl bg-kb-card" />
        ) : (
          <p className="mt-1 text-[40px] font-bold leading-tight tracking-tight">{hidden ? HIDDEN : formatUsd(total)}</p>
        )}
        {!loading && total > 0 && !hidden && (
          <p className={`mt-1 text-sm font-medium ${change >= 0 ? "text-kb-green" : "text-kb-red"}`}>
            {change >= 0 ? "+" : "-"}
            {formatUsd(Math.abs(change))} ({formatPct(changePct)})
          </p>
        )}

        <div className="mt-6 grid w-full grid-cols-4 px-2">
          <ActionButton href="/send" label="Envoyer" icon={<ArrowUp size={22} />} />
          <ActionButton href="/receive" label="Recevoir" icon={<ArrowDown size={22} />} />
          <ActionButton href="/market" label="Marché" icon={<Chart size={22} />} />
          <ActionButton href="/transactions" label="Activité" icon={<Clock size={22} />} />
        </div>
      </section>

      <div className="flex border-b border-kb-border px-4">
        {(["crypto", "activity"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative mr-6 pb-3 text-[15px] font-semibold ${tab === t ? "text-kb-text" : "text-kb-muted"}`}
          >
            {t === "crypto" ? "Crypto" : "Activité"}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-kb-blue" />}
          </button>
        ))}
      </div>

      {tab === "crypto" ? (
        <div className="py-1">
          {tokens.map((t) => {
            const pct = t.price?.price_change_percentage_24h ?? 0;
            const chain = CHAINS[t.id];
            return (
              <Link key={t.id} href={`/market/${t.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-kb-card">
                <TokenIcon id={t.id} image={t.price?.image} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[15px] font-semibold">{t.symbol}</span>
                    {chain?.type === "TOKEN" && (
                      <span className="rounded-md bg-kb-card px-1.5 py-0.5 text-[10px] font-medium text-kb-muted">{chain.network}</span>
                    )}
                  </div>
                  <p className="text-[13px] text-kb-muted">
                    {t.price ? formatUsd(t.price.current_price) : "—"}{" "}
                    <span className={pct >= 0 ? "text-kb-green" : "text-kb-red"}>{formatPct(pct)}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-semibold">{hidden ? HIDDEN : formatAmount(t.amount, 6)}</p>
                  <p className="text-[13px] text-kb-muted">{hidden ? HIDDEN : formatUsd(t.value)}</p>
                </div>
              </Link>
            );
          })}
          <p className="px-4 pb-2 pt-4 text-center text-xs text-kb-muted">
            Simulation : les cryptos KryptoBase n&apos;ont aucune valeur réelle.
          </p>
        </div>
      ) : txLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />
        </div>
      ) : txs.length === 0 ? (
        <EmptyActivity />
      ) : (
        <TransactionList txs={txs.slice(0, 10)} priceOf={priceOf} />
      )}

      <TabBar />
    </div>
  );
}
