import { Suspense } from "react";
import SendContent from "./SendContent";

export default function SendPage() {
  return (
    <Suspense fallback={null}>
      <SendContent />
    </Suspense>
  );
}
