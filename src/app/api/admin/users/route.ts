import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, all } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await initDb();

  const users = all<{
    id: number;
    email: string;
    wallet_address: string;
    role: string;
    created_at: string;
  }>("SELECT id, email, wallet_address, role, created_at FROM users ORDER BY created_at DESC");

  return NextResponse.json(users);
}
