"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Chart, Clock, Home, Settings } from "./icons";

const TABS = [
  { href: "/dashboard", label: "Accueil", Icon: Home },
  { href: "/market", label: "Marché", Icon: Chart },
  { href: "/transactions", label: "Activité", Icon: Clock },
  { href: "/settings", label: "Paramètres", Icon: Settings },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <>
      <div className="h-20" />
      <nav className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-[440px] -translate-x-1/2 border-t border-kb-border/60 bg-kb-darker/95 backdrop-blur">
        <div className="flex h-16 items-center justify-around">
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-w-[64px] flex-col items-center gap-1 ${active ? "text-kb-blue" : "text-kb-muted"}`}
              >
                <Icon size={24} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
