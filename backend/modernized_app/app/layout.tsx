import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import "./style.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elysa Consultants — Premier Engineering & Architecture in Kashmir",
  description:
    "Elysa Consultants provides professional civil, structural, and architectural engineering consulting services across Kashmir and India since 2017.",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Forcefully hide the Next.js Development Indicator (the N popup) */}
        <style dangerouslySetInnerHTML={{ __html: `nextjs-portal { display: none !important; }` }} />
        
        {/* Load FontAwesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          precedence="default"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              const theme = localStorage.getItem('theme') || 'dark';
              document.documentElement.setAttribute('data-theme', theme);
            })();`,
          }}
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppWidget />
      </body>
    </html>
  );
}

