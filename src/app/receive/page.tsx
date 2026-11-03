import { Suspense } from "react";
import ReceiveContent from "./ReceiveContent";

export default function ReceivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-kb-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ReceiveContent />
    </Suspense>
  );
}
