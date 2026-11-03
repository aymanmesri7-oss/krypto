import { NextResponse } from "next/server";
import { getPrices, getCoinHistory } from "@/lib/coingecko";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get("coinId");
  const days = searchParams.get("days");

  if (coinId && days) {
    const history = await getCoinHistory(coinId, parseInt(days));
    return NextResponse.json(history);
  }

  const prices = await getPrices();
  return NextResponse.json(prices);
}
