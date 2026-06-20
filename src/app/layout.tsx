import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klarpakke Cloudflare",
  description: "Cloudflare-native trading education platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
