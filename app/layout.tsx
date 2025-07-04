import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Sipariş Sistemi",
  description: "Restoran QR Sipariş Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
