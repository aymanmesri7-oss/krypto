"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import ScreenHeader from "@/components/ScreenHeader";
import TokenIcon from "@/components/TokenIcon";
import TokenSearchList from "@/components/TokenSearchList";
import { Check, Close, Copy, Dollar, Share, Warning } from "@/components/icons";
import { CHAINS, getCrypto } from "@/lib/chains";
import { formatAmount, shortAddress } from "@/lib/format";
import type { CryptoPrice } from "@/lib/coingecko";

interface CryptoAddress {
  cryptoId: string;
  address: string;
}

export default function ReceiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cryptoId = searchParams.get("crypto");
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => {
        if (r.status === 401) router.replace("/welcome");
        return r.ok ? r.json() : [];
      })
      .then((rows: CryptoAddress[]) => setAddresses(Object.fromEntries(rows.map((r) => [r.cryptoId, r.address]))))
      .catch(() => {});
    fetch("/api/prices")
      .then((r) => r.json())
      .then((prices: CryptoPrice[]) => setImages(Object.fromEntries(prices.map((p) => [p.id, p.image]))))
      .catch(() => {});
  }, [router]);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!cryptoId || !getCrypto(cryptoId)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenHeader title="Recevoir" />
        <TokenSearchList
          images={images}
          subtitle={(id) => (addresses[id] ? shortAddress(addresses[id], 8, 6) : "…")}
          right={(id) =>
            addresses[id] ? (
              <button
                onClick={() => copy(addresses[id])}
                aria-label="Copier l'adresse"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kb-card text-kb-text"
              >
                {copied === addresses[id] ? <Check size={18} className="text-kb-green" /> : <Copy size={18} />}
              </button>
            ) : null
          }
          onSelect={(id) => router.push(`/receive?crypto=${id}`)}
        />
        {copied && <Toast text="Adresse copiée" />}
      </div>
    );
  }

  return <ReceiveScreen key={cryptoId} cryptoId={cryptoId} address={addresses[cryptoId]} image={images[cryptoId]} />;
}

function ReceiveScreen({ cryptoId, address, image }: { cryptoId: string; address?: string; image?: string }) {
  const meta = getCrypto(cryptoId)!;
  const chain = CHAINS[cryptoId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [requested, setRequested] = useState<number | null>(null);
  const [amountOpen, setAmountOpen] = useState(false);
  const [toast, setToast] = useState("");

  const qrValue = address ? (requested ? `${cryptoId}:${address}?amount=${requested}` : address) : "";

  useEffect(() => {
    if (!qrValue || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, qrValue, {
      width: 220,
      margin: 0,
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  }, [qrValue]);

  const flash = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 1500);
  };

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    flash("Adresse copiée");
  };

  const share = async () => {
    if (!address) return;
    const text = `Mon adresse ${meta.symbol} (${chain.network}) : ${address}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      flash("Copié dans le presse-papiers");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <ScreenHeader title={`Recevoir ${meta.symbol}`} backHref="/receive" />
      <div className="flex flex-1 flex-col items-center px-6 pt-2">
        <div className="flex w-full items-start gap-3 rounded-2xl bg-kb-yellow/10 px-4 py-3">
          <Warning size={20} className="mt-0.5 shrink-0 text-kb-yellow" />
          <p className="text-[13px] leading-relaxed text-kb-yellow">
            Envoyez uniquement des actifs {meta.name} ({meta.symbol}) sur le réseau {chain.network} à cette adresse.
            Tout autre actif sera définitivement perdu.
          </p>
        </div>

        <div className="mt-6 flex w-full max-w-[300px] flex-col items-center rounded-3xl bg-white p-6">
          <div className="relative flex h-[220px] w-[220px] items-center justify-center">
            {address ? (
              <>
                <canvas ref={canvasRef} className="h-[220px] w-[220px]" />
                <div className="absolute rounded-full bg-white p-1.5">
                  <TokenIcon id={cryptoId} image={image} size={40} />
                </div>
              </>
            ) : (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />
            )}
          </div>
          <p className="mt-5 break-all text-center font-mono text-[13px] leading-relaxed text-neutral-700">
            {address ?? "…"}
          </p>
        </div>

        {requested && (
          <p className="mt-4 text-[15px] font-semibold">
            Montant demandé : {formatAmount(requested)} {meta.symbol}
          </p>
        )}

        <div className="mt-8 grid w-full max-w-[300px] grid-cols-3">
          {[
            { label: "Copier", Icon: Copy, onClick: copy },
            { label: "Montant", Icon: Dollar, onClick: () => setAmountOpen(true) },
            { label: "Partager", Icon: Share, onClick: share },
          ].map(({ label, Icon, onClick }) => (
            <button key={label} onClick={onClick} className="flex flex-col items-center gap-2">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-kb-card active:bg-kb-card-hover">
                <Icon size={22} />
              </span>
              <span className="text-[13px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {amountOpen && (
        <AmountSheet
          symbol={meta.symbol}
          initial={requested}
          onClose={() => setAmountOpen(false)}
          onConfirm={(value) => {
            setRequested(value);
            setAmountOpen(false);
          }}
        />
      )}
      {toast && <Toast text={toast} />}
    </div>
  );
}

function AmountSheet({
  symbol,
  initial,
  onClose,
  onConfirm,
}: {
  symbol: string;
  initial: number | null;
  onClose: () => void;
  onConfirm: (value: number | null) => void;
}) {
  const [text, setText] = useState(initial ? String(initial) : "");
  const value = parseFloat(text.replace(",", ".")) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="animate-sheet safe-bottom w-full max-w-[440px] rounded-t-3xl bg-kb-dark px-4 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pt-4">
          <div className="w-10" />
          <h2 className="text-[17px] font-semibold">Définir le montant</h2>
          <button onClick={onClose} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-kb-card">
            <Close size={22} />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-transparent bg-kb-card px-4 focus-within:border-kb-blue">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value.replace(/[^0-9.,]/g, ""))}
            inputMode="decimal"
            placeholder="Montant"
            className="min-w-0 flex-1 bg-transparent py-4 text-[15px] outline-none placeholder:text-kb-muted"
          />
          <span className="text-sm text-kb-muted">{symbol}</span>
        </div>
        <div className="mt-6 space-y-2">
          <button className="btn-primary" disabled={value <= 0} onClick={() => onConfirm(value)}>
            Confirmer
          </button>
          {initial && (
            <button className="btn-ghost" onClick={() => onConfirm(null)}>
              Supprimer le montant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="animate-fade-up fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg">
      {text}
    </div>
  );
}
