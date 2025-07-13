import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { MonthProvider } from "@/lib/MonthContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrack - Personal Finance Manager",
  description: "Track and manage your personal finances with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MonthProvider>
        <div className="min-h-screen bg-primary/5 px-4 py-4">
          <div className="container mx-auto max-w-7xl space-y-6">
            <div className="rounded-2xl border bg-secondary/10 p-4 shadow-sm">
              <Navbar />
            </div>
            <div className="rounded-2xl border bg-background p-8 shadow-sm">
              {children}
            </div>
          </div>
        </div>
            <Toaster />
          </MonthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
