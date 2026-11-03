"use client";

import { useState } from "react";
import type { CryptoPrice } from "@/lib/coingecko";
import type { Tx } from "@/lib/useWalletData";
import { CHAINS, getCrypto } from "@/lib/chains";
import { formatAmount, formatUsd, shortAddress } from "@/lib/format";
import TokenIcon from "./TokenIcon";
import { ArrowDownLeft, ArrowUpRight, Check, Close, Copy, Plus } from "./icons";

function dayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function txTitle(tx: Tx) {
  if (tx.type === "mint") return "Crédit";
  return tx.direction === "sent" ? "Envoi" : "Réception";
}

function txCounterparty(tx: Tx) {
  if (tx.type === "mint") return "De : KryptoBase";
  return tx.direction === "sent"
    ? `À : ${shortAddress(tx.toAddress ?? "—")}`
    : `De : ${shortAddress(tx.fromAddress ?? "—")}`;
}

function TxIcon({ tx, size = 40 }: { tx: Tx; size?: number }) {
  const Icon = tx.type === "mint" ? Plus : tx.direction === "sent" ? ArrowUpRight : ArrowDownLeft;
  return (
    <div className="flex shrink-0 items-center justify-center rounded-full bg-kb-card" style={{ width: size, height: size }}>
      <Icon size={size * 0.5} strokeWidth={2.2} />
    </div>
  );
}

export default function TransactionList({
  txs,
  priceOf,
}: {
  txs: Tx[];
  priceOf: (id: string) => CryptoPrice | undefined;
}) {
  const [selected, setSelected] = useState<Tx | null>(null);

  const groups: { label: string; items: Tx[] }[] = [];
  for (const tx of txs) {
    const label = dayLabel(new Date(tx.createdAt));
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(tx);
    else groups.push({ label, items: [tx] });
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-4 pb-1 pt-4 text-[13px] font-medium text-kb-muted">{group.label}</p>
          {group.items.map((tx) => {
            const meta = getCrypto(tx.cryptoId);
            const sent = tx.direction === "sent";
            return (
              <button
                key={tx.id}
                onClick={() => setSelected(tx)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-kb-card"
              >
                <TxIcon tx={tx} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">{txTitle(tx)}</p>
                  <p className="truncate text-[13px] text-kb-muted">{txCounterparty(tx)}</p>
                </div>
                <p className={`shrink-0 text-[15px] font-semibold ${sent ? "" : "text-kb-green"}`}>
                  {sent ? "-" : "+"}
                  {formatAmount(tx.amount)} {meta?.symbol}
                </p>
              </button>
            );
          })}
        </div>
      ))}

      {selected && <TxSheet tx={selected} price={priceOf(selected.cryptoId)?.current_price ?? 0} onClose={() => setSelected(null)} />}
    </>
  );
}

function TxSheet({ tx, price, onClose }: { tx: Tx; price: number; onClose: () => void }) {
  const meta = getCrypto(tx.cryptoId);
  const sent = tx.direction === "sent";
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  const rows: { label: string; value: string; copyable?: string }[] = [
    {
      label: "Date",
      value: new Date(tx.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    },
    { label: "Statut", value: "Terminée" },
  ];
  if (tx.type === "mint") rows.push({ label: "Source", value: "Crédit KryptoBase" });
  else if (sent) rows.push({ label: "Destinataire", value: shortAddress(tx.toAddress ?? "—", 8, 6), copyable: tx.toAddress ?? undefined });
  else rows.push({ label: "Expéditeur", value: shortAddress(tx.fromAddress ?? "—", 8, 6), copyable: tx.fromAddress ?? undefined });
  rows.push({ label: "Réseau", value: CHAINS[tx.cryptoId]?.network ?? "—" });
  rows.push({ label: "Frais de réseau", value: `0 ${meta?.symbol} ($0.00)` });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="animate-sheet safe-bottom w-full max-w-[440px] rounded-t-3xl bg-kb-dark pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="w-10" />
          <h2 className="text-[17px] font-semibold">{txTitle(tx)}</h2>
          <button onClick={onClose} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-kb-card">
            <Close size={22} />
          </button>
        </div>

        <div className="flex flex-col items-center px-6 pb-6 pt-4">
          <TokenIcon id={tx.cryptoId} size={52} />
          <p className={`mt-4 text-3xl font-bold ${sent ? "" : "text-kb-green"}`}>
            {sent ? "-" : "+"}
            {formatAmount(tx.amount)} {meta?.symbol}
          </p>
          <p className="mt-1 text-sm text-kb-muted">≈ {formatUsd(tx.amount * price)}</p>
        </div>

        <div className="mx-4 divide-y divide-kb-border rounded-2xl bg-kb-card">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-kb-muted">{row.label}</span>
              <span className="flex items-center gap-2 text-sm font-medium">
                {row.label === "Statut" && <span className="h-2 w-2 rounded-full bg-kb-green" />}
                {row.value}
                {row.copyable && (
                  <button onClick={() => copy(row.copyable!)} aria-label="Copier" className="text-kb-muted">
                    {copied === row.copyable ? <Check size={16} className="text-kb-green" /> : <Copy size={16} />}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
