import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { getBaseUrl } from "../lib/baseUrl";
import FooterCTA from "../components/FooterCTA";
import DisambiguationBanner from "../components/DisambiguationBanner";
import LayoutShell from "../components/LayoutShell";
import BrandLink from "../components/brand/BrandLink";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "../components/ThemeToggle";

const siteMetadata = require("../../data/siteMetadata");

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_SITE_URL ?? getBaseUrl())
      : getBaseUrl()
  ),
  title: {
    default: siteMetadata.title,
    template: "%s | Seth Robins",
  },
  description: siteMetadata.description,
  keywords: [
    "applied AI methodology",
    "human-AI collaboration",
    "cognitive science",
    "AI research",
    "recursive prompting",
    "neuroscience and AI",
    "AI frameworks",
    "Seth Robins",
  ],
  authors: [{ name: siteMetadata.author }],
  creator: siteMetadata.author,
  openGraph: {
    type: "website",
    locale: siteMetadata.locale,
    url: process.env.NEXT_PUBLIC_SITE_URL || getBaseUrl(),
    title: siteMetadata.title,
    description: siteMetadata.description,
    siteName: siteMetadata.headerTitle,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    creator: "@r3crsvint3llgnz",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

function TopBar() {
  return (
    <header className="ri-topbar">
      {/* Space reserved for mobile hamburger rendered by LayoutShell at z-[51] */}
      <div className="pl-10 md:pl-0">
        <BrandLink />
      </div>
      <ThemeToggle />
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  const gardenUrl =
    process.env.NEXT_PUBLIC_GARDEN_URL ??
    "https://recursiveintelligence.xyz/";

  return (
    <footer className="mt-16">
      <div className="ri-stripe-bold" aria-hidden="true" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ri-muted)] mb-4">
          {'// Navigate'}
        </p>
        <p className="text-center text-sm text-[color:var(--ri-muted)]">
          © {currentYear} Recursive Intelligence —{" "}
          <Link href="/privacy" className="ri-link">
            Privacy
          </Link>
          {" | "}
          <a
            href={gardenUrl}
            className="ri-link"
            rel="noopener noreferrer"
            target="_blank"
          >
            Recursive Garden
          </a>
          {" | "}
          <a
            href="https://bsky.app/profile/r3crsvint3llgnz.bsky.social"
            rel="noopener noreferrer"
            className="ri-link"
            target="_blank"
          >
            Bluesky
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
  // Build CloudWatch RUM script with proper region handling
  const rumRegion = process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1';
  const rumScript = `
    (function(n,i,v,r,s,c,x,z){
      x=window.AwsRumClient={q:[],n:n,i:i,v:v,r:r,c:c};
      window[n]=function(c,p){x.q.push({c:c,p:p});};
      z=document.createElement('script');
      z.async=true;
      z.src=s;
      document.head.insertBefore(z,document.head.getElementsByTagName('script')[0]);
    })(
      'cwr',
      '${process.env.NEXT_PUBLIC_AWS_RUM_APPLICATION_ID}',
      '1.0.0',
      '${rumRegion}',
      'https://client.rum.${rumRegion}.amazonaws.com/1.0.2/cwr.js',
      {
        sessionSampleRate: 1,
        identityPoolId: '${process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID}',
        endpoint: "https://dataplane.rum.${rumRegion}.amazonaws.com",
        telemetries: ["performance","errors","http"],
        allowCookies: true,
        enableXRay: false
      }
    );
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Safe: content is JSON.stringify of our own static siteMetadata constants, not user input
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${siteMetadata.siteUrl}/#organization`,
                  name: "Recursive Intelligence",
                  url: siteMetadata.siteUrl,
                  description: siteMetadata.description,
                  founder: {
                    "@type": "Person",
                    "@id": `${siteMetadata.siteUrl}/#seth-robins`,
                  },
                  sameAs: [
                    siteMetadata.substack,
                    siteMetadata.github,
                    siteMetadata.bluesky,
                  ],
                },
                {
                  "@type": "Person",
                  "@id": `${siteMetadata.siteUrl}/#seth-robins`,
                  name: siteMetadata.author,
                  jobTitle: "Industrial AI & Systems Architect",
                  description: siteMetadata.description,
                  url: siteMetadata.siteUrl,
                  sameAs: [
                    siteMetadata.bluesky,
                    siteMetadata.github,
                    siteMetadata.substack,
                    "https://sethrobins.recursiveintelligence.io",
                    "https://store.recursiveintelligence.io",
                  ],
                },
              ],
            }),
          }}
        />
        {process.env.NODE_ENV === "production" &&
          process.env.NEXT_PUBLIC_AWS_RUM_APPLICATION_ID &&
          process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID && (
            <Script
              id="cloudwatch-rum"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: rumScript }}
            />
          )}
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-inter antialiased min-h-screen`}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <TopBar />
          <LayoutShell>
            <main className="pt-12 min-h-screen">
              <DisambiguationBanner />
              {children}
              <FooterCTA />
            </main>
            <Footer />
          </LayoutShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
