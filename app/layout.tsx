import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "やることリスト",
  description: "シンプルなTodoアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#0e1015]">{children}</body>
    </html>
  );
}
