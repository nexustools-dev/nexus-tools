'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface MetaData {
  title: string;
  description: string;
  url: string;
  siteName: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterSite: string;
  author: string;
  robots: string;
  canonical: string;
  language: string;
  charset: string;
  viewport: string;
}

const DEFAULT: MetaData = {
  title: 'My Awesome Website — Build Something Great',
  description:
    'A modern web application that helps developers build better products faster. Free tools, guides, and resources.',
  url: 'https://example.com',
  siteName: 'My Awesome Website',
  ogImage: '',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  author: '',
  robots: 'index, follow',
  canonical: '',
  language: 'en',
  charset: 'UTF-8',
  viewport: 'width=device-width, initial-scale=1',
};

function generateTags(data: MetaData): string {
  const lines: string[] = [];

  lines.push(`<meta charset="${data.charset}">`);
  lines.push(`<meta name="viewport" content="${data.viewport}">`);

  if (data.title) {
    lines.push(`<title>${data.title}</title>`);
  }
  if (data.description) {
    lines.push(`<meta name="description" content="${data.description}">`);
  }
  if (data.author) {
    lines.push(`<meta name="author" content="${data.author}">`);
  }
  if (data.robots) {
    lines.push(`<meta name="robots" content="${data.robots}">`);
  }
  if (data.canonical) {
    lines.push(`<link rel="canonical" href="${data.canonical}">`);
  }
  if (data.language) {
    lines.push(`<meta http-equiv="content-language" content="${data.language}">`);
  }

  // Open Graph
  const hasOg = data.title || data.description || data.url || data.ogImage;
  if (hasOg) {
    lines.push('');
    lines.push('<!-- Open Graph -->');
    if (data.ogType) lines.push(`<meta property="og:type" content="${data.ogType}">`);
    if (data.title) lines.push(`<meta property="og:title" content="${data.title}">`);
    if (data.description)
      lines.push(`<meta property="og:description" content="${data.description}">`);
    if (data.url) lines.push(`<meta property="og:url" content="${data.url}">`);
    if (data.siteName) lines.push(`<meta property="og:site_name" content="${data.siteName}">`);
    if (data.ogImage) lines.push(`<meta property="og:image" content="${data.ogImage}">`);
  }

  // Twitter
  const hasTwitter = data.title || data.description || data.ogImage;
  if (hasTwitter) {
    lines.push('');
    lines.push('<!-- Twitter Card -->');
    lines.push(`<meta name="twitter:card" content="${data.twitterCard}">`);
    if (data.title) lines.push(`<meta name="twitter:title" content="${data.title}">`);
    if (data.description)
      lines.push(`<meta name="twitter:description" content="${data.description}">`);
    if (data.ogImage) lines.push(`<meta name="twitter:image" content="${data.ogImage}">`);
    if (data.twitterSite) lines.push(`<meta name="twitter:site" content="${data.twitterSite}">`);
  }

  return lines.join('\n');
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  hint?: string;
}) {
  const overLimit = maxLength && value.length > maxLength;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs text-zinc-500 uppercase tracking-wide">{label}</label>
        {maxLength && value.length > 0 && (
          <span className={`text-xs ${overLimit ? 'text-red-400' : 'text-zinc-500'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
      />
      {hint && <p className="text-xs text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function GooglePreview({ data }: { data: MetaData }) {
  const title = data.title || 'Page Title';
  const desc = data.description || 'Page description will appear here...';
  const url = data.url || 'https://example.com';

  return (
    <div className="bg-white rounded-lg p-4 text-left">
      <p className="text-sm text-[#202124] truncate" style={{ fontFamily: 'Arial, sans-serif' }}>
        {url}
      </p>
      <h3
        className="text-xl text-[#1a0dab] truncate leading-tight mt-0.5"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-[#4d5156] mt-1 line-clamp-2"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {desc}
      </p>
    </div>
  );
}

function SocialPreview({ data, noImageText }: { data: MetaData; noImageText: string }) {
  const title = data.title || 'Page Title';
  const desc = data.description || 'Page description will appear here...';
  const domain = data.url ? data.url.replace(/^https?:\/\//, '').split('/')[0] : 'example.com';

  return (
    <div className="rounded-lg border border-zinc-700 overflow-hidden bg-zinc-900">
      {data.ogImage ? (
        <div className="w-full h-40 bg-zinc-800 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.ogImage}
            alt="OG Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-zinc-800 flex items-center justify-center text-zinc-600 text-sm">
          {noImageText}
        </div>
      )}
      <div className="p-3">
        <p className="text-xs text-zinc-500 uppercase">{domain}</p>
        <h3 className="text-sm font-semibold text-zinc-100 mt-1 truncate">{title}</h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

export function MetaTagGenerator() {
  const t = useTranslations('metaTagGenerator.ui');
  const tc = useTranslations('ui');
  const [data, setData] = useState<MetaData>(DEFAULT);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'advanced'>('basic');

  const update = (field: keyof MetaData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const output = generateTags(data);

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setData(DEFAULT);
  };

  const tabs = [
    { id: 'basic' as const, label: t('tabBasicSeo') },
    { id: 'social' as const, label: t('tabSocialMedia') },
    { id: 'advanced' as const, label: t('tabAdvanced') },
  ];

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-4">
        {activeTab === 'basic' && (
          <>
            <Input
              label={t('titleLabel')}
              value={data.title}
              onChange={(v) => update('title', v)}
              placeholder={t('titlePlaceholder')}
              maxLength={60}
              hint={t('titleHint')}
            />
            <Input
              label={t('descriptionLabel')}
              value={data.description}
              onChange={(v) => update('description', v)}
              placeholder={t('descriptionPlaceholder')}
              maxLength={160}
              hint={t('descriptionHint')}
            />
            <Input
              label={t('pageUrl')}
              value={data.url}
              onChange={(v) => update('url', v)}
              placeholder="https://example.com/page"
              hint={t('pageUrlHint')}
            />
            <Input
              label={t('canonicalUrl')}
              value={data.canonical}
              onChange={(v) => update('canonical', v)}
              placeholder="https://example.com/page"
              hint={t('canonicalUrlHint')}
            />
            <Select
              label={t('robots')}
              value={data.robots}
              onChange={(v) => update('robots', v)}
              options={[
                { value: 'index, follow', label: t('robotsIndex') },
                { value: 'noindex, follow', label: t('robotsNoindex') },
                { value: 'index, nofollow', label: t('robotsNofollow') },
                { value: 'noindex, nofollow', label: t('robotsNone') },
              ]}
            />
          </>
        )}

        {activeTab === 'social' && (
          <>
            <Input
              label={t('siteName')}
              value={data.siteName}
              onChange={(v) => update('siteName', v)}
              placeholder={t('siteNamePlaceholder')}
              hint={t('siteNameHint')}
            />
            <Input
              label={t('ogImageUrl')}
              value={data.ogImage}
              onChange={(v) => update('ogImage', v)}
              placeholder="https://example.com/og-image.jpg"
              hint={t('ogImageHint')}
            />
            <Select
              label={t('ogType')}
              value={data.ogType}
              onChange={(v) => update('ogType', v)}
              options={[
                { value: 'website', label: t('ogTypeWebsite') },
                { value: 'article', label: t('ogTypeArticle') },
                { value: 'product', label: t('ogTypeProduct') },
                { value: 'profile', label: t('ogTypeProfile') },
              ]}
            />
            <Select
              label={t('twitterCard')}
              value={data.twitterCard}
              onChange={(v) => update('twitterCard', v)}
              options={[
                { value: 'summary_large_image', label: t('twitterCardLarge') },
                { value: 'summary', label: t('twitterCardSummary') },
              ]}
            />
            <Input
              label={t('twitterUsername')}
              value={data.twitterSite}
              onChange={(v) => update('twitterSite', v)}
              placeholder="@username"
            />
          </>
        )}

        {activeTab === 'advanced' && (
          <>
            <Input
              label={t('author')}
              value={data.author}
              onChange={(v) => update('author', v)}
              placeholder="John Doe"
            />
            <Select
              label={t('language')}
              value={data.language}
              onChange={(v) => update('language', v)}
              options={[
                { value: 'en', label: t('langEn') },
                { value: 'es', label: t('langEs') },
                { value: 'fr', label: t('langFr') },
                { value: 'de', label: t('langDe') },
                { value: 'pt', label: t('langPt') },
                { value: 'ja', label: t('langJa') },
                { value: 'zh', label: t('langZh') },
                { value: 'ko', label: t('langKo') },
              ]}
            />
            <Select
              label={t('charset')}
              value={data.charset}
              onChange={(v) => update('charset', v)}
              options={[
                { value: 'UTF-8', label: t('charsetUtf8') },
                { value: 'ISO-8859-1', label: t('charsetIso') },
              ]}
            />
            <Input
              label={t('viewport')}
              value={data.viewport}
              onChange={(v) => update('viewport', v)}
              placeholder="width=device-width, initial-scale=1"
            />
          </>
        )}
      </div>

      {/* Previews */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">{t('googlePreview')}</h3>
        <GooglePreview data={data} />

        <h3 className="text-sm font-medium text-zinc-300">{t('socialPreview')}</h3>
        <SocialPreview data={data} noImageText={t('noImage')} />
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            {t('generatedHtml')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {t('reset')}
            </button>
            <button
              onClick={copyOutput}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
            >
              {copied ? tc('copied') : t('copyHtml')}
            </button>
          </div>
        </div>
        <textarea
          value={output}
          readOnly
          spellCheck={false}
          className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none"
        />
      </div>
    </div>
  );
}
