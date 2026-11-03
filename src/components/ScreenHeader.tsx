"use client";

import { useRouter } from "next/navigation";
import { Back } from "./icons";

interface Props {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backHref?: string;
  hideBack?: boolean;
  right?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, onBack, backHref, hideBack, right }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center bg-kb-dark/95 px-2 backdrop-blur">
      <div className="flex w-12 justify-start">
        {!hideBack && (
          <button onClick={handleBack} aria-label="Retour" className="flex h-10 w-10 items-center justify-center rounded-full active:bg-kb-card">
            <Back size={24} />
          </button>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center">
        {title && <h1 className="truncate text-[17px] font-semibold">{title}</h1>}
        {subtitle && <p className="truncate text-xs text-kb-muted">{subtitle}</p>}
      </div>
      <div className="flex w-12 justify-end">{right}</div>
    </header>
  );
}
