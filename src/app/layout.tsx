import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://toolnexus.dev"),
  title: {
    default: "NexusTools — Free Developer Tools",
    template: "%s | NexusTools",
  },
  description:
    "Free online developer tools: favicon generator, JSON formatter, meta tag generator, and more. Fast, private, runs in your browser.",
  keywords: [
    "developer tools",
    "favicon generator",
    "json formatter",
    "meta tag generator",
    "free online tools",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "NexusTools",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <nav className="border-b border-zinc-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-emerald-400">Nexus</span>Tools
            </a>
            <div className="flex gap-6 text-sm text-zinc-400">
              <a
                href="/tools/favicon-generator"
                className="hover:text-zinc-100 transition-colors"
              >
                Favicon Generator
              </a>
              <a
                href="/tools/json-formatter"
                className="hover:text-zinc-100 transition-colors"
              >
                JSON Formatter
              </a>
              <a
                href="/tools/meta-tag-generator"
                className="hover:text-zinc-100 transition-colors"
              >
                Meta Tags
              </a>
              <a
                href="/tools/base64-encoder"
                className="hover:text-zinc-100 transition-colors"
              >
                Base64
              </a>
              <a
                href="/tools/color-converter"
                className="hover:text-zinc-100 transition-colors"
              >
                Colors
              </a>
              <a
                href="/tools/css-unit-converter"
                className="hover:text-zinc-100 transition-colors"
              >
                CSS Units
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-zinc-800 px-6 py-8 mt-16">
          <div className="max-w-6xl mx-auto text-center text-sm text-zinc-500">
            <p>
              All tools run 100% in your browser. No data is sent to any server.
            </p>
            <p className="mt-2">NexusTools &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
