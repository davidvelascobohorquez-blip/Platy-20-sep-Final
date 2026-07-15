import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chip and Weight — True Services",
  description: "Gestión de estimados, ventas y trabajos de True Services",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#1f6b3a"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
