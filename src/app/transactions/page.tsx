"use client";

import TabBar from "@/components/TabBar";
import TransactionList from "@/components/TransactionList";
import EmptyActivity from "@/components/EmptyActivity";
import { useTransactions, useWalletData } from "@/lib/useWalletData";

export default function TransactionsPage() {
  const { priceOf } = useWalletData();
  const { txs, loading } = useTransactions();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-center">
        <h1 className="text-[17px] font-semibold">Activité</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />
        </div>
      ) : txs.length === 0 ? (
        <EmptyActivity />
      ) : (
        <TransactionList txs={txs} priceOf={priceOf} />
      )}

      <TabBar />
    </div>
  );
}
