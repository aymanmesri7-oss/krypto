"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Chart, Shield } from "@/components/icons";

const SLIDES = [
  {
    Icon: Shield,
    title: "Votre wallet crypto, simplement",
    text: "Créez un wallet en quelques secondes et apprenez à gérer vos cryptos sans aucun risque.",
  },
  {
    Icon: ArrowUpRight,
    title: "Envoyez et recevez",
    text: "Transférez du BTC, de l'ETH, du SOL et plus encore entre utilisateurs KryptoBase.",
  },
  {
    Icon: Chart,
    title: "Le marché en direct",
    text: "Suivez les cours en temps réel de 10 cryptomonnaies majeures.",
  },
];

export default function WelcomePage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center justify-center gap-2 pt-6">
        <img src="/logo.webp" alt="" className="h-7 w-7 rounded-lg" />
        <span className="text-base font-semibold">KryptoBase</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div key={index} className="animate-fade-up flex flex-col items-center">
          <div className="relative mb-12 flex h-52 w-52 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-kb-blue/20 blur-3xl" />
            <div className="absolute inset-6 rounded-full border border-kb-blue/30" />
            <div className="absolute inset-14 rounded-full border border-kb-blue/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-kb-blue to-kb-violet shadow-2xl shadow-kb-blue/40">
              <slide.Icon size={44} strokeWidth={2} className="text-white" />
            </div>
          </div>
          <h1 className="text-center text-[26px] font-bold leading-tight">{slide.title}</h1>
          <p className="mt-3 text-center text-[15px] leading-relaxed text-kb-muted">{slide.text}</p>
        </div>

        <div className="mt-8 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Diapositive ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-kb-blue" : "w-2 bg-kb-border"}`}
            />
          ))}
        </div>
      </div>

      <div className="safe-bottom space-y-2 px-6 pb-8">
        <Link href="/register" className="btn-primary block text-center">
          Créer un nouveau wallet
        </Link>
        <Link href="/login" className="btn-ghost block text-center">
          J&apos;ai déjà un wallet
        </Link>
        <p className="pt-2 text-center text-[11px] text-kb-muted">
          Simulation : aucune vraie cryptomonnaie n&apos;est utilisée.
        </p>
      </div>
    </div>
  );
}
