import CoinDetail from "./CoinDetail";

export const instant = false;

export default async function CoinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CoinDetail id={id} />;
}
