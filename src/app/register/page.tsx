"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        <img src="/logo.webp" alt="KryptoBase" className="w-20 h-20 rounded-2xl mb-6" />
        <h1 className="text-2xl font-bold text-center mb-2">Créer un portefeuille</h1>
        <p className="text-kb-muted text-sm text-center mb-8">
          Commencez à simuler le trading crypto
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {error && (
            <div className="bg-kb-red/10 border border-kb-red/20 text-kb-red px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-kb-card border border-kb-border rounded-2xl px-4 py-3.5 text-kb-text placeholder-kb-muted focus:outline-none focus:border-kb-blue transition-colors text-sm"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-kb-card border border-kb-border rounded-2xl px-4 py-3.5 text-kb-text placeholder-kb-muted focus:outline-none focus:border-kb-blue transition-colors text-sm"
              placeholder="Mot de passe (6 caractères min.)"
              required
              minLength={6}
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-kb-card border border-kb-border rounded-2xl px-4 py-3.5 text-kb-text placeholder-kb-muted focus:outline-none focus:border-kb-blue transition-colors text-sm"
              placeholder="Confirmer le mot de passe"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Création..." : "Créer un portefeuille"}
          </button>
        </form>
      </div>

      {/* Bottom link */}
      <div className="pb-8 text-center">
        <p className="text-sm text-kb-muted">
          Déjà un portefeuille ?{" "}
          <Link href="/login" className="text-kb-blue font-medium">
            Se connecter
          </Link>
        </p>
        <p className="text-[10px] text-kb-muted mt-4 px-6">
          En créant un compte, vous acceptez nos Conditions de service et notre Politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
