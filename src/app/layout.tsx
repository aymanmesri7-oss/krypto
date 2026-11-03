import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KryptoBase Wallet",
  description: "Wallet crypto de simulation : envoyez et recevez des cryptos avec des prix en temps réel. Aucune vraie cryptomonnaie.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B1B1C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.className} antialiased`}>
      <body>
        <div className="app-frame relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
