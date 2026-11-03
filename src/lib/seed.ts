import { createHash } from "crypto";
import { WORDLIST } from "./wordlist";

export function generateSeedPhrase(): string {
  const indices = new Uint16Array(12);
  crypto.getRandomValues(indices);
  return Array.from(indices)
    .map((i) => WORDLIST[i % WORDLIST.length])
    .join(" ");
}

export function hashSeedPhrase(phrase: string): string {
  const normalized = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized).digest("hex");
}

export function isValidSeedPhrase(phrase: string): boolean {
  const words = phrase.trim().toLowerCase().split(/\s+/);
  if (words.length !== 12) return false;
  return words.every((w) => WORDLIST.includes(w));
}
