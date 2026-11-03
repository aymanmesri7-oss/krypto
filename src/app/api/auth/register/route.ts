import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { initDb, run, get } from "@/lib/db";
import { createSession, EMAIL_PATTERN, PASSCODE_PATTERN } from "@/lib/auth";
import { ensureAddresses, generateEvmAddress } from "@/lib/wallet";

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const passcode = String(body.passcode ?? "");

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }
    if (!PASSCODE_PATTERN.test(passcode)) {
      return NextResponse.json({ error: "Le code doit contenir 6 chiffres" }, { status: 400 });
    }

    if (get("SELECT id FROM users WHERE email = ?", [email])) {
      return NextResponse.json({ error: "Un wallet existe déjà avec cet email" }, { status: 409 });
    }

    const isFirstUser = !get("SELECT id FROM users LIMIT 1");
    run(
      "INSERT INTO users (email, password, wallet_address, role) VALUES (?, ?, ?, ?)",
      [email, hashSync(passcode, 10), generateEvmAddress(), isFirstUser ? "admin" : "user"]
    );

    const user = get<{ id: number; email: string; role: string }>(
      "SELECT id, email, role FROM users WHERE email = ?",
      [email]
    );
    if (!user) {
      return NextResponse.json({ error: "Erreur lors de la création du wallet" }, { status: 500 });
    }

    ensureAddresses(user.id);
    await createSession({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
