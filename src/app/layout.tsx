import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema QR Institucional — Mentora",
  description: "Generación masiva de códigos QR para uso educativo e institucional. Plataforma oficial Grupo Mentora.",
  keywords: ["QR", "códigos QR", "educación", "Mentora", "institucional"],
  authors: [{ name: "Grupo Mentora" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
