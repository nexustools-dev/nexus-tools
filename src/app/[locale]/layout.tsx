import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL("https://toolnexus.dev"),
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords: t("keywords").split(", "),
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "NexusTools",
      locale: locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <html lang={locale} className="dark">
      <body
        className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <NextIntlClientProvider>
          <nav className="border-b border-zinc-800 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-bold tracking-tight">
                <span className="text-emerald-400">Nexus</span>Tools
              </Link>
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <Link
                  href="/tools/favicon-generator"
                  className="hover:text-zinc-100 transition-colors"
                >
                  {t("nav.faviconGenerator")}
                </Link>
                <Link
                  href="/tools/json-formatter"
                  className="hover:text-zinc-100 transition-colors"
                >
                  {t("nav.jsonFormatter")}
                </Link>
                <Link
                  href="/tools/meta-tag-generator"
                  className="hover:text-zinc-100 transition-colors"
                >
                  {t("nav.metaTags")}
                </Link>
                <Link
                  href="/tools/base64-encoder"
                  className="hover:text-zinc-100 transition-colors"
                >
                  {t("nav.base64")}
                </Link>
                <Link
                  href="/tools/color-converter"
                  className="hover:text-zinc-100 transition-colors"
                >
                  {t("nav.colors")}
                </Link>
                <Link
                  href="/tools/css-unit-converter"
                  className="hover:text-zinc-100 transition-colors"
                >
                  {t("nav.cssUnits")}
                </Link>
                <div className="border-l border-zinc-700 pl-4">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="border-t border-zinc-800 px-6 py-8 mt-16">
            <div className="max-w-6xl mx-auto text-center text-sm text-zinc-500">
              <p>{t("footer.privacy")}</p>
              <p className="mt-2">
                NexusTools &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
