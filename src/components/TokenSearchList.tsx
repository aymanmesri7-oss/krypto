"use client";

import { useState } from "react";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";
import { CHAINS } from "@/lib/chains";
import TokenIcon from "./TokenIcon";
import { Search } from "./icons";

export default function TokenSearchList({
  images,
  subtitle,
  right,
  onSelect,
  order,
}: {
  images: Record<string, string | undefined>;
  subtitle: (id: string) => React.ReactNode;
  right?: (id: string) => React.ReactNode;
  onSelect: (id: string) => void;
  order?: (a: string, b: string) => number;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const items = SUPPORTED_CRYPTOS.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
  ).sort((a, b) => (order ? order(a.id, b.id) : 0));

  return (
    <div>
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-xl bg-kb-card px-3">
          <Search size={18} className="text-kb-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher"
            className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-kb-muted"
          />
        </div>
      </div>

      {items.length === 0 && <p className="py-12 text-center text-sm text-kb-muted">Aucun résultat</p>}

      {items.map((c) => {
        const chain = CHAINS[c.id];
        return (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3 active:bg-kb-card">
            <button onClick={() => onSelect(c.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <TokenIcon id={c.id} image={images[c.id]} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-semibold">{c.symbol}</span>
                  <span className="rounded-md bg-kb-card px-1.5 py-0.5 text-[10px] font-medium text-kb-muted">{chain?.network}</span>
                </div>
                <p className="truncate text-[13px] text-kb-muted">{subtitle(c.id)}</p>
              </div>
            </button>
            {right?.(c.id)}
          </div>
        );
      })}
    </div>
  );
}
