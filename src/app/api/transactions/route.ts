import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, all } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await initDb();

  const transactions = all<{
    id: number;
    sender_id: number | null;
    receiver_id: number;
    crypto_id: string;
    amount: number;
    type: string;
    created_at: string;
    sender_email: string | null;
    receiver_email: string;
  }>(
    `SELECT t.*,
      s.email as sender_email,
      r.email as receiver_email
    FROM transactions t
    LEFT JOIN users s ON t.sender_id = s.id
    JOIN users r ON t.receiver_id = r.id
    WHERE t.sender_id = ? OR t.receiver_id = ?
    ORDER BY t.created_at DESC
    LIMIT 50`,
    [session.userId, session.userId]
  );

  return NextResponse.json(
    transactions.map((t) => ({
      ...t,
      direction: t.sender_id === session.userId ? "sent" : "received",
    }))
  );
}
