"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/components/ScreenHeader";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";
import { shortAddress } from "@/lib/format";

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
  const [userId, setUserId] = useState("");
  const [cryptoId, setCryptoId] = useState("bitcoin");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me) router.replace("/welcome");
        else if (me.role !== "admin") router.replace("/dashboard");
      })
      .catch(() => router.replace("/welcome"));

    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: User[]) => {
        setUsers(data);
        if (data.length > 0) setUserId(String(data[0].id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const mint = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setMinting(true);
    try {
      const res = await fetch("/api/admin/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parseInt(userId), cryptoId, amount: parseFloat(amount.replace(",", ".")) }),
      });
      const data = await res.json();
      setMessage({ ok: res.ok, text: res.ok ? data.message : data.error });
      if (res.ok) setAmount("");
    } catch {
      setMessage({ ok: false, text: "Erreur serveur" });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title="Panel admin" backHref="/settings" />

      <div className="space-y-6 px-4 pb-10 pt-2">
        <form onSubmit={mint} className="space-y-3 rounded-2xl bg-kb-card p-4">
          <h2 className="text-[15px] font-semibold">Créditer un wallet</h2>
          {message && (
            <p className={`rounded-xl px-3 py-2 text-sm ${message.ok ? "bg-kb-green/10 text-kb-green" : "bg-kb-red/10 text-kb-red"}`}>
              {message.text}
            </p>
          )}
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="tw-input !bg-kb-dark">
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
                {u.role === "admin" ? " (admin)" : ""}
              </option>
            ))}
          </select>
          <select value={cryptoId} onChange={(e) => setCryptoId(e.target.value)} className="tw-input !bg-kb-dark">
            {SUPPORTED_CRYPTOS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
            inputMode="decimal"
            placeholder="Montant"
            className="tw-input !bg-kb-dark"
            required
          />
          <button type="submit" disabled={minting || !amount} className="btn-primary">
            {minting ? "En cours..." : "Créditer"}
          </button>
        </form>

        <div>
          <h2 className="mb-2 text-[15px] font-semibold">Utilisateurs ({users.length})</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />
            </div>
          ) : (
            <div className="divide-y divide-kb-border overflow-hidden rounded-2xl bg-kb-card">
              {users.map((u) => (
                <div key={u.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{u.email}</span>
                    {u.role === "admin" && (
                      <span className="rounded-full bg-kb-blue px-2 py-0.5 text-[10px] font-semibold text-white">Admin</span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-kb-muted">{shortAddress(u.wallet_address, 10, 8)}</p>
                  <p className="text-xs text-kb-muted">
                    Inscrit le {new Date(u.created_at.replace(" ", "T") + "Z").toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
