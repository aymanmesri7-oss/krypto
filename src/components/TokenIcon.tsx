"use client";

import { useState } from "react";
import { getCrypto, CHAINS } from "@/lib/chains";

const CHAIN_BADGE: Record<string, string> = {
  tether: "ethereum",
};

export default function TokenIcon({ id, image, size = 40 }: { id: string; image?: string; size?: number }) {
  const meta = getCrypto(id);
  const src = image || meta?.image;
  const [failed, setFailed] = useState(false);
  const badgeId = CHAINS[id]?.type === "TOKEN" ? CHAIN_BADGE[id] : undefined;
  const badge = badgeId ? getCrypto(badgeId)?.image : undefined;
  const badgeSize = Math.round(size * 0.42);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src && !failed ? (
        <img
          src={src}
          alt={meta?.name ?? id}
          width={size}
          height={size}
          className="rounded-full bg-white/5"
          style={{ width: size, height: size }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-kb-blue font-bold text-white"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {meta?.symbol.charAt(0) ?? "?"}
        </div>
      )}
      {badge && (
        <img
          src={badge}
          alt=""
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-kb-dark bg-kb-dark"
          style={{ width: badgeSize, height: badgeSize }}
        />
      )}
    </div>
  );
}
