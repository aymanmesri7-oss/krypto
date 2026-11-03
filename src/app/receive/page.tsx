import { Suspense } from "react";
import ReceiveContent from "./ReceiveContent";

export default function ReceivePage() {
  return (
    <Suspense fallback={null}>
      <ReceiveContent />
    </Suspense>
  );
}
