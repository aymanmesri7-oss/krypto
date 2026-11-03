"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/components/ScreenHeader";
import PasscodePad from "@/components/PasscodePad";
import { Check, Info, Lock, Shield } from "@/components/icons";
import { WALLET_NAME } from "@/lib/useWalletData";

type Step = "terms" | "email" | "create" | "confirm" | "done";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("terms");
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passcode, setPasscode] = useState("");
  const [padError, setPadError] = useState("");
  const [padKey, setPadKey] = useState(0);
  const [busy, setBusy] = useState(false);

  const resetPad = (error: string) => {
    setPadError(error);
    setPadKey((k) => k + 1);
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError("Adresse email invalide");
      return;
    }
    setEmailError("");
    setPadError("");
    setStep("create");
  };

  const onCreate = (code: string) => {
    setPasscode(code);
    setPadError("");
    setPadKey((k) => k + 1);
    setStep("confirm");
  };

  const onConfirm = async (code: string) => {
    if (code !== passcode) {
      setStep("create");
      resetPad("Les codes ne correspondent pas. Recommencez.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), passcode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 || res.status === 400) {
          setEmailError(data.error);
          setStep("email");
        } else {
          resetPad(data.error ?? "Erreur serveur");
        }
        return;
      }
      setStep("done");
    } catch {
      resetPad("Erreur de connexion au serveur");
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
              { Icon: Shield, text: "Ne saisissez jamais ici la phrase de récupération d'un vrai wallet. KryptoBase ne vous la demandera jamais." },
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
          <button className="btn-primary" disabled={!accepted} onClick={() => setStep("email")}>
            Continuer
          </button>
        </div>
      </div>
    );
  }

  if (step === "email") {
    return (
      <form onSubmit={submitEmail} className="flex min-h-dvh flex-col">
        <ScreenHeader onBack={() => setStep("terms")} />
        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold">Ajoutez votre email</h1>
          <p className="mt-2 text-sm leading-relaxed text-kb-muted">
            Il vous permettra d&apos;accéder à votre wallet depuis n&apos;importe quel appareil.
          </p>
          <input
            type="email"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresse email"
            className={`tw-input mt-8 ${emailError ? "!border-kb-red" : ""}`}
          />
          {emailError && <p className="mt-2 text-sm text-kb-red">{emailError}</p>}
        </div>
        <div className="safe-bottom px-6 pb-8">
          <button type="submit" className="btn-primary" disabled={!email.trim()}>
            Continuer
          </button>
        </div>
      </form>
    );
  }

  if (step === "create" || step === "confirm") {
    const creating = step === "create";
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader onBack={() => (creating ? setStep("email") : (setStep("create"), resetPad("")))} />
        <PasscodePad
          key={`${step}-${padKey}`}
          title={creating ? "Créez un code d'accès" : "Confirmez votre code"}
          subtitle={
            creating
              ? "Choisissez un code à 6 chiffres. Il vous sera demandé pour accéder à votre wallet."
              : "Saisissez à nouveau votre code d'accès."
          }
          error={padError}
          busy={busy}
          onComplete={creating ? onCreate : onConfirm}
        />
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
