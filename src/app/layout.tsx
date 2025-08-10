import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { getBaseUrl } from "../lib/baseUrl";
import FooterCTA from "../components/FooterCTA";
import AccentBar from "../components/AccentBar";
import NavTabs from "../components/NavTabs";
import R3IMarkFinal from "../components/brand/R3IMarkFinal";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_SITE_URL ?? getBaseUrl())
      : getBaseUrl()
  ),
  title: "Recursive Intelligence",
  description: "AI-first consulting to turn capability into operating reality.",
  openGraph: {
    title: "Recursive Intelligence",
    description: "AI-first consulting to turn capability into operating reality.",
    url: "/",
    siteName: "Recursive Intelligence",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg"
  }
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black z-50 px-4 py-3 border-b border-gray-800">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 font-bold"
        >
          <R3IMarkFinal size={20} />
          <span className={`${spaceGrotesk.variable} font-space-grotesk tracking-tight text-lg text-gray-100 hover:text-sky-400 transition-colors`}>
            RecursiveIntelligence.io
          </span>
        </a>
        <NavTabs />
      </div>
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-16 py-8 border-t border-gray-800">
      <div className="max-w-3xl mx-auto px-4 text-center text-sm text-gray-400">
        <p>
          © {currentYear} Recursive Intelligence —{" "}
          <a 
            href="/privacy" 
            className="text-sky-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Privacy
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-inter bg-black text-gray-100 antialiased min-h-screen`}
      >
        <Header />
        <AccentBar />
        <main className="pt-16 min-h-screen">
          <div className="max-w-3xl mx-auto px-4">
            {children}
            <FooterCTA />
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
