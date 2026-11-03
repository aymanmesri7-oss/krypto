"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";

interface User {
  id: number;
  email: string;
  wallet_address: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [mintUserId, setMintUserId] = useState("");
  const [mintCryptoId, setMintCryptoId] = useState("bitcoin");
  const [mintAmount, setMintAmount] = useState("");
  const [mintError, setMintError] = useState("");
  const [mintSuccess, setMintSuccess] = useState("");
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.role !== "admin") {
          router.push("/dashboard");
          return;
        }
      })
      .catch(() => router.push("/login"));

    fetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setUsers(data);
        if (data.length > 0) setMintUserId(String(data[0].id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setMintError("");
    setMintSuccess("");
    setMinting(true);

    try {
      const res = await fetch("/api/admin/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(mintUserId),
          cryptoId: mintCryptoId,
          amount: parseFloat(mintAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMintError(data.error);
        return;
      }
      setMintSuccess(data.message);
      setMintAmount("");
    } catch {
      setMintError("Erreur serveur");
    } finally {
      setMinting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <h1 className="text-xl font-bold text-center mb-6">Panel Admin</h1>

        {/* Mint form */}
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-kb-violet/15 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B3FE4" strokeWidth="2.5">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            Créditer un compte (Mint)
          </h2>

          <form onSubmit={handleMint} className="space-y-3">
            {mintError && (
              <div className="bg-kb-red/10 border border-kb-red/20 text-kb-red px-3 py-2 rounded-xl text-xs">{mintError}</div>
            )}
            {mintSuccess && (
              <div className="bg-kb-green/10 border border-kb-green/20 text-kb-green px-3 py-2 rounded-xl text-xs">{mintSuccess}</div>
            )}

            <select
              value={mintUserId}
              onChange={(e) => setMintUserId(e.target.value)}
              className="w-full bg-kb-input border border-kb-border rounded-xl px-4 py-3 text-sm text-kb-text focus:outline-none focus:border-kb-blue"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} {u.role === "admin" ? "(admin)" : ""}
                </option>
              ))}
            </select>

            <select
              value={mintCryptoId}
              onChange={(e) => setMintCryptoId(e.target.value)}
              className="w-full bg-kb-input border border-kb-border rounded-xl px-4 py-3 text-sm text-kb-text focus:outline-none focus:border-kb-blue"
            >
              {SUPPORTED_CRYPTOS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>

            <input
              type="number"
              step="any"
              min="0"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              className="w-full bg-kb-input border border-kb-border rounded-xl px-4 py-3 text-sm text-kb-text focus:outline-none focus:border-kb-blue"
              placeholder="Montant"
              required
            />

            <button type="submit" disabled={minting} className="btn-primary text-sm">
              {minting ? "En cours..." : "Créditer"}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Utilisateurs ({users.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-kb-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="card p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm">{user.email}</span>
                  {user.role === "admin" && (
                    <span className="text-[10px] gradient-bg text-white px-2 py-0.5 rounded-full font-semibold">Admin</span>
                  )}
                </div>
                <p className="text-[10px] text-kb-muted font-mono break-all">{user.wallet_address}</p>
                <p className="text-[10px] text-kb-muted mt-1">
                  Inscrit le {new Date(user.created_at).toLocaleDateString("fr-FR")}
                </p>
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
