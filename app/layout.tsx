import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Nunito } from "next/font/google";
import "./globals.css";

const nougat = localFont({
  src: "./fonts/nougat-extrablack.ttf",
  variable: "--font-nougat",
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pinstars",
  description: "Die Geocaching-Schnitzeljagd für den Kindergeburtstag.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0255cf",
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
    <html lang="de" className={`${nougat.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
