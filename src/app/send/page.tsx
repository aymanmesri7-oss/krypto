"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";

interface Balance {
  crypto_id: string;
  amount: number;
}

export default function SendPage() {
  const router = useRouter();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [cryptoId, setCryptoId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => {
      if (!r.ok) router.push("/login");
    });
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        setBalances(data);
        if (data.length > 0) setCryptoId(data[0].crypto_id);
      });
  }, [router]);

  const selectedBalance = balances.find((b) => b.crypto_id === cryptoId);
  const meta = SUPPORTED_CRYPTOS.find((c) => c.id === cryptoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cryptoId, recipient, amount: parseFloat(amount) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(data.message);
      setAmount("");
      setRecipient("");

      const balanceRes = await fetch("/api/portfolio");
      if (balanceRes.ok) setBalances(await balanceRes.json());
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-kb-card border border-kb-border flex items-center justify-center text-kb-muted hover:text-kb-text">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-base font-bold">Envoyer</h1>
          <div className="w-9" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-kb-red/10 border border-kb-red/20 text-kb-red px-4 py-3 rounded-2xl text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-kb-green/10 border border-kb-green/20 text-kb-green px-4 py-3 rounded-2xl text-sm">{success}</div>
          )}

          {/* Recipient */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="flex-1 bg-transparent text-kb-text placeholder-kb-muted focus:outline-none text-sm"
                placeholder="Adresse ou nom de domaine"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <select
                value={cryptoId}
                onChange={(e) => setCryptoId(e.target.value)}
                className="bg-kb-input border border-kb-border rounded-full px-3 py-1.5 text-xs text-kb-text focus:outline-none"
              >
                {balances.length === 0 && <option value="">Aucune crypto</option>}
                {balances.map((b) => {
                  const m = SUPPORTED_CRYPTOS.find((c) => c.id === b.crypto_id);
                  return (
                    <option key={b.crypto_id} value={b.crypto_id}>
                      {m?.name ?? b.crypto_id}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  setRecipient(text);
                }}
                className="ml-auto bg-kb-blue text-white text-xs font-semibold px-4 py-1.5 rounded-full"
              >
                Coller
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="card p-5 text-center">
            <p className="text-4xl font-bold mb-1 text-kb-text">
              {amount || "0"}
            </p>
            <p className="text-sm text-kb-muted mb-4">
              {selectedBalance
                ? `${selectedBalance.amount.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${meta?.symbol?.toUpperCase()} disponible`
                : "Aucun solde"}
            </p>

            <div className="flex items-center gap-3 justify-center mb-4">
              {meta && (
                <span className="text-xs text-kb-muted bg-kb-input rounded-full px-3 py-1 border border-kb-border">
                  {meta.symbol?.toUpperCase()}
                </span>
              )}
              {selectedBalance && (
                <button
                  type="button"
                  onClick={() => setAmount(String(selectedBalance.amount))}
                  className="text-xs font-semibold bg-kb-card-hover text-kb-text px-4 py-1 rounded-full border border-kb-border"
                >
                  Max
                </button>
              )}
            </div>

            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-kb-input border border-kb-border rounded-2xl px-4 py-3 text-kb-text text-center focus:outline-none focus:border-kb-blue"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || balances.length === 0}
            className="btn-primary text-center"
          >
            {loading ? "Envoi en cours..." : "Vérifier"}
          </button>
        </form>

        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
