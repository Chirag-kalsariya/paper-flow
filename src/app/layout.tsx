import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { DocumentStoreProvider } from "@/providers/DocumentStoreProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PaperFlow",
  description:
    "A student-focused document editor that removes formatting headaches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning prevents the "className mismatch" warning from
    // next-themes adding the dark class to <html> on first render.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          <DocumentStoreProvider>{children}</DocumentStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
