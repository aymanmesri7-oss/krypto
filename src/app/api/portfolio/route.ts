import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, all } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await initDb();

  const balances = all<{ crypto_id: string; amount: number }>(
    "SELECT crypto_id, amount FROM balances WHERE user_id = ? AND amount > 0",
    [session.userId]
  );

  return NextResponse.json(balances);
}
