import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, get, run } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await initDb();
  const { userId, cryptoId, amount } = await request.json();

  if (!userId || !cryptoId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const user = get("SELECT id FROM users WHERE id = ?", [userId]);
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const existing = get(
    "SELECT id FROM balances WHERE user_id = ? AND crypto_id = ?",
    [userId, cryptoId]
  );

  if (existing) {
    run(
      "UPDATE balances SET amount = amount + ? WHERE user_id = ? AND crypto_id = ?",
      [amount, userId, cryptoId]
    );
  } else {
    run(
      "INSERT INTO balances (user_id, crypto_id, amount) VALUES (?, ?, ?)",
      [userId, cryptoId, amount]
    );
  }

  run(
    "INSERT INTO transactions (sender_id, receiver_id, crypto_id, amount, type) VALUES (NULL, ?, ?, ?, 'mint')",
    [userId, cryptoId, amount]
  );

  return NextResponse.json({ message: `${amount} ${cryptoId} crédité avec succès` });
}
