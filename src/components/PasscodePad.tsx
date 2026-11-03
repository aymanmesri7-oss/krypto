"use client";

import { useEffect, useRef, useState } from "react";
import { Backspace } from "./icons";

const LENGTH = 6;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

interface Props {
  title: string;
  subtitle?: string;
  error?: string;
  busy?: boolean;
  onComplete: (code: string) => void;
}

// Remount with a new `key` to clear the code after an error.
export default function PasscodePad({ title, subtitle, error, busy, onComplete }: Props) {
  const [code, setCode] = useState("");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (code.length !== LENGTH) return;
    const t = setTimeout(() => onCompleteRef.current(code), 120);
    return () => clearTimeout(t);
  }, [code]);

  const press = (key: string) => {
    if (busy) return;
    if (key === "del") return setCode((c) => c.slice(0, -1));
    setCode((c) => (c.length < LENGTH ? c + key : c));
  };

  const pressRef = useRef(press);
  pressRef.current = press;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) pressRef.current(e.key);
      else if (e.key === "Backspace") pressRef.current("del");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center px-6 pt-10">
        <h2 className="text-center text-2xl font-bold">{title}</h2>
        {subtitle && <p className="mt-3 max-w-[300px] text-center text-sm leading-relaxed text-kb-muted">{subtitle}</p>}

        <div className={`mt-12 flex gap-4 ${error ? "animate-shake" : ""}`}>
          {Array.from({ length: LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-full transition-colors ${
                i < code.length ? (error ? "bg-kb-red" : "bg-kb-blue") : "bg-kb-card"
              }`}
            />
          ))}
        </div>

        <p className="mt-6 h-5 text-center text-sm text-kb-red">{busy ? "" : error}</p>
        {busy && <div className="h-6 w-6 animate-spin rounded-full border-2 border-kb-blue border-t-transparent" />}
      </div>

      <div className="safe-bottom grid grid-cols-3 gap-y-2 px-6 pb-8">
        {KEYS.map((key, i) =>
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              aria-label={key === "del" ? "Effacer" : key}
              className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full text-[28px] font-medium transition-colors active:bg-kb-card"
            >
              {key === "del" ? <Backspace size={26} strokeWidth={1.8} /> : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
