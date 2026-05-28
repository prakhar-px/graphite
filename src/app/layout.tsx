import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGate } from "@/components/auth/auth-gate";
import { SyncManager } from "@/components/sync/sync-manager";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Graphite — FAANG DSA Mission Control",
  description:
    "Premium developer productivity OS for FAANG and Microsoft interview preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-[#09090B] font-sans text-zinc-100 antialiased`}
      >
        <TooltipProvider>
          <AuthGate>
            {children}
            <SyncManager />
          </AuthGate>
        </TooltipProvider>
      </body>
    </html>
  );
}
