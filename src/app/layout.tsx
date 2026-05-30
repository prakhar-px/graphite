import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGate } from "@/components/auth/auth-gate";
import { SyncManager } from "@/components/sync/sync-manager";
import { ThemeProvider } from "@/components/theme/theme-provider";
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
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('graphite-theme');var c=t==='light'?'light':'dark';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(c);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen font-sans antialiased`}
        style={{ backgroundColor: "var(--gp-bg)", color: "var(--gp-text)" }}
      >
        <ThemeProvider>
          <TooltipProvider>
            <AuthGate>
              {children}
              <SyncManager />
            </AuthGate>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
