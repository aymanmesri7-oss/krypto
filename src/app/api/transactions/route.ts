import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, all } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await initDb();
  const cryptoId = request.nextUrl.searchParams.get("cryptoId");

  const rows = all<{
    id: number;
    sender_id: number | null;
    receiver_id: number;
    crypto_id: string;
    amount: number;
    type: string;
    created_at: string;
    sender_address: string | null;
    receiver_address: string | null;
  }>(
    `SELECT t.id, t.sender_id, t.receiver_id, t.crypto_id, t.amount, t.type, t.created_at,
      sa.address AS sender_address,
      ra.address AS receiver_address
    FROM transactions t
    LEFT JOIN wallet_addresses sa ON sa.user_id = t.sender_id AND sa.crypto_id = t.crypto_id
    LEFT JOIN wallet_addresses ra ON ra.user_id = t.receiver_id AND ra.crypto_id = t.crypto_id
    WHERE (t.sender_id = ? OR t.receiver_id = ?)${cryptoId ? " AND t.crypto_id = ?" : ""}
    ORDER BY t.id DESC
    LIMIT 100`,
    cryptoId ? [session.userId, session.userId, cryptoId] : [session.userId, session.userId]
  );

  return NextResponse.json(
    rows.map((t) => {
      const direction = t.sender_id === session.userId ? "sent" : "received";
      return {
        id: t.id,
        type: t.type,
        direction,
        cryptoId: t.crypto_id,
        amount: t.amount,
        createdAt: t.created_at.replace(" ", "T") + "Z",
        fromAddress: t.sender_address,
        toAddress: t.receiver_address,
      };
    })
  );
}
