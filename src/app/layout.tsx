import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
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
  title: {
    default: "Recursive Intelligence | AI, Systems Thinking, Philosophy of Mind",
    template: "%s | Recursive Intelligence",
  },
  description:
    "Exploring AI, systems thinking, and philosophy of mind. Research, experiments, and learning in public by Seth Robins.",
  keywords: [
    "AI research",
    "systems thinking",
    "philosophy of mind",
    "artificial intelligence",
    "consciousness",
    "machine learning",
    "AWS",
    "agent systems",
  ],
  authors: [{ name: "Seth Robins" }],
  creator: "Seth Robins",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || getBaseUrl(),
    title: "Recursive Intelligence",
    description: "Exploring AI, systems thinking, and philosophy of mind.",
    siteName: "Recursive Intelligence",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recursive Intelligence",
    description: "Exploring AI, systems thinking, and philosophy of mind.",
    creator: "@r3crsvint3llgnz",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black z-50 px-4 py-3 border-b border-gray-800">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold"
        >
          <R3IMarkFinal size={20} />
          <span className={`${spaceGrotesk.variable} font-space-grotesk tracking-tight text-lg text-gray-100 hover:text-[color:var(--ri-accent)] transition-colors`}>
            RecursiveIntelligence.io
          </span>
        </Link>
        <NavTabs />
      </div>
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  const gardenUrl =
    process.env.NEXT_PUBLIC_GARDEN_URL ??
    "https://recursiveintelligence.xyz/";
  
  return (
    <footer className="mt-16 py-8 border-t border-gray-800">
      <div className="max-w-3xl mx-auto px-4 text-center text-sm text-gray-400">
        <p>
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
            Recursive Garden (Lab)
          </a>
          {" | "}
          <a
            href="https://hachyderm.io/@r3crsvint3llgnz"
            rel="me"
            className="ri-link"
            target="_blank"
          >
            Mastodon
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
      <head>
        <link rel="me" href="https://hachyderm.io/@r3crsvint3llgnz" />
        {process.env.NODE_ENV === "production" &&
          process.env.NEXT_PUBLIC_AWS_RUM_APPLICATION_ID &&
          process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID && (
            <Script
              id="cloudwatch-rum"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
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
            '${process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1'}',
            'https://client.rum.${process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1'}.amazonaws.com/1.0.2/cwr.js',
            {
              sessionSampleRate: 1,
              identityPoolId: '${process.env.NEXT_PUBLIC_AWS_RUM_IDENTITY_POOL_ID}',
              endpoint: "https://dataplane.rum.${process.env.NEXT_PUBLIC_AWS_RUM_REGION || 'us-east-1'}.amazonaws.com",
              telemetries: ["performance","errors","http"],
              allowCookies: true,
              enableXRay: false
            }
          );
        `,
              }}
            />
          )}
      </head>
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
