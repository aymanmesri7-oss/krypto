import { SUPPORTED_CRYPTOS } from "./coingecko";

export interface ChainInfo {
  network: string;
  type: "COIN" | "TOKEN";
  standard?: string;
  evm: boolean;
  pattern: RegExp;
}

const EVM = /^0x[0-9a-fA-F]{40}$/;
const BASE58 = "[1-9A-HJ-NP-Za-km-z]";
const BECH32 = "[02-9ac-hj-np-z]";

export const CHAINS: Record<string, ChainInfo> = {
  bitcoin: { network: "Bitcoin", type: "COIN", evm: false, pattern: new RegExp(`^bc1q${BECH32}{34}$`) },
  ethereum: { network: "Ethereum", type: "COIN", evm: true, pattern: EVM },
  tether: { network: "Ethereum", type: "TOKEN", standard: "ERC20", evm: true, pattern: EVM },
  solana: { network: "Solana", type: "COIN", evm: false, pattern: new RegExp(`^${BASE58}{32,44}$`) },
  binancecoin: { network: "BNB Smart Chain", type: "COIN", standard: "BEP20", evm: true, pattern: EVM },
  ripple: { network: "XRP Ledger", type: "COIN", evm: false, pattern: new RegExp(`^r${BASE58}{24,34}$`) },
  dogecoin: { network: "Dogecoin", type: "COIN", evm: false, pattern: new RegExp(`^D${BASE58}{25,34}$`) },
  cardano: { network: "Cardano", type: "COIN", evm: false, pattern: new RegExp(`^addr1${BECH32}{50,}$`) },
  "avalanche-2": { network: "Avalanche C-Chain", type: "COIN", evm: true, pattern: EVM },
  "matic-network": { network: "Polygon", type: "COIN", evm: true, pattern: EVM },
};

export function getCrypto(id: string) {
  return SUPPORTED_CRYPTOS.find((c) => c.id === id);
}

export function isValidAddress(cryptoId: string, address: string): boolean {
  const chain = CHAINS[cryptoId];
  return !!chain && chain.pattern.test(address.trim());
}

export function normalizeAddress(cryptoId: string, address: string): string {
  const trimmed = address.trim();
  return CHAINS[cryptoId]?.evm ? trimmed.toLowerCase() : trimmed;
}
