import { NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { initDb, get } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await initDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = get<{ id: number; email: string; password: string; role: string }>(
      "SELECT id, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (!user || !compareSync(password, user.password)) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }

    await createSession({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      message: "Connexion réussie",
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
