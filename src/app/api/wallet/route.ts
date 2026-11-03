import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";
import { ensureAddresses } from "@/lib/wallet";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  await initDb();
  const addresses = ensureAddresses(session.userId);

  const cryptoId = request.nextUrl.searchParams.get("cryptoId");
  if (cryptoId) {
    const address = addresses.get(cryptoId);
    if (!address) return NextResponse.json({ error: "Crypto inconnue" }, { status: 404 });
    return NextResponse.json({ cryptoId, address });
  }

  return NextResponse.json(
    SUPPORTED_CRYPTOS.map((c) => ({
      cryptoId: c.id,
      symbol: c.symbol,
      name: c.name,
      address: addresses.get(c.id)!,
    }))
  );
}
