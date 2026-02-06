import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sudoku MVP",
  description: "Jogo de Sudoku jogável",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
