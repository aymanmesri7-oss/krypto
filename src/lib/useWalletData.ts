"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CryptoPrice } from "./coingecko";

export interface Me {
  email: string;
  role: string;
  walletAddress: string;
}

export interface Tx {
  id: number;
  type: "transfer" | "mint";
  direction: "sent" | "received";
  cryptoId: string;
  amount: number;
  createdAt: string;
  fromAddress: string | null;
  toAddress: string | null;
}

export function useWalletData() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [meRes, priceRes, balanceRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/prices"),
        fetch("/api/portfolio"),
      ]);
      if (!meRes.ok) {
        router.replace("/welcome");
        return;
      }
      setMe(await meRes.json());
      if (priceRes.ok) setPrices(await priceRes.json());
      if (balanceRes.ok) {
        const rows: { crypto_id: string; amount: number }[] = await balanceRes.json();
        setBalances(Object.fromEntries(rows.map((r) => [r.crypto_id, r.amount])));
      }
    } catch {
      // keep last known data on network errors
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const priceOf = useCallback((id: string) => prices.find((p) => p.id === id), [prices]);

  return { me, prices, balances, loading, reload: load, priceOf };
}

export function useTransactions(cryptoId?: string) {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(cryptoId ? `/api/transactions?cryptoId=${encodeURIComponent(cryptoId)}` : "/api/transactions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setTxs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cryptoId]);

  return { txs, loading };
}

export const WALLET_NAME = "Main Wallet 1";
