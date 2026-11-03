"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";

interface CryptoAddress {
  cryptoId: string;
  symbol: string;
  name: string;
  address: string;
}

interface PriceData {
  id: string;
  image: string;
}

export default function ReceiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addresses, setAddresses] = useState<CryptoAddress[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState(searchParams.get("crypto") || "bitcoin");
  const [copied, setCopied] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) { router.push("/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        return fetch("/api/wallet");
      })
      .then((r) => r?.json())
      .then((data: CryptoAddress[] | undefined) => {
        if (data) setAddresses(data);
      });

    fetch("/api/prices")
      .then((r) => r.json())
      .then((prices: PriceData[]) => {
        const map: Record<string, string> = {};
        prices.forEach((p) => { map[p.id] = p.image; });
        setImages(map);
      })
      .catch(() => {});
  }, [router]);

  const currentAddress = addresses.find((a) => a.cryptoId === selectedCrypto);
  const currentMeta = SUPPORTED_CRYPTOS.find((c) => c.id === selectedCrypto);

  useEffect(() => {
    if (currentAddress?.address && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, currentAddress.address, {
        width: 220,
        color: { dark: "#EAECEF", light: "#141922" },
        margin: 2,
      });
    }
  }, [currentAddress?.address]);

  const handleCopy = async () => {
    if (!currentAddress) return;
    await navigator.clipboard.writeText(currentAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!currentAddress) return;
    if (navigator.share) {
      await navigator.share({ text: currentAddress.address });
    } else {
      handleCopy();
    }
  };

  const networkName = (cryptoId: string) => {
    const networks: Record<string, string> = {
      bitcoin: "Bitcoin",
      ethereum: "Ethereum (ERC-20)",
      tether: "Ethereum (ERC-20)",
      solana: "Solana",
      binancecoin: "BNB Smart Chain",
      ripple: "XRP Ledger",
      dogecoin: "Dogecoin",
      cardano: "Cardano",
      "avalanche-2": "Avalanche C-Chain",
      "matic-network": "Polygon",
    };
    return networks[cryptoId] || cryptoId;
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-kb-card border border-kb-border flex items-center justify-center text-kb-muted hover:text-kb-text">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-base font-bold">Recevoir</h1>
          <div className="w-9" />
        </div>

        <div className="text-center space-y-5">
          <div className="flex justify-center">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="bg-kb-card border border-kb-border rounded-2xl px-4 py-2.5 inline-flex items-center gap-2.5 hover:bg-kb-card-hover transition-colors"
            >
              {images[selectedCrypto] ? (
                <img src={images[selectedCrypto]} alt={currentMeta?.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full gradient-bg" />
              )}
              <span className="font-semibold text-sm">{currentMeta?.symbol}</span>
              <span className="text-kb-muted text-xs">{currentMeta?.name}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-kb-muted ml-1">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {showSelector && (
            <div className="card p-2 max-h-64 overflow-y-auto">
              {SUPPORTED_CRYPTOS.map((crypto) => (
                <button
                  key={crypto.id}
                  onClick={() => { setSelectedCrypto(crypto.id); setShowSelector(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    selectedCrypto === crypto.id ? "bg-kb-blue/10" : "hover:bg-kb-card-hover"
                  }`}
                >
                  {images[crypto.id] ? (
                    <img src={images[crypto.id]} alt={crypto.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full gradient-bg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{crypto.symbol}</span>
                      <span className="text-xs text-kb-muted">{crypto.name}</span>
                    </div>
                    <p className="text-[10px] text-kb-muted">{networkName(crypto.id)}</p>
                  </div>
                  {selectedCrypto === crypto.id && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3375FF" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-center">
            <div className="bg-kb-card border border-kb-border rounded-full px-4 py-1.5 text-[11px] font-medium text-kb-muted inline-flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-kb-green" />
              {networkName(selectedCrypto)}
            </div>
          </div>

          {currentAddress ? (
            <div className="card p-5 inline-block mx-auto">
              <canvas ref={canvasRef} className="rounded-xl" />
              <p className="text-xs font-mono text-kb-muted mt-4 break-all px-2 leading-relaxed">
                {currentAddress.address}
              </p>
            </div>
          ) : (
            <div className="card p-5 inline-block mx-auto">
              <div className="w-[220px] h-[220px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-kb-blue border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

          <div className="bg-kb-yellow/5 border border-kb-yellow/20 rounded-2xl px-4 py-3 flex items-start gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#F0B90B" className="shrink-0 mt-0.5">
              <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6z" />
              <path d="M11 10h2v5h-2zm0 6h2v2h-2z" fill="#0B0E11" />
            </svg>
            <p className="text-xs text-kb-muted text-left">
              Envoyez uniquement du <strong className="text-kb-text">{currentMeta?.symbol}</strong> ({networkName(selectedCrypto)}) à cette adresse. Tout autre actif sera perdu définitivement.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center justify-center gap-2 !py-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              {copied ? "Copié !" : "Copier"}
            </button>
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center justify-center gap-2 !py-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Partager
            </button>
          </div>
        </div>

        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
