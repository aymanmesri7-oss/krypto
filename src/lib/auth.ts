import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kryptobase-secret-key-change-in-production-2024"
);

const COOKIE_NAME = "kb_session";

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function generateWalletAddress(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

const CHAIN_PREFIXES: Record<string, { prefix: string; length: number; charset: string }> = {
  bitcoin: { prefix: "bc1q", length: 38, charset: "023456789acdefghjklmnpqrstuvwxyz" },
  ethereum: { prefix: "0x", length: 40, charset: "0123456789abcdef" },
  tether: { prefix: "0x", length: 40, charset: "0123456789abcdef" },
  solana: { prefix: "", length: 44, charset: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" },
  binancecoin: { prefix: "bnb1", length: 38, charset: "023456789acdefghjklmnpqrstuvwxyz" },
  ripple: { prefix: "r", length: 33, charset: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" },
  dogecoin: { prefix: "D", length: 33, charset: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" },
  cardano: { prefix: "addr1q", length: 58, charset: "023456789acdefghjklmnpqrstuvwxyz" },
  "avalanche-2": { prefix: "0x", length: 40, charset: "0123456789abcdef" },
  "matic-network": { prefix: "0x", length: 40, charset: "0123456789abcdef" },
};

export function generateCryptoAddress(cryptoId: string): string {
  const config = CHAIN_PREFIXES[cryptoId];
  if (!config) return generateWalletAddress();
  const remaining = config.length - config.prefix.length;
  const bytes = new Uint8Array(remaining);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes).map(b => config.charset[b % config.charset.length]).join("");
  return config.prefix + chars;
}
