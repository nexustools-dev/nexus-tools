import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const toolKeys = [
  { key: "faviconGenerator", href: "/tools/favicon-generator", icon: "FI", color: "from-emerald-500 to-teal-600" },
  { key: "jsonFormatter", href: "/tools/json-formatter", icon: "{}", color: "from-blue-500 to-indigo-600" },
  { key: "metaTagGenerator", href: "/tools/meta-tag-generator", icon: "<>", color: "from-purple-500 to-pink-600" },
  { key: "base64Encoder", href: "/tools/base64-encoder", icon: "B64", color: "from-orange-500 to-amber-600" },
  { key: "colorConverter", href: "/tools/color-converter", icon: "CLR", color: "from-rose-500 to-red-600" },
  { key: "cssUnitConverter", href: "/tools/css-unit-converter", icon: "CSS", color: "from-cyan-500 to-blue-600" },
  { key: "hashGenerator", href: "/tools/hash-generator", icon: "#", color: "from-yellow-500 to-orange-600" },
  { key: "urlEncoder", href: "/tools/url-encoder", icon: "%", color: "from-violet-500 to-purple-600" },
  { key: "regexTester", href: "/tools/regex-tester", icon: ".*", color: "from-pink-500 to-rose-600" },
  { key: "loremIpsum", href: "/tools/lorem-ipsum", icon: "Aa", color: "from-slate-500 to-zinc-600" },
  { key: "uuidGenerator", href: "/tools/uuid-generator", icon: "ID", color: "from-indigo-500 to-blue-600" },
  { key: "jwtDecoder", href: "/tools/jwt-decoder", icon: "JWT", color: "from-rose-500 to-red-600" },
  { key: "timestampConverter", href: "/tools/timestamp-converter", icon: "TS", color: "from-amber-500 to-yellow-600" },
  { key: "markdownPreview", href: "/tools/markdown-preview", icon: "MD", color: "from-gray-500 to-slate-600" },
  { key: "cssGradientGenerator", href: "/tools/css-gradient-generator", icon: "GR", color: "from-fuchsia-500 to-violet-600" },
  { key: "diffChecker", href: "/tools/diff-checker", icon: "±", color: "from-teal-500 to-emerald-600" },
  { key: "passwordGenerator", href: "/tools/password-generator", icon: "PW", color: "from-red-500 to-orange-600" },
  { key: "qrCodeGenerator", href: "/tools/qr-code-generator", icon: "QR", color: "from-sky-500 to-blue-600" },
  { key: "cronExpressionBuilder", href: "/tools/cron-expression-builder", icon: "CR", color: "from-green-500 to-emerald-600" },
  { key: "jsonCsvConverter", href: "/tools/json-csv-converter", icon: "CSV", color: "from-amber-500 to-orange-600" },
  { key: "textCaseConverter", href: "/tools/text-case-converter", icon: "Cc", color: "from-lime-500 to-green-600" },
  { key: "placeholderImage", href: "/tools/placeholder-image", icon: "IMG", color: "from-pink-500 to-fuchsia-600" },
  { key: "sqlFormatter", href: "/tools/sql-formatter", icon: "SQL", color: "from-blue-500 to-cyan-600" },
  { key: "jsonYamlConverter", href: "/tools/json-yaml-converter", icon: "YML", color: "from-orange-500 to-red-600" },
  { key: "chmodCalculator", href: "/tools/chmod-calculator", icon: "777", color: "from-green-500 to-teal-600" },
  { key: "boxShadowGenerator", href: "/tools/box-shadow-generator", icon: "SH", color: "from-violet-500 to-purple-600" },
  { key: "borderRadiusGenerator", href: "/tools/border-radius-generator", icon: "BR", color: "from-pink-500 to-rose-600" },
  { key: "aspectRatioCalculator", href: "/tools/aspect-ratio-calculator", icon: "16:9", color: "from-amber-500 to-yellow-600" },
  { key: "imageCompressor", href: "/tools/image-compressor", icon: "ZIP", color: "from-teal-500 to-cyan-600" },
  { key: "svgToPng", href: "/tools/svg-to-png", icon: "SVG", color: "from-indigo-500 to-violet-600" },
  { key: "htmlEntityEncoder", href: "/tools/html-entity-encoder", icon: "&;", color: "from-orange-500 to-amber-600" },
  { key: "colorPaletteGenerator", href: "/tools/color-palette-generator", icon: "PAL", color: "from-fuchsia-500 to-pink-600" },
  { key: "textShadowGenerator", href: "/tools/text-shadow-generator", icon: "TxS", color: "from-cyan-500 to-blue-600" },
  { key: "csvToSql", href: "/tools/csv-to-sql", icon: "C→S", color: "from-emerald-500 to-green-600" },
] as const;

const comingSoonKeys = [
  { key: "jwtGenerator", icon: "JWG", color: "from-rose-500 to-red-600" },
  { key: "crontabValidator", icon: "CRV", color: "from-green-500 to-teal-600" },
  { key: "httpStatusCodes", icon: "HTTP", color: "from-blue-500 to-indigo-600" },
  { key: "tailwindColors", icon: "TW", color: "from-cyan-500 to-sky-600" },
  { key: "regexGenerator", icon: "RG", color: "from-purple-500 to-violet-600" },
  { key: "ipSubnetCalculator", icon: "IP", color: "from-amber-500 to-orange-600" },
  { key: "cssFlexboxGenerator", icon: "FLX", color: "from-pink-500 to-fuchsia-600" },
  { key: "openGraphPreview", icon: "OG", color: "from-emerald-500 to-green-600" },
] as const;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NexusTools",
    url: `https://toolnexus.dev/${locale}`,
    description: t("subheading"),
    inLanguage: locale === "pt" ? "pt-BR" : locale === "es" ? "es" : "en",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {t("heading")}
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          {t("subheading")}
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {toolKeys.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
          >
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} text-white font-mono font-bold text-sm mb-4`}
              translate="no"
            >
              {tool.icon}
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
              {t(`tools.${tool.key}.name`)}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t(`tools.${tool.key}.description`)}
            </p>
          </Link>
        ))}
      </section>

      {/* Coming Soon */}
      <section className="mt-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">{t("comingSoonHeading")}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            {comingSoonKeys.length} {t("comingSoonBadge")}
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {comingSoonKeys.map((tool) => (
            <div
              key={tool.key}
              className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/30 opacity-60 relative overflow-hidden"
            >
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-medium uppercase tracking-wider">
                  {t("comingSoonLabel")}
                </span>
              </div>
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} text-white font-mono font-bold text-xs mb-3 opacity-50`}
                translate="no"
              >
                {tool.icon}
              </div>
              <h3 className="text-lg font-semibold text-zinc-400 mb-1">
                {t(`upcoming.${tool.key}.name`)}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {t(`upcoming.${tool.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Suggest a Tool */}
      <section className="mt-12">
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center">
          <h3 className="text-xl font-bold mb-2">{t("suggestHeading")}</h3>
          <p className="text-zinc-400 text-sm mb-5 max-w-lg mx-auto">
            {t("suggestText")}
          </p>
          <a
            href="mailto:tools@toolnexus.dev?subject=Tool%20Suggestion"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors"
          >
            {t("suggestButton")}
          </a>
        </div>
      </section>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("whyHeading")}</h2>
        <div className="grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              {t("feature1Title")}
            </h3>
            <p className="text-zinc-400">{t("feature1Desc")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              {t("feature2Title")}
            </h3>
            <p className="text-zinc-400">{t("feature2Desc")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              {t("feature3Title")}
            </h3>
            <p className="text-zinc-400">{t("feature3Desc")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
