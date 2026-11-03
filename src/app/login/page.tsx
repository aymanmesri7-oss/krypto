"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
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
        <h1 className="text-2xl font-bold text-center mb-2">Bon retour !</h1>
        <p className="text-kb-muted text-sm text-center mb-8">
          Connectez-vous pour accéder à votre portefeuille
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
              placeholder="Mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>

      {/* Bottom link */}
      <div className="pb-8 text-center">
        <p className="text-sm text-kb-muted">
          Pas encore de portefeuille ?{" "}
          <Link href="/register" className="text-kb-blue font-medium">
            Créer un compte
          </Link>
        </p>
        <p className="text-[10px] text-kb-muted mt-4 px-6">
          En vous connectant, vous acceptez nos Conditions de service et notre Politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
