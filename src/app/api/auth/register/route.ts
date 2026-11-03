import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { initDb, run, get, all } from "@/lib/db";
import { createSession, generateWalletAddress } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await initDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    }

    const existing = get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashedPassword = hashSync(password, 10);
    const walletAddress = generateWalletAddress();

    const users = all("SELECT id FROM users");
    const role = users.length === 0 ? "admin" : "user";

    run(
      "INSERT INTO users (email, password, wallet_address, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, walletAddress, role]
    );

    const user = get<{ id: number; email: string; role: string }>(
      "SELECT id, email, role FROM users WHERE email = ?",
      [email]
    );

    if (!user) {
      return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 });
    }

    await createSession({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      message: "Compte créé avec succès",
      user: { email: user.email, role: user.role, walletAddress },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
