import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACMS",
  description: "Academic Conference Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning style={{ fontFamily: "'Inter', 'Sarabun', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
