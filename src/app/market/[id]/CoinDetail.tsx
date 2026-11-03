"use client";

import { useEffect, useState } from "react";
import ScreenHeader from "@/components/ScreenHeader";
import TokenIcon from "@/components/TokenIcon";
import ActionButton from "@/components/ActionButton";
import TransactionList from "@/components/TransactionList";
import EmptyActivity from "@/components/EmptyActivity";
import { ArrowDown, ArrowUp } from "@/components/icons";
import { CHAINS, getCrypto } from "@/lib/chains";
import { compactUsd, formatAmount, formatPct, formatUsd } from "@/lib/format";
import { useTransactions, useWalletData } from "@/lib/useWalletData";

const PERIODS = [
  { label: "1J", days: 1 },
  { label: "1S", days: 7 },
  { label: "1M", days: 30 },
  { label: "1A", days: 365 },
];

export default function CoinDetail({ id }: { id: string }) {
  const meta = getCrypto(id);
  const chain = CHAINS[id];
  const { balances, priceOf } = useWalletData();
  const { txs, loading: txLoading } = useTransactions(id);
  const [days, setDays] = useState(7);
  const [history, setHistory] = useState<[number, number][]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    setChartLoading(true);
    fetch(`/api/prices?coinId=${id}&days=${days}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.prices ?? []))
      .catch(() => setHistory([]))
      .finally(() => setChartLoading(false));
  }, [id, days]);

  if (!meta) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader />
        <p className="py-20 text-center text-kb-muted">Crypto introuvable</p>
      </div>
    );
  }

  const price = priceOf(id);
  const current = price?.current_price ?? 0;
  const balance = balances[id] ?? 0;
  const periodChange =
    history.length > 1 ? ((history[history.length - 1][1] - history[0][1]) / history[0][1]) * 100 : price?.price_change_percentage_24h ?? 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title={meta.symbol} subtitle={`${chain?.type === "TOKEN" ? "TOKEN" : "COIN"} | ${meta.name}`} />

      <section className="flex flex-col items-center px-4 pb-6 pt-2">
        <TokenIcon id={id} image={price?.image} size={56} />
        <p className="mt-4 text-[32px] font-bold leading-tight">
          {formatAmount(balance)} {meta.symbol}
        </p>
        <p className="mt-1 text-[15px] text-kb-muted">≈ {formatUsd(balance * current)}</p>

        <div className="mt-6 flex gap-10">
          <ActionButton href={`/send?crypto=${id}`} label="Envoyer" icon={<ArrowUp size={22} />} />
          <ActionButton href={`/receive?crypto=${id}`} label="Recevoir" icon={<ArrowDown size={22} />} />
        </div>
      </section>

      <section className="mx-4 rounded-2xl bg-kb-card p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] text-kb-muted">Prix {meta.symbol}</p>
            <p className="text-xl font-bold">{price ? formatUsd(current) : "—"}</p>
          </div>
          <p className={`text-sm font-semibold ${periodChange >= 0 ? "text-kb-green" : "text-kb-red"}`}>{formatPct(periodChange)}</p>
        </div>

        <div className="mt-3 h-[150px]">
          {chartLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />
            </div>
          ) : (
            <PriceChart points={history} positive={periodChange >= 0} />
          )}
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-kb-dark p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-lg py-1.5 text-[13px] font-semibold ${days === p.days ? "bg-kb-card-hover text-kb-text" : "text-kb-muted"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {price && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-kb-border pt-4 text-sm">
            <div>
              <p className="text-kb-muted">Cap. marché</p>
              <p className="font-semibold">{compactUsd(price.market_cap)}</p>
            </div>
            <div>
              <p className="text-kb-muted">Réseau</p>
              <p className="font-semibold">{chain?.network}</p>
            </div>
          </div>
        )}
      </section>

      <h2 className="px-4 pt-6 text-[17px] font-semibold">Transactions</h2>
      {txLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />
        </div>
      ) : txs.length === 0 ? (
        <EmptyActivity receiveHref={`/receive?crypto=${id}`} />
      ) : (
        <TransactionList txs={txs} priceOf={priceOf} />
      )}
      <div className="h-8" />
    </div>
  );
}

function PriceChart({ points, positive }: { points: [number, number][]; positive: boolean }) {
  if (points.length < 2) {
    return <div className="flex h-full items-center justify-center text-sm text-kb-muted">Données indisponibles</div>;
  }
  const values = points.map(([, v]) => v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 400;
  const h = 150;
  const coords = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 6 - ((v - min) / range) * (h - 12)}`);
  const color = positive ? "#2EBD85" : "#F6465D";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${coords.join(" ")} ${w},${h}`} fill="url(#chartFill)" />
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
