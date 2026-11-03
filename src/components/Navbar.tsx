"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-kb-dark/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <img src="/logo.webp" alt="KryptoBase" className="w-8 h-8 rounded-lg" />
          <span className="text-base font-bold gradient-text">KryptoBase</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  pathname === "/admin"
                    ? "gradient-bg text-white"
                    : "bg-kb-card text-kb-muted hover:text-kb-text border border-kb-border"
                }`}
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-kb-card border border-kb-border flex items-center justify-center text-kb-muted hover:text-kb-red transition-colors"
              title="Déconnexion"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
