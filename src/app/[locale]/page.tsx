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
] as const;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
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
