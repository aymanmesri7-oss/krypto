"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/dashboard",
    label: "Wallet",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3375FF" : "#5E6673"} strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M2 10h20" />
        <circle cx="17" cy="15" r="1.5" fill={active ? "#3375FF" : "#5E6673"} stroke="none" />
      </svg>
    ),
  },
  {
    href: "/market",
    label: "Marché",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3375FF" : "#5E6673"} strokeWidth="1.8">
        <polyline points="3 17 8 12 12 15 21 6" />
        <polyline points="17 6 21 6 21 10" />
      </svg>
    ),
  },
  {
    href: "/send",
    label: "Envoyer",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3375FF" : "#5E6673"} strokeWidth="1.8">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    ),
  },
  {
    href: "/receive",
    label: "Recevoir",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3375FF" : "#5E6673"} strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12l7 7 7-7" />
      </svg>
    ),
  },
  {
    href: "/transactions",
    label: "Activité",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3375FF" : "#5E6673"} strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-kb-darker border-t border-kb-border z-50 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-1 px-2 min-w-[56px]"
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-medium ${active ? "text-kb-blue" : "text-kb-muted"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
