import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { initDb, get, run } from "@/lib/db";
import { CHAINS, getCrypto, isValidAddress, normalizeAddress } from "@/lib/chains";
import { ensureAddresses } from "@/lib/wallet";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await initDb();
  const body = await request.json();
  const cryptoId = String(body.cryptoId ?? "");
  const amount = Number(body.amount);
  const crypto = getCrypto(cryptoId);

  if (!crypto || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const recipient = String(body.recipient ?? "");
  if (!isValidAddress(cryptoId, recipient)) {
    return NextResponse.json(
      { error: `Adresse ${CHAINS[cryptoId].network} invalide` },
      { status: 400 }
    );
  }

  const address = normalizeAddress(cryptoId, recipient);
  const receiver = get<{ id: number }>(
    "SELECT user_id AS id FROM wallet_addresses WHERE crypto_id = ? AND address = ?",
    [cryptoId, address]
  );

  if (!receiver) {
    return NextResponse.json(
      { error: "Aucun wallet KryptoBase ne correspond à cette adresse" },
      { status: 404 }
    );
  }

  if (receiver.id === session.userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer des fonds à vous-même" }, { status: 400 });
  }

  const senderBalance = get<{ amount: number }>(
    "SELECT amount FROM balances WHERE user_id = ? AND crypto_id = ?",
    [session.userId, cryptoId]
  );

  if (!senderBalance || senderBalance.amount < amount) {
    return NextResponse.json({ error: `Solde ${crypto.symbol} insuffisant` }, { status: 400 });
  }

  run(
    "UPDATE balances SET amount = amount - ? WHERE user_id = ? AND crypto_id = ?",
    [amount, session.userId, cryptoId]
  );

  if (get("SELECT id FROM balances WHERE user_id = ? AND crypto_id = ?", [receiver.id, cryptoId])) {
    run(
      "UPDATE balances SET amount = amount + ? WHERE user_id = ? AND crypto_id = ?",
      [amount, receiver.id, cryptoId]
    );
  } else {
    run("INSERT INTO balances (user_id, crypto_id, amount) VALUES (?, ?, ?)", [receiver.id, cryptoId, amount]);
  }

  run(
    "INSERT INTO transactions (sender_id, receiver_id, crypto_id, amount, type) VALUES (?, ?, ?, ?, 'transfer')",
    [session.userId, receiver.id, cryptoId, amount]
  );

  ensureAddresses(session.userId);
  return NextResponse.json({ ok: true });
}
