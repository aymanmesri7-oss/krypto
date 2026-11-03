type P = { size?: number; className?: string; strokeWidth?: number };

function Svg({ size = 24, className, strokeWidth = 2, children }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

export const ArrowUp = (p: P) => <Svg {...p}><path d="M12 19V5M5 12l7-7 7 7" /></Svg>;
export const ArrowDown = (p: P) => <Svg {...p}><path d="M12 5v14M5 12l7 7 7-7" /></Svg>;
export const ArrowUpRight = (p: P) => <Svg {...p}><path d="M7 17L17 7M8 7h9v9" /></Svg>;
export const ArrowDownLeft = (p: P) => <Svg {...p}><path d="M17 7L7 17M16 17H7V8" /></Svg>;
export const Back = (p: P) => <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>;
export const Close = (p: P) => <Svg {...p}><path d="M18 6L6 18M6 6l12 12" /></Svg>;
export const ChevronRight = (p: P) => <Svg {...p}><path d="M9 18l6-6-6-6" /></Svg>;
export const ChevronDown = (p: P) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
export const Search = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Svg>;
export const Copy = (p: P) => <Svg {...p}><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15V5a2 2 0 012-2h10" /></Svg>;
export const Share = (p: P) => <Svg {...p}><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" /></Svg>;
export const QrIcon = (p: P) => <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v.01M17 21h4v-4M14 21v.01" /></Svg>;
export const Eye = (p: P) => <Svg {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></Svg>;
export const EyeOff = (p: P) => <Svg {...p}><path d="M17.9 17.9A10.4 10.4 0 0112 19c-7 0-11-7-11-7a19.8 19.8 0 015.1-5.9M9.9 5.2A9.6 9.6 0 0112 5c7 0 11 7 11 7a19.6 19.6 0 01-2.2 3.2M14.1 14.1a3 3 0 01-4.2-4.2M1 1l22 22" /></Svg>;
export const Settings = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></Svg>;
export const Home = (p: P) => <Svg {...p}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" /></Svg>;
export const Chart = (p: P) => <Svg {...p}><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></Svg>;
export const Clock = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const Plus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const Check = (p: P) => <Svg {...p}><path d="M20 6L9 17l-5-5" /></Svg>;
export const Backspace = (p: P) => <Svg {...p}><path d="M21 5H8l-6 7 6 7h13a1 1 0 001-1V6a1 1 0 00-1-1zM17 9l-6 6M11 9l6 6" /></Svg>;
export const Shield = (p: P) => <Svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></Svg>;
export const Wallet = (p: P) => <Svg {...p}><rect x="2" y="5" width="20" height="15" rx="3" /><path d="M2 10h20M16 15h2" /></Svg>;
export const Mail = (p: P) => <Svg {...p}><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 6 10-6" /></Svg>;
export const Lock = (p: P) => <Svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></Svg>;
export const Logout = (p: P) => <Svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Svg>;
export const Info = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></Svg>;
export const Dollar = (p: P) => <Svg {...p}><path d="M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></Svg>;
export const Crown = (p: P) => <Svg {...p}><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" /></Svg>;
export const Warning = (p: P) => <Svg {...p}><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01" /></Svg>;
