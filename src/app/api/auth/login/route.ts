import { NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { initDb, get } from "@/lib/db";
import { clearLoginFailures, createSession, loginLockRemaining, PASSCODE_PATTERN, recordLoginFailure } from "@/lib/auth";
import { hashSeedPhrase, isValidSeedPhrase } from "@/lib/seed";

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const seedPhrase = String(body.seedPhrase ?? "");
    const passcode = String(body.passcode ?? "");

    if (!seedPhrase || !passcode) {
      return NextResponse.json({ error: "Phrase et code requis" }, { status: 400 });
    }
    if (!isValidSeedPhrase(seedPhrase)) {
      return NextResponse.json({ error: "Phrase de récupération invalide" }, { status: 400 });
    }
    if (!PASSCODE_PATTERN.test(passcode)) {
      return NextResponse.json({ error: "Le code doit contenir 6 chiffres" }, { status: 400 });
    }

    const seedHash = hashSeedPhrase(seedPhrase);

    const lock = loginLockRemaining(seedHash);
    if (lock > 0) {
      const minutes = Math.ceil(lock / 60000);
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} min.` },
        { status: 429 }
      );
    }

    const user = get<{ id: number; wallet_name: string; password: string; role: string }>(
      "SELECT id, wallet_name, password, role FROM users WHERE seed_hash = ?",
      [seedHash]
    );

    if (!user || !compareSync(passcode, user.password)) {
      recordLoginFailure(seedHash);
      return NextResponse.json({ error: "Phrase ou code incorrect" }, { status: 401 });
    }

    clearLoginFailures(seedHash);
    await createSession({ userId: user.id, walletName: user.wallet_name, role: user.role });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
