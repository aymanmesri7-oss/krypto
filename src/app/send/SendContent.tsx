"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ScreenHeader from "@/components/ScreenHeader";
import TokenIcon from "@/components/TokenIcon";
import TokenSearchList from "@/components/TokenSearchList";
import { Check } from "@/components/icons";
import { CHAINS, getCrypto, isValidAddress } from "@/lib/chains";
import { formatAmount, formatUsd, shortAddress } from "@/lib/format";
import { useWalletData, WALLET_NAME } from "@/lib/useWalletData";

type Step = "form" | "confirm" | "done";

export default function SendContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cryptoId = searchParams.get("crypto");
  const { balances, priceOf, prices, reload } = useWalletData();

  const images = Object.fromEntries(prices.map((p) => [p.id, p.image]));

  if (!cryptoId || !getCrypto(cryptoId)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader title="Envoyer" />
        <TokenSearchList
          images={images}
          order={(a, b) => (balances[b] ?? 0) * (priceOf(b)?.current_price ?? 0) - (balances[a] ?? 0) * (priceOf(a)?.current_price ?? 0)}
          subtitle={(id) => getCrypto(id)?.name}
          right={(id) => (
            <div className="shrink-0 text-right">
              <p className="text-[15px] font-semibold">{formatAmount(balances[id] ?? 0, 6)}</p>
              <p className="text-[13px] text-kb-muted">{formatUsd((balances[id] ?? 0) * (priceOf(id)?.current_price ?? 0))}</p>
            </div>
          )}
          onSelect={(id) => router.push(`/send?crypto=${id}`)}
        />
      </div>
    );
  }

  return (
    <SendForm
      key={cryptoId}
      cryptoId={cryptoId}
      balance={balances[cryptoId] ?? 0}
      price={priceOf(cryptoId)?.current_price ?? 0}
      image={images[cryptoId]}
      onSent={reload}
    />
  );
}

function SendForm({
  cryptoId,
  balance,
  price,
  image,
  onSent,
}: {
  cryptoId: string;
  balance: number;
  price: number;
  image?: string;
  onSent: () => void;
}) {
  const router = useRouter();
  const meta = getCrypto(cryptoId)!;
  const chain = CHAINS[cryptoId];
  const [step, setStep] = useState<Step>("form");
  const [address, setAddress] = useState("");
  const [amountText, setAmountText] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/wallet?cryptoId=${cryptoId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setFromAddress(d.address))
      .catch(() => {});
  }, [cryptoId]);

  const amount = parseFloat(amountText.replace(",", ".")) || 0;
  const addressTouched = address.trim().length > 0;
  const addressValid = isValidAddress(cryptoId, address);
  const ownAddress = addressValid && fromAddress && address.trim().toLowerCase() === fromAddress.toLowerCase();
  const insufficient = amount > balance;
  const canContinue = addressValid && !ownAddress && amount > 0 && !insufficient;

  const paste = async () => {
    try {
      setAddress((await navigator.clipboard.readText()).trim());
    } catch {}
  };

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cryptoId, recipient: address.trim(), amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur serveur");
        return;
      }
      onSent();
      setStep("done");
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setSending(false);
    }
  };

  if (step === "done") {
    return (
      <div className="flex min-h-dvh flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className="animate-pop relative mb-8 flex h-32 w-32 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-kb-green/20 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-kb-green">
              <Check size={44} strokeWidth={3} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Transaction envoyée</h1>
          <p className="mt-3 text-3xl font-bold">
            -{formatAmount(amount)} {meta.symbol}
          </p>
          <p className="mt-1 text-sm text-kb-muted">≈ {formatUsd(amount * price)}</p>
          <p className="mt-6 text-center text-sm text-kb-muted">
            Envoyé à {shortAddress(address.trim(), 8, 6)}
          </p>
        </div>
        <div className="safe-bottom space-y-2 px-6 pb-8">
          <button className="btn-primary" onClick={() => router.replace("/dashboard")}>
            Terminé
          </button>
          <button className="btn-ghost" onClick={() => router.replace("/transactions")}>
            Voir l&apos;activité
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    const rows = [
      { label: "Actif", value: `${meta.name} (${meta.symbol})` },
      { label: "Wallet", value: `${WALLET_NAME} (${shortAddress(fromAddress)})` },
      { label: "Destinataire", value: shortAddress(address.trim(), 8, 6) },
      { label: "Réseau", value: chain.network },
    ];
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader title="Envoyer" onBack={() => { setStep("form"); setError(""); }} />
        <div className="flex-1 px-4">
          <div className="flex flex-col items-center pb-8 pt-6">
            <TokenIcon id={cryptoId} image={image} size={52} />
            <p className="mt-4 text-[34px] font-bold">
              -{formatAmount(amount)} {meta.symbol}
            </p>
            <p className="mt-1 text-[15px] text-kb-muted">≈ {formatUsd(amount * price)}</p>
          </div>

          <div className="divide-y divide-kb-border rounded-2xl bg-kb-card">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <span className="text-sm text-kb-muted">{r.label}</span>
                <span className="truncate text-sm font-medium">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 divide-y divide-kb-border rounded-2xl bg-kb-card">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-kb-muted">Frais de réseau</span>
              <span className="text-sm font-medium">0 {meta.symbol} ($0.00)</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-kb-muted">Total</span>
              <span className="text-sm font-semibold">{formatUsd(amount * price)}</span>
            </div>
          </div>

          {error && <p className="mt-4 rounded-xl bg-kb-red/10 px-4 py-3 text-sm text-kb-red">{error}</p>}
        </div>
        <div className="safe-bottom px-6 pb-8 pt-4">
          <button className="btn-primary" disabled={sending} onClick={send}>
            {sending ? "Envoi en cours..." : "Confirmer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title={`Envoyer ${meta.symbol}`} backHref="/send" />
      <div className="flex-1 space-y-5 px-4 pt-2">
        <div>
          <label className="mb-2 block text-sm text-kb-muted">Adresse du destinataire</label>
          <div className={`flex items-center gap-2 rounded-2xl border bg-kb-card px-4 ${addressTouched && !addressValid ? "border-kb-red" : "border-transparent focus-within:border-kb-blue"}`}>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Adresse ${chain.network}`}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="min-w-0 flex-1 bg-transparent py-4 text-[15px] outline-none placeholder:text-kb-muted"
            />
            {address ? (
              <button onClick={() => setAddress("")} className="text-sm font-semibold text-kb-muted">Effacer</button>
            ) : (
              <button onClick={paste} className="text-sm font-semibold text-kb-blue">Coller</button>
            )}
          </div>
          {addressTouched && !addressValid && (
            <p className="mt-2 text-sm text-kb-red">Adresse {chain.network} invalide</p>
          )}
          {ownAddress && <p className="mt-2 text-sm text-kb-red">C&apos;est l&apos;adresse de votre propre wallet</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm text-kb-muted">Montant</label>
          <div className={`flex items-center gap-2 rounded-2xl border bg-kb-card px-4 ${insufficient ? "border-kb-red" : "border-transparent focus-within:border-kb-blue"}`}>
            <input
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/[^0-9.,]/g, ""))}
              inputMode="decimal"
              placeholder={`Montant ${meta.symbol}`}
              className="min-w-0 flex-1 bg-transparent py-4 text-[15px] outline-none placeholder:text-kb-muted"
            />
            <span className="text-sm text-kb-muted">{meta.symbol}</span>
            <button onClick={() => setAmountText(String(balance))} className="text-sm font-semibold text-kb-blue">
              Max
            </button>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-kb-muted">≈ {formatUsd(amount * price)}</span>
            <span className={insufficient ? "text-kb-red" : "text-kb-muted"}>
              {insufficient ? `Solde ${meta.symbol} insuffisant` : `Disponible : ${formatAmount(balance)} ${meta.symbol}`}
            </span>
          </div>
        </div>
      </div>
      <div className="safe-bottom px-6 pb-8 pt-4">
        <button className="btn-primary" disabled={!canContinue} onClick={() => setStep("confirm")}>
          Suivant
        </button>
      </div>
    </div>
  );
}
