"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";

interface Transaction {
  id: number;
  sender_id: number | null;
  receiver_id: number;
  crypto_id: string;
  amount: number;
  type: string;
  created_at: string;
  sender_email: string | null;
  receiver_email: string;
  direction: "sent" | "received";
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (!r.ok) router.push("/login");
    });

    fetch("/api/transactions")
      .then((r) => r.json())
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const getCryptoSymbol = (id: string) =>
    SUPPORTED_CRYPTOS.find((c) => c.id === id)?.symbol ?? id.toUpperCase();

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-kb-card border border-kb-border flex items-center justify-center text-kb-muted hover:text-kb-text">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-bold">Activité</h1>
          <div className="w-9" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-kb-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-kb-card flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5E6673" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-1">Aucune activité</h3>
            <p className="text-sm text-kb-muted">
              Vos transactions apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3 px-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === "mint"
                    ? "bg-kb-violet/15"
                    : tx.direction === "received"
                      ? "bg-kb-green/15"
                      : "bg-kb-red/15"
                }`}>
                  {tx.type === "mint" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B3FE4" strokeWidth="2">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  ) : tx.direction === "received" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F6465D" strokeWidth="2">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {tx.type === "mint"
                      ? "Crédit (mint)"
                      : tx.direction === "received"
                        ? `Reçu de ${tx.sender_email ?? "Système"}`
                        : `Envoyé à ${tx.receiver_email}`}
                  </p>
                  <p className="text-xs text-kb-muted">
                    {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold text-sm ${
                    tx.direction === "sent" ? "text-kb-red" : "text-kb-green"
                  }`}>
                    {tx.direction === "sent" ? "-" : "+"}
                    {tx.amount.toLocaleString("en-US", { maximumFractionDigits: 8 })} {getCryptoSymbol(tx.crypto_id)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
