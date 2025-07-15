import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { MonthProvider } from "@/lib/MonthContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/lib/UserContext";
import { RefreshProvider } from "@/lib/RefreshContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrack - Personal Finance Manager",
  description: "Track and manage your personal finances with ease",
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border bg-card p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={0}>
              <MonthProvider>
                <RefreshProvider>
                  <LayoutContent>{children}</LayoutContent>
                  <Toaster />
                </RefreshProvider>
              </MonthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
