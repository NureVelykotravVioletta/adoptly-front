import type { Metadata } from "next";
import clsx from "clsx";
import "./globals.css";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Adoptly",
  description: "Платформа для адопції тварин із притулків",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={clsx(
          manrope.className,
          "min-h-screen bg-white text-gray-900"
        )}
      >
        {children}
      </body>
    </html>
  );
}
