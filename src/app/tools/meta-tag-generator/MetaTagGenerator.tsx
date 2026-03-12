"use client";

import { useState } from "react";

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
  title: "",
  description: "",
  url: "",
  siteName: "",
  ogImage: "",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterSite: "",
  author: "",
  robots: "index, follow",
  canonical: "",
  language: "en",
  charset: "UTF-8",
  viewport: "width=device-width, initial-scale=1",
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
    lines.push("");
    lines.push("<!-- Open Graph -->");
    if (data.ogType) lines.push(`<meta property="og:type" content="${data.ogType}">`);
    if (data.title) lines.push(`<meta property="og:title" content="${data.title}">`);
    if (data.description) lines.push(`<meta property="og:description" content="${data.description}">`);
    if (data.url) lines.push(`<meta property="og:url" content="${data.url}">`);
    if (data.siteName) lines.push(`<meta property="og:site_name" content="${data.siteName}">`);
    if (data.ogImage) lines.push(`<meta property="og:image" content="${data.ogImage}">`);
  }

  // Twitter
  const hasTwitter = data.title || data.description || data.ogImage;
  if (hasTwitter) {
    lines.push("");
    lines.push("<!-- Twitter Card -->");
    lines.push(`<meta name="twitter:card" content="${data.twitterCard}">`);
    if (data.title) lines.push(`<meta name="twitter:title" content="${data.title}">`);
    if (data.description) lines.push(`<meta name="twitter:description" content="${data.description}">`);
    if (data.ogImage) lines.push(`<meta name="twitter:image" content="${data.ogImage}">`);
    if (data.twitterSite) lines.push(`<meta name="twitter:site" content="${data.twitterSite}">`);
  }

  return lines.join("\n");
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
        <label className="block text-xs text-zinc-500 uppercase tracking-wide">
          {label}
        </label>
        {maxLength && value.length > 0 && (
          <span
            className={`text-xs ${overLimit ? "text-red-400" : "text-zinc-500"}`}
          >
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
      <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1">
        {label}
      </label>
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
  const title = data.title || "Page Title";
  const desc = data.description || "Page description will appear here...";
  const url = data.url || "https://example.com";

  return (
    <div className="bg-white rounded-lg p-4 text-left">
      <p className="text-sm text-[#202124] truncate" style={{ fontFamily: "Arial, sans-serif" }}>
        {url}
      </p>
      <h3
        className="text-xl text-[#1a0dab] truncate leading-tight mt-0.5"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-[#4d5156] mt-1 line-clamp-2"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {desc}
      </p>
    </div>
  );
}

function SocialPreview({ data }: { data: MetaData }) {
  const title = data.title || "Page Title";
  const desc = data.description || "Page description will appear here...";
  const domain = data.url
    ? data.url.replace(/^https?:\/\//, "").split("/")[0]
    : "example.com";

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
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-zinc-800 flex items-center justify-center text-zinc-600 text-sm">
          No image set
        </div>
      )}
      <div className="p-3">
        <p className="text-xs text-zinc-500 uppercase">{domain}</p>
        <h3 className="text-sm font-semibold text-zinc-100 mt-1 truncate">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

export function MetaTagGenerator() {
  const [data, setData] = useState<MetaData>(DEFAULT);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "social" | "advanced">(
    "basic"
  );

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
    { id: "basic" as const, label: "Basic SEO" },
    { id: "social" as const, label: "Social Media" },
    { id: "advanced" as const, label: "Advanced" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-4">
        {activeTab === "basic" && (
          <>
            <Input
              label="Title"
              value={data.title}
              onChange={(v) => update("title", v)}
              placeholder="My Awesome Website"
              maxLength={60}
              hint="Recommended: 50-60 characters"
            />
            <Input
              label="Description"
              value={data.description}
              onChange={(v) => update("description", v)}
              placeholder="A brief description of your page content..."
              maxLength={160}
              hint="Recommended: 150-160 characters"
            />
            <Input
              label="URL"
              value={data.url}
              onChange={(v) => update("url", v)}
              placeholder="https://example.com/page"
            />
            <Input
              label="Canonical URL"
              value={data.canonical}
              onChange={(v) => update("canonical", v)}
              placeholder="https://example.com/page"
              hint="Use if this page has duplicate URLs"
            />
            <Select
              label="Robots"
              value={data.robots}
              onChange={(v) => update("robots", v)}
              options={[
                { value: "index, follow", label: "Index, Follow (default)" },
                { value: "noindex, follow", label: "No Index, Follow" },
                { value: "index, nofollow", label: "Index, No Follow" },
                { value: "noindex, nofollow", label: "No Index, No Follow" },
              ]}
            />
          </>
        )}

        {activeTab === "social" && (
          <>
            <Input
              label="Site Name"
              value={data.siteName}
              onChange={(v) => update("siteName", v)}
              placeholder="NexusTools"
            />
            <Input
              label="OG Image URL"
              value={data.ogImage}
              onChange={(v) => update("ogImage", v)}
              placeholder="https://example.com/og-image.jpg"
              hint="Recommended: 1200x630px"
            />
            <Select
              label="OG Type"
              value={data.ogType}
              onChange={(v) => update("ogType", v)}
              options={[
                { value: "website", label: "Website" },
                { value: "article", label: "Article" },
                { value: "product", label: "Product" },
                { value: "profile", label: "Profile" },
              ]}
            />
            <Select
              label="Twitter Card"
              value={data.twitterCard}
              onChange={(v) => update("twitterCard", v)}
              options={[
                { value: "summary_large_image", label: "Summary Large Image" },
                { value: "summary", label: "Summary" },
              ]}
            />
            <Input
              label="Twitter @username"
              value={data.twitterSite}
              onChange={(v) => update("twitterSite", v)}
              placeholder="@username"
            />
          </>
        )}

        {activeTab === "advanced" && (
          <>
            <Input
              label="Author"
              value={data.author}
              onChange={(v) => update("author", v)}
              placeholder="John Doe"
            />
            <Select
              label="Language"
              value={data.language}
              onChange={(v) => update("language", v)}
              options={[
                { value: "en", label: "English" },
                { value: "es", label: "Spanish" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
                { value: "pt", label: "Portuguese" },
                { value: "ja", label: "Japanese" },
                { value: "zh", label: "Chinese" },
                { value: "ko", label: "Korean" },
              ]}
            />
            <Select
              label="Charset"
              value={data.charset}
              onChange={(v) => update("charset", v)}
              options={[
                { value: "UTF-8", label: "UTF-8 (recommended)" },
                { value: "ISO-8859-1", label: "ISO-8859-1" },
              ]}
            />
            <Input
              label="Viewport"
              value={data.viewport}
              onChange={(v) => update("viewport", v)}
              placeholder="width=device-width, initial-scale=1"
            />
          </>
        )}
      </div>

      {/* Previews */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300">Google Preview</h3>
        <GooglePreview data={data} />

        <h3 className="text-sm font-medium text-zinc-300">Social Media Preview</h3>
        <SocialPreview data={data} />
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-zinc-500 uppercase tracking-wide">
            Generated HTML
          </label>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              Reset
            </button>
            <button
              onClick={copyOutput}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
            >
              {copied ? "Copied!" : "Copy HTML"}
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
