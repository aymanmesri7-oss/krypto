"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/components/ScreenHeader";
import PasscodePad from "@/components/PasscodePad";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "passcode">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [padKey, setPadKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const onPasscode = async (passcode: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), passcode }),
      });
      if (res.ok) {
        router.replace("/dashboard");
        return;
      }
      const data = await res.json();
      setError(data.error ?? "Erreur serveur");
      setPadKey((k) => k + 1);
    } catch {
      setError("Erreur de connexion au serveur");
      setPadKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  };

  if (step === "passcode") {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader onBack={() => { setStep("email"); setError(""); }} />
        <PasscodePad
          key={padKey}
          title="Entrez votre code d'accès"
          subtitle={email.trim()}
          error={error}
          busy={busy}
          onComplete={onPasscode}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        setStep("passcode");
      }}
      className="flex min-h-dvh flex-col"
    >
      <ScreenHeader backHref="/welcome" />
      <div className="flex-1 px-6">
        <h1 className="text-2xl font-bold">Accéder à votre wallet</h1>
        <p className="mt-2 text-sm leading-relaxed text-kb-muted">
          Saisissez l&apos;email utilisé lors de la création de votre wallet.
        </p>
        <input
          type="email"
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Adresse email"
          className="tw-input mt-8"
          required
        />
      </div>
      <div className="safe-bottom px-6 pb-8">
        <button type="submit" className="btn-primary" disabled={!email.trim()}>
          Continuer
        </button>
      </div>
    </form>
  );
}
