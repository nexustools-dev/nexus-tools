import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const TOOL_ICONS: Record<string, string> = {
  faviconGenerator: '/icons/tools/favicon-generator.png',
  jsonFormatter: '/icons/tools/json-formatter.png',
  metaTagGenerator: '/icons/tools/meta-tag-generator.png',
  base64Encoder: '/icons/tools/base64-encoder.png',
  colorConverter: '/icons/tools/color-converter.png',
  cssUnitConverter: '/icons/tools/css-unit-converter.png',
  hashGenerator: '/icons/tools/hash-generator.png',
  urlEncoder: '/icons/tools/url-encoder.png',
  regexTester: '/icons/tools/regex-tester.png',
  loremIpsum: '/icons/tools/lorem-ipsum.png',
  uuidGenerator: '/icons/tools/uuid-generator.png',
  jwtDecoder: '/icons/tools/jwt-decoder.png',
  timestampConverter: '/icons/tools/timestamp-converter.png',
  markdownPreview: '/icons/tools/markdown-preview.png',
  cssGradientGenerator: '/icons/tools/css-gradient-generator.png',
  diffChecker: '/icons/tools/diff-checker.png',
  passwordGenerator: '/icons/tools/password-generator.png',
  qrCodeGenerator: '/icons/tools/qr-code-generator.png',
  cronExpressionBuilder: '/icons/tools/cron-expression-builder.png',
  jsonCsvConverter: '/icons/tools/json-csv-converter.png',
  textCaseConverter: '/icons/tools/text-case-converter.png',
  placeholderImage: '/icons/tools/placeholder-image.png',
  sqlFormatter: '/icons/tools/sql-formatter.png',
  jsonYamlConverter: '/icons/tools/json-yaml-converter.png',
  chmodCalculator: '/icons/tools/chmod-calculator.png',
  boxShadowGenerator: '/icons/tools/box-shadow-generator.png',
  borderRadiusGenerator: '/icons/tools/border-radius-generator.png',
  aspectRatioCalculator: '/icons/tools/aspect-ratio-calculator.png',
  imageCompressor: '/icons/tools/image-compressor.png',
  svgToPng: '/icons/tools/svg-to-png.png',
  htmlEntityEncoder: '/icons/tools/html-entity-encoder.png',
  colorPaletteGenerator: '/icons/tools/color-palette-generator.png',
  textShadowGenerator: '/icons/tools/text-shadow-generator.png',
  csvToSql: '/icons/tools/csv-to-sql.png',
};

const toolKeys = [
  {
    key: 'faviconGenerator',
    href: '/tools/favicon-generator',
    icon: 'FI',
    color: 'from-emerald-500 to-teal-600',
    featured: true,
  },
  {
    key: 'jsonFormatter',
    href: '/tools/json-formatter',
    icon: '{}',
    color: 'from-blue-500 to-indigo-600',
    featured: true,
  },
  {
    key: 'metaTagGenerator',
    href: '/tools/meta-tag-generator',
    icon: '<>',
    color: 'from-purple-500 to-pink-600',
  },
  {
    key: 'base64Encoder',
    href: '/tools/base64-encoder',
    icon: 'B64',
    color: 'from-orange-500 to-amber-600',
  },
  {
    key: 'colorConverter',
    href: '/tools/color-converter',
    icon: 'CLR',
    color: 'from-rose-500 to-red-600',
    featured: true,
  },
  {
    key: 'cssUnitConverter',
    href: '/tools/css-unit-converter',
    icon: 'CSS',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    key: 'hashGenerator',
    href: '/tools/hash-generator',
    icon: '#',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    key: 'urlEncoder',
    href: '/tools/url-encoder',
    icon: '%',
    color: 'from-violet-500 to-purple-600',
  },
  {
    key: 'regexTester',
    href: '/tools/regex-tester',
    icon: '.*',
    color: 'from-pink-500 to-rose-600',
    featured: true,
  },
  {
    key: 'loremIpsum',
    href: '/tools/lorem-ipsum',
    icon: 'Aa',
    color: 'from-slate-400 to-zinc-500',
  },
  {
    key: 'uuidGenerator',
    href: '/tools/uuid-generator',
    icon: 'ID',
    color: 'from-indigo-500 to-blue-600',
  },
  { key: 'jwtDecoder', href: '/tools/jwt-decoder', icon: 'JWT', color: 'from-rose-500 to-red-600' },
  {
    key: 'timestampConverter',
    href: '/tools/timestamp-converter',
    icon: 'TS',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    key: 'markdownPreview',
    href: '/tools/markdown-preview',
    icon: 'MD',
    color: 'from-emerald-500 to-green-600',
  },
  {
    key: 'cssGradientGenerator',
    href: '/tools/css-gradient-generator',
    icon: 'GR',
    color: 'from-fuchsia-500 to-purple-600',
  },
  {
    key: 'diffChecker',
    href: '/tools/diff-checker',
    icon: '±',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    key: 'passwordGenerator',
    href: '/tools/password-generator',
    icon: 'PW',
    color: 'from-red-500 to-rose-600',
  },
  {
    key: 'qrCodeGenerator',
    href: '/tools/qr-code-generator',
    icon: 'QR',
    color: 'from-sky-500 to-blue-600',
  },
  {
    key: 'cronExpressionBuilder',
    href: '/tools/cron-expression-builder',
    icon: 'CR',
    color: 'from-lime-500 to-green-600',
  },
  {
    key: 'jsonCsvConverter',
    href: '/tools/json-csv-converter',
    icon: 'CSV',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    key: 'textCaseConverter',
    href: '/tools/text-case-converter',
    icon: 'Cc',
    color: 'from-violet-500 to-indigo-600',
  },
  {
    key: 'placeholderImage',
    href: '/tools/placeholder-image',
    icon: 'IMG',
    color: 'from-orange-500 to-red-600',
  },
  {
    key: 'sqlFormatter',
    href: '/tools/sql-formatter',
    icon: 'SQL',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'jsonYamlConverter',
    href: '/tools/json-yaml-converter',
    icon: 'YML',
    color: 'from-amber-500 to-orange-600',
  },
  {
    key: 'chmodCalculator',
    href: '/tools/chmod-calculator',
    icon: '777',
    color: 'from-green-500 to-emerald-600',
  },
  {
    key: 'boxShadowGenerator',
    href: '/tools/box-shadow-generator',
    icon: 'BSH',
    color: 'from-slate-400 to-zinc-500',
  },
  {
    key: 'borderRadiusGenerator',
    href: '/tools/border-radius-generator',
    icon: 'BRD',
    color: 'from-pink-500 to-rose-600',
  },
  {
    key: 'aspectRatioCalculator',
    href: '/tools/aspect-ratio-calculator',
    icon: 'AR',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    key: 'imageCompressor',
    href: '/tools/image-compressor',
    icon: 'IMG',
    color: 'from-emerald-500 to-green-600',
  },
  {
    key: 'svgToPng',
    href: '/tools/svg-to-png',
    icon: 'SVG',
    color: 'from-orange-500 to-amber-600',
  },
  {
    key: 'htmlEntityEncoder',
    href: '/tools/html-entity-encoder',
    icon: '&;',
    color: 'from-orange-500 to-amber-600',
  },
  {
    key: 'colorPaletteGenerator',
    href: '/tools/color-palette-generator',
    icon: 'PAL',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    key: 'textShadowGenerator',
    href: '/tools/text-shadow-generator',
    icon: 'TxS',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    key: 'csvToSql',
    href: '/tools/csv-to-sql',
    icon: 'C→S',
    color: 'from-emerald-500 to-green-600',
  },
] as const;

const comingSoonKeys = [
  { key: 'jwtGenerator', icon: 'JWG', color: 'from-rose-500 to-red-600' },
  { key: 'crontabValidator', icon: 'CRV', color: 'from-green-500 to-teal-600' },
  { key: 'httpStatusCodes', icon: 'HTTP', color: 'from-blue-500 to-indigo-600' },
  { key: 'tailwindColors', icon: 'TW', color: 'from-cyan-500 to-sky-600' },
  { key: 'regexGenerator', icon: 'RG', color: 'from-purple-500 to-violet-600' },
  { key: 'ipSubnetCalculator', icon: 'IP', color: 'from-amber-500 to-orange-600' },
  { key: 'cssFlexboxGenerator', icon: 'FLX', color: 'from-pink-500 to-fuchsia-600' },
  { key: 'openGraphPreview', icon: 'OG', color: 'from-emerald-500 to-green-600' },
] as const;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home' });

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NexusTools',
    url: `https://toolnexus.dev/${locale}`,
    description: t('subheading'),
    inLanguage: locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es' : 'en',
  };

  return (
    <div className="max-w-6xl mx-auto px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {/* Hero */}
      <section className="relative text-center pt-24 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {toolKeys.length} tools — 100% client-side
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent">
            {t('heading')}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
            {t('subheading')}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-12 text-center">
            <div>
              <div className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white">{toolKeys.length}</div>
              <div className="text-xs md:text-sm text-slate-500 mt-1">Tools</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white">3</div>
              <div className="text-xs md:text-sm text-slate-500 mt-1">Languages</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white">0</div>
              <div className="text-xs md:text-sm text-slate-500 mt-1">Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {toolKeys.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex items-start gap-4 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {TOOL_ICONS[tool.key] ? (
              <img
                src={TOOL_ICONS[tool.key]}
                alt=""
                className="relative z-10 shrink-0 w-14 h-14 rounded-xl shadow-lg shadow-black/20"
              />
            ) : (
              <div
                className={`relative z-10 shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} text-white font-mono font-bold text-base shadow-lg shadow-black/20`}
                translate="no"
              >
                {tool.icon}
              </div>
            )}
            <div className="relative z-10 min-w-0">
              <h2 className="font-[family-name:var(--font-heading)] text-base font-semibold text-white group-hover:text-emerald-400 transition-colors duration-200 leading-tight">
                {t(`tools.${tool.key}.name`)}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mt-1">
                {t(`tools.${tool.key}.description`)}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Coming Soon */}
      <section className="mt-20">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">{t('comingSoonHeading')}</h2>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            {comingSoonKeys.length} {t('comingSoonBadge')}
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {comingSoonKeys.map((tool) => (
            <div
              key={tool.key}
              className="p-5 rounded-xl border border-white/[0.04] bg-white/[0.01] opacity-50 relative"
            >
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                  {t('comingSoonLabel')}
                </span>
              </div>
              <div
                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} text-white font-mono font-bold text-[10px] mb-3 opacity-50`}
                translate="no"
              >
                {tool.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-400 mb-1">
                {t(`upcoming.${tool.key}.name`)}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t(`upcoming.${tool.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why NexusTools */}
      <section className="mt-20 mb-8">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-center mb-12">{t('whyHeading')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center group hover:border-emerald-500/20 transition-colors duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mb-5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-white mb-2">{t('feature1Title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{t('feature1Desc')}</p>
          </div>
          <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center group hover:border-emerald-500/20 transition-colors duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mb-5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-white mb-2">{t('feature2Title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{t('feature2Desc')}</p>
          </div>
          <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center group hover:border-emerald-500/20 transition-colors duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mb-5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-white mb-2">{t('feature3Title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{t('feature3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Suggest a Tool */}
      <section className="mt-12 mb-16">
        <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-10 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold mb-2">{t('suggestHeading')}</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-lg mx-auto">{t('suggestText')}</p>
            <a
              href="https://github.com/nexustools-dev/nexus-tools/discussions/categories/ideas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors duration-200"
            >
              {t('suggestButton')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
