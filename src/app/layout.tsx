import type { Metadata } from "next";
import { JetBrains_Mono, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GenLayerProvider } from "@/components/GenLayerProvider";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const libreCaslonText = Libre_Caslon_Text({
  variable: "--font-libre-caslon",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LicenseLock",
  description: "Verify License Claims with GenVM Consensus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${jetbrainsMono.variable} ${libreCaslonText.variable} bg-background font-body-md text-on-background min-h-screen flex flex-col`}
      >
        <GenLayerProvider>
          <Header />
          <main className="flex-1 pt-16 w-full flex flex-col">
            {children}
          </main>
          <Footer />
        </GenLayerProvider>
      </body>
    </html>
  );
}
