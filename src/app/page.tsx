import Link from "next/link";

const tools = [
  {
    name: "Favicon Generator",
    description:
      "Generate favicons from text, emoji, or images. Download as ICO, PNG, SVG with all required sizes.",
    href: "/tools/favicon-generator",
    icon: "FI",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "JSON Formatter",
    description:
      "Format, validate, and minify JSON. Syntax highlighting, error detection, and tree view.",
    href: "/tools/json-formatter",
    icon: "{}",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Meta Tag Generator",
    description:
      "Generate SEO meta tags, Open Graph, and Twitter Cards. Live preview of Google and social media results.",
    href: "/tools/meta-tag-generator",
    icon: "<>",
    color: "from-purple-500 to-pink-600",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Free Developer Tools
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Fast, private, open-source tools that run entirely in your browser. No
          uploads, no tracking, no accounts.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {tools.map((tool) => (
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
              {tool.name}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {tool.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Why NexusTools?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              100% Browser-Based
            </h3>
            <p className="text-zinc-400">
              Your data never leaves your device. All processing happens locally
              in your browser.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              No Account Required
            </h3>
            <p className="text-zinc-400">
              Just open and use. No sign-ups, no email harvesting, no
              paywalls.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">
              Fast &amp; Free
            </h3>
            <p className="text-zinc-400">
              Lightweight tools that load instantly. Free forever, supported by
              minimal ads.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
