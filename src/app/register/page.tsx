"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/components/ScreenHeader";
import PasscodePad from "@/components/PasscodePad";
import { Check, Copy, Info, Lock, Shield } from "@/components/icons";
import { WALLET_NAME } from "@/lib/useWalletData";

type Step = "terms" | "create" | "confirm" | "seed" | "verify" | "done";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("terms");
  const [accepted, setAccepted] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [padError, setPadError] = useState("");
  const [padKey, setPadKey] = useState(0);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedCopied, setSeedCopied] = useState(false);
  const [verifyIndices, setVerifyIndices] = useState<number[]>([]);
  const [verifyAnswers, setVerifyAnswers] = useState<Record<number, string>>({});
  const [verifyError, setVerifyError] = useState("");
  const [busy, setBusy] = useState(false);

  const resetPad = (error: string) => {
    setPadError(error);
    setPadKey((k) => k + 1);
  };

  useEffect(() => {
    if (step === "seed" && seedPhrase.length === 0) {
      fetch("/api/auth/generate-seed")
        .then((r) => r.json())
        .then((d) => setSeedPhrase(d.words))
        .catch(() => setSeedPhrase([]));
    }
  }, [step, seedPhrase.length]);

  useEffect(() => {
    if (step === "verify" && verifyIndices.length === 0 && seedPhrase.length === 12) {
      const indices = new Set<number>();
      while (indices.size < 3) {
        indices.add(Math.floor(Math.random() * 12));
      }
      setVerifyIndices(Array.from(indices).sort((a, b) => a - b));
      setVerifyAnswers({});
      setVerifyError("");
    }
  }, [step, verifyIndices.length, seedPhrase.length]);

  const onCreate = (code: string) => {
    setPasscode(code);
    setPadError("");
    setPadKey((k) => k + 1);
    setStep("confirm");
  };

  const onConfirm = (code: string) => {
    if (code !== passcode) {
      setStep("create");
      resetPad("Les codes ne correspondent pas. Recommencez.");
      return;
    }
    setStep("seed");
  };

  const copySeed = async () => {
    await navigator.clipboard.writeText(seedPhrase.join(" "));
    setSeedCopied(true);
    setTimeout(() => setSeedCopied(false), 2000);
  };

  const submitVerification = async () => {
    for (const idx of verifyIndices) {
      if ((verifyAnswers[idx] ?? "").trim().toLowerCase() !== seedPhrase[idx]) {
        setVerifyError("Un ou plusieurs mots sont incorrects. Vérifiez votre phrase.");
        return;
      }
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, seedPhrase: seedPhrase.join(" ") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? "Erreur serveur");
        return;
      }
      setStep("done");
    } catch {
      setVerifyError("Erreur de connexion au serveur");
    } finally {
      setBusy(false);
    }
  };

  if (step === "terms") {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader backHref="/welcome" />
        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold">Avant de commencer</h1>
          <p className="mt-2 text-sm text-kb-muted">Veuillez lire ces points importants.</p>

          <div className="mt-6 space-y-3">
            {[
              { Icon: Info, text: "KryptoBase est une plateforme de simulation. Les cryptos n'ont aucune valeur réelle et ne peuvent pas être retirées." },
              { Icon: Shield, text: "Vous recevrez une phrase secrète de 12 mots. Ne la partagez jamais et ne saisissez jamais ici la phrase d'un vrai wallet." },
              { Icon: Lock, text: "Votre code d'accès à 6 chiffres protège votre wallet. Gardez-le pour vous." },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex gap-3 rounded-2xl bg-kb-card p-4">
                <Icon size={22} className="mt-0.5 shrink-0 text-kb-blue" />
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="safe-bottom space-y-4 px-6 pb-8 pt-4">
          <label className="flex cursor-pointer items-center gap-3">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                accepted ? "border-kb-blue bg-kb-blue" : "border-kb-muted"
              }`}
            >
              {accepted && <Check size={16} strokeWidth={3} className="text-white" />}
            </span>
            <input type="checkbox" className="sr-only" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span className="text-sm">J&apos;ai lu et j&apos;accepte les conditions d&apos;utilisation</span>
          </label>
          <button className="btn-primary" disabled={!accepted} onClick={() => setStep("create")}>
            Continuer
          </button>
        </div>
      </div>
    );
  }

  if (step === "create" || step === "confirm") {
    const creating = step === "create";
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader onBack={() => (creating ? setStep("terms") : (setStep("create"), resetPad("")))} />
        <PasscodePad
          key={`${step}-${padKey}`}
          title={creating ? "Créez un code d'accès" : "Confirmez votre code"}
          subtitle={
            creating
              ? "Choisissez un code à 6 chiffres pour protéger votre wallet."
              : "Saisissez à nouveau votre code d'accès."
          }
          error={padError}
          busy={busy}
          onComplete={creating ? onCreate : onConfirm}
        />
      </div>
    );
  }

  if (step === "seed") {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader onBack={() => setStep("create")} />
        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold">Phrase secrète</h1>
          <p className="mt-2 text-sm leading-relaxed text-kb-muted">
            Notez ces 12 mots dans l&apos;ordre. C&apos;est le seul moyen de récupérer votre wallet.
          </p>

          <div className="mt-4 rounded-2xl bg-kb-card p-4">
            <div className="rounded-xl bg-amber-500/10 p-3 text-center text-[13px] font-medium text-amber-400">
              Ne partagez jamais votre phrase secrète
            </div>

            {seedPhrase.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {seedPhrase.map((word, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-kb-dark px-3 py-2.5">
                    <span className="w-5 text-right text-[13px] text-kb-muted">{i + 1}</span>
                    <span className="text-[15px] font-medium">{word}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={copySeed} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-kb-dark py-3 text-sm font-medium">
              {seedCopied ? <Check size={16} className="text-kb-green" /> : <Copy size={16} className="text-kb-muted" />}
              {seedCopied ? "Copié !" : "Copier la phrase"}
            </button>
          </div>
        </div>

        <div className="safe-bottom px-6 pb-8">
          <button className="btn-primary" disabled={seedPhrase.length !== 12} onClick={() => setStep("verify")}>
            J&apos;ai noté ma phrase
          </button>
        </div>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader onBack={() => { setStep("seed"); setVerifyIndices([]); }} />
        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold">Vérification</h1>
          <p className="mt-2 text-sm leading-relaxed text-kb-muted">
            Confirmez votre phrase secrète en saisissant les mots demandés.
          </p>

          <div className="mt-6 space-y-4">
            {verifyIndices.map((idx) => (
              <div key={idx}>
                <label className="mb-1.5 block text-sm text-kb-muted">Mot n°{idx + 1}</label>
                <input
                  type="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  value={verifyAnswers[idx] ?? ""}
                  onChange={(e) => setVerifyAnswers((a) => ({ ...a, [idx]: e.target.value }))}
                  placeholder={`Entrez le mot n°${idx + 1}`}
                  className="tw-input"
                />
              </div>
            ))}
          </div>

          {verifyError && <p className="mt-4 text-sm text-kb-red">{verifyError}</p>}
        </div>

        <div className="safe-bottom px-6 pb-8">
          <button
            className="btn-primary"
            disabled={busy || verifyIndices.some((i) => !(verifyAnswers[i] ?? "").trim())}
            onClick={submitVerification}
          >
            {busy ? "Création en cours..." : "Confirmer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="animate-pop relative mb-10 flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-kb-green/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-kb-green">
            <Check size={52} strokeWidth={3} className="text-white" />
          </div>
        </div>
        <h1 className="animate-fade-up text-center text-[26px] font-bold">Votre wallet est prêt !</h1>
        <p className="animate-fade-up mt-3 text-center text-[15px] leading-relaxed text-kb-muted">
          {WALLET_NAME} a été créé. Vos adresses Bitcoin, Ethereum, Solana et autres ont été générées.
        </p>
      </div>
      <div className="safe-bottom px-6 pb-8">
        <button className="btn-primary" onClick={() => router.replace("/dashboard")}>
          Accéder à mon wallet
        </button>
      </div>
    </div>
  );
}
