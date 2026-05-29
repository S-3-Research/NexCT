import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Achieve",
  description: "Achieve Nurse Match",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="text-base">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
