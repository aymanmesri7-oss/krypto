import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, get, run } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await initDb();
  const { cryptoId, recipient, amount } = await request.json();

  if (!cryptoId || !recipient || !amount || amount <= 0) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  let receiverUser = get<{ id: number }>(
    "SELECT id FROM users WHERE wallet_address = ?",
    [recipient]
  );

  if (!receiverUser) {
    receiverUser = get<{ id: number }>(
      "SELECT id FROM users WHERE email = ?",
      [recipient]
    );
  }

  if (!receiverUser) {
    return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
  }

  if (receiverUser.id === session.userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas envoyer à vous-même" }, { status: 400 });
  }

  const senderBalance = get<{ amount: number }>(
    "SELECT amount FROM balances WHERE user_id = ? AND crypto_id = ?",
    [session.userId, cryptoId]
  );

  if (!senderBalance || senderBalance.amount < amount) {
    return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
  }

  run(
    "UPDATE balances SET amount = amount - ? WHERE user_id = ? AND crypto_id = ?",
    [amount, session.userId, cryptoId]
  );

  const receiverBalance = get(
    "SELECT id FROM balances WHERE user_id = ? AND crypto_id = ?",
    [receiverUser.id, cryptoId]
  );

  if (receiverBalance) {
    run(
      "UPDATE balances SET amount = amount + ? WHERE user_id = ? AND crypto_id = ?",
      [amount, receiverUser.id, cryptoId]
    );
  } else {
    run(
      "INSERT INTO balances (user_id, crypto_id, amount) VALUES (?, ?, ?)",
      [receiverUser.id, cryptoId, amount]
    );
  }

  run(
    "INSERT INTO transactions (sender_id, receiver_id, crypto_id, amount, type) VALUES (?, ?, ?, ?, 'transfer')",
    [session.userId, receiverUser.id, cryptoId, amount]
  );

  return NextResponse.json({ message: "Transaction effectuée avec succès" });
}
