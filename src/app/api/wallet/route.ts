import { NextRequest, NextResponse } from "next/server";
import { getSession, generateCryptoAddress } from "@/lib/auth";
import { initDb, get, all, run } from "@/lib/db";
import { SUPPORTED_CRYPTOS } from "@/lib/coingecko";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  await initDb();

  const cryptoId = request.nextUrl.searchParams.get("cryptoId");

  if (cryptoId) {
    let addr = get<{ address: string }>(
      "SELECT address FROM wallet_addresses WHERE user_id = ? AND crypto_id = ?",
      [session.userId, cryptoId]
    );

    if (!addr) {
      const newAddress = generateCryptoAddress(cryptoId);
      run(
        "INSERT INTO wallet_addresses (user_id, crypto_id, address) VALUES (?, ?, ?)",
        [session.userId, cryptoId, newAddress]
      );
      addr = { address: newAddress };
    }

    return NextResponse.json({ cryptoId, address: addr.address });
  }

  const existing = all<{ crypto_id: string; address: string }>(
    "SELECT crypto_id, address FROM wallet_addresses WHERE user_id = ?",
    [session.userId]
  );

  const existingMap = new Map(existing.map((e) => [e.crypto_id, e.address]));

  for (const crypto of SUPPORTED_CRYPTOS) {
    if (!existingMap.has(crypto.id)) {
      const newAddress = generateCryptoAddress(crypto.id);
      run(
        "INSERT INTO wallet_addresses (user_id, crypto_id, address) VALUES (?, ?, ?)",
        [session.userId, crypto.id, newAddress]
      );
      existingMap.set(crypto.id, newAddress);
    }
  }

  const addresses = SUPPORTED_CRYPTOS.map((c) => ({
    cryptoId: c.id,
    symbol: c.symbol,
    name: c.name,
    address: existingMap.get(c.id)!,
  }));

  return NextResponse.json(addresses);
}
