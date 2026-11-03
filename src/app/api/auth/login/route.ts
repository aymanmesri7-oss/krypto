import { NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { initDb, get } from "@/lib/db";
import { clearLoginFailures, createSession, loginLockRemaining, recordLoginFailure } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const passcode = String(body.passcode ?? "");

    if (!email || !passcode) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
    }

    const lock = loginLockRemaining(email);
    if (lock > 0) {
      const minutes = Math.ceil(lock / 60000);
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} min.` },
        { status: 429 }
      );
    }

    const user = get<{ id: number; email: string; password: string; role: string }>(
      "SELECT id, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (!user || !compareSync(passcode, user.password)) {
      recordLoginFailure(email);
      return NextResponse.json({ error: "Email ou code incorrect" }, { status: 401 });
    }

    clearLoginFailures(email);
    await createSession({ userId: user.id, email: user.email, role: user.role });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
