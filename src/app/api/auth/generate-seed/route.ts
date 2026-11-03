import { NextResponse } from "next/server";
import { generateSeedPhrase } from "@/lib/seed";

export async function GET() {
  const phrase = generateSeedPhrase();
  return NextResponse.json({ words: phrase.split(" ") });
}
