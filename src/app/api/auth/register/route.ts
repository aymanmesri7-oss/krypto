import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { initDb, run, get } from "@/lib/db";
import { createSession, PASSCODE_PATTERN } from "@/lib/auth";
import { hashSeedPhrase, isValidSeedPhrase } from "@/lib/seed";
import { ensureAddresses, generateEvmAddress } from "@/lib/wallet";

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const passcode = String(body.passcode ?? "");
    const seedPhrase = String(body.seedPhrase ?? "");
    const walletName = String(body.walletName ?? "Main Wallet 1").trim() || "Main Wallet 1";

    if (!PASSCODE_PATTERN.test(passcode)) {
      return NextResponse.json({ error: "Le code doit contenir 6 chiffres" }, { status: 400 });
    }
    if (!isValidSeedPhrase(seedPhrase)) {
      return NextResponse.json({ error: "Phrase de récupération invalide" }, { status: 400 });
    }

    const seedHash = hashSeedPhrase(seedPhrase);
    if (get("SELECT id FROM users WHERE seed_hash = ?", [seedHash])) {
      return NextResponse.json({ error: "Ce wallet existe déjà" }, { status: 409 });
    }

    const isFirstUser = !get("SELECT id FROM users LIMIT 1");
    run(
      "INSERT INTO users (wallet_name, seed_hash, email, password, wallet_address, role) VALUES (?, ?, ?, ?, ?, ?)",
      [walletName, seedHash, "", hashSync(passcode, 10), generateEvmAddress(), isFirstUser ? "admin" : "user"]
    );

    const user = get<{ id: number; wallet_name: string; role: string }>(
      "SELECT id, wallet_name, role FROM users WHERE seed_hash = ?",
      [seedHash]
    );
    if (!user) {
      return NextResponse.json({ error: "Erreur lors de la création du wallet" }, { status: 500 });
    }

    ensureAddresses(user.id);
    await createSession({ userId: user.id, walletName: user.wallet_name, role: user.role });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
