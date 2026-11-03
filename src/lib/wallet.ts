import { all, get, run } from "./db";
import { SUPPORTED_CRYPTOS } from "./coingecko";
import { CHAINS, isValidAddress } from "./chains";

const GENERATORS: Record<string, { prefix: string; length: number; charset: string }> = {
  bitcoin: { prefix: "bc1q", length: 38, charset: "023456789acdefghjklmnpqrstuvwxyz" },
  solana: { prefix: "", length: 44, charset: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" },
  ripple: { prefix: "r", length: 33, charset: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" },
  dogecoin: { prefix: "D", length: 33, charset: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz" },
  cardano: { prefix: "addr1q", length: 58, charset: "023456789acdefghjklmnpqrstuvwxyz" },
};

function randomChars(count: number, charset: string): string {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => charset[b % charset.length]).join("");
}

export function generateEvmAddress(): string {
  return "0x" + randomChars(40, "0123456789abcdef");
}

function generateAddress(cryptoId: string): string {
  const config = GENERATORS[cryptoId];
  if (!config) return generateEvmAddress();
  return config.prefix + randomChars(config.length - config.prefix.length, config.charset);
}

// EVM chains share one address per user, like a real multi-chain wallet.
export function ensureAddresses(userId: number): Map<string, string> {
  const rows = all<{ crypto_id: string; address: string }>(
    "SELECT crypto_id, address FROM wallet_addresses WHERE user_id = ?",
    [userId]
  );
  const map = new Map(rows.map((r) => [r.crypto_id, r.address]));

  const user = get<{ wallet_address: string }>("SELECT wallet_address FROM users WHERE id = ?", [userId]);
  const existingEth = map.get("ethereum");
  const evmAddress =
    existingEth && isValidAddress("ethereum", existingEth)
      ? existingEth
      : user && isValidAddress("ethereum", user.wallet_address)
        ? user.wallet_address.toLowerCase()
        : generateEvmAddress();

  for (const c of SUPPORTED_CRYPTOS) {
    const current = map.get(c.id);
    if (current && isValidAddress(c.id, current)) continue;
    const address = CHAINS[c.id]?.evm ? evmAddress : generateAddress(c.id);
    if (current) {
      run("UPDATE wallet_addresses SET address = ? WHERE user_id = ? AND crypto_id = ?", [address, userId, c.id]);
    } else {
      run("INSERT INTO wallet_addresses (user_id, crypto_id, address) VALUES (?, ?, ?)", [userId, c.id, address]);
    }
    map.set(c.id, address);
  }

  return map;
}
