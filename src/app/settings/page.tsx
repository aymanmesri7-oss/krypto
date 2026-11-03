"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TabBar from "@/components/TabBar";
import { Check, ChevronRight, Copy, Crown, Dollar, Info, Lock, Logout, Mail, Wallet } from "@/components/icons";
import { shortAddress } from "@/lib/format";
import { useWalletData, WALLET_NAME } from "@/lib/useWalletData";

function Row({
  Icon,
  label,
  value,
  onClick,
  href,
  danger,
  trailing,
}: {
  Icon: (p: { size?: number; className?: string }) => React.ReactNode;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  trailing?: React.ReactNode;
}) {
  const content = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-kb-red/15 text-kb-red" : "bg-kb-blue/15 text-kb-blue"}`}>
        <Icon size={18} />
      </span>
      <span className={`flex-1 text-[15px] font-medium ${danger ? "text-kb-red" : ""}`}>{label}</span>
      {value && <span className="truncate text-sm text-kb-muted">{value}</span>}
      {trailing ?? ((href || onClick) && !danger ? <ChevronRight size={18} className="text-kb-muted" /> : null)}
    </>
  );
  const className = "flex w-full items-center gap-3 px-4 py-3 text-left active:bg-kb-card-hover";
  if (href) return <Link href={href} className={className}>{content}</Link>;
  if (onClick) return <button onClick={onClick} className={className}>{content}</button>;
  return <div className={className}>{content}</div>;
}

export default function SettingsPage() {
  const router = useRouter();
  const { me } = useWalletData();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!me) return;
    await navigator.clipboard.writeText(me.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/welcome");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-center">
        <h1 className="text-[17px] font-semibold">Paramètres</h1>
      </header>

      <div className="space-y-5 px-4 pt-2">
        <div className="overflow-hidden rounded-2xl bg-kb-card">
          <Row Icon={Wallet} label="Wallet" value={WALLET_NAME} />
          <Row Icon={Mail} label="Email" value={me?.email ?? "…"} />
          <Row
            Icon={Copy}
            label="Adresse EVM"
            value={me ? shortAddress(me.walletAddress) : "…"}
            onClick={copyAddress}
            trailing={copied ? <Check size={18} className="text-kb-green" /> : <Copy size={16} className="text-kb-muted" />}
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-kb-card">
          <Row Icon={Lock} label="Code d'accès" value="6 chiffres" />
          <Row Icon={Dollar} label="Devise" value="USD" />
        </div>

        {me?.role === "admin" && (
          <div className="overflow-hidden rounded-2xl bg-kb-card">
            <Row Icon={Crown} label="Panel admin" href="/admin" />
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-kb-card">
          <Row Icon={Info} label="À propos" value="KryptoBase v2.0" />
          <p className="px-4 pb-4 text-[13px] leading-relaxed text-kb-muted">
            KryptoBase est une plateforme de simulation. Les cryptos n&apos;ont aucune valeur réelle et les prix proviennent de CoinGecko.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-kb-card">
          <Row Icon={Logout} label="Se déconnecter" onClick={logout} danger />
        </div>
      </div>

      <TabBar />
    </div>
  );
}
