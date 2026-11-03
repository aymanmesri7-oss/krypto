import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, get } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  await initDb();
  const user = get<{ id: number; email: string; role: string; wallet_address: string }>(
    "SELECT id, email, role, wallet_address FROM users WHERE id = ?",
    [session.userId]
  );

  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    email: user.email,
    role: user.role,
    walletAddress: user.wallet_address,
  });
}
