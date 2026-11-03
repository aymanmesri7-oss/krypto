import Link from "next/link";
import { Clock } from "./icons";

export default function EmptyActivity({ receiveHref = "/receive" }: { receiveHref?: string }) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kb-card text-kb-muted">
        <Clock size={28} />
      </div>
      <p className="mt-4 text-[17px] font-semibold">Aucune transaction</p>
      <p className="mt-1 text-sm text-kb-muted">Vos envois et réceptions apparaîtront ici.</p>
      <Link href={receiveHref} className="mt-5 rounded-full bg-kb-card px-5 py-2.5 text-sm font-semibold text-kb-blue">
        Recevoir des cryptos
      </Link>
    </div>
  );
}
