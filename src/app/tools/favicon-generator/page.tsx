import type { Metadata } from "next";
import { FaviconGenerator } from "./FaviconGenerator";

export const metadata: Metadata = {
  title: "Favicon Generator — Create Favicons from Text, Emoji, or Images",
  description:
    "Free online favicon generator. Create favicons from text, emoji, or upload images. Download as ICO, PNG, and SVG in all required sizes. 100% browser-based.",
  keywords: [
    "favicon generator",
    "favicon ico generator",
    "text to favicon",
    "emoji favicon",
    "favicon sizes",
    "favicon from text",
    "svg favicon generator",
    "manifest.json icons",
  ],
};

export default function FaviconGeneratorPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Favicon Generator</h1>
      <p className="text-zinc-400 mb-8">
        Generate favicons from text, emoji, or images. Download as ICO and PNG
        in all standard sizes.
      </p>
      <FaviconGenerator />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>What is a Favicon?</h2>
        <p>
          A favicon (short for &quot;favorite icon&quot;) is the small icon displayed in
          browser tabs, bookmarks, and history. Modern browsers support multiple
          sizes and formats including ICO, PNG, and SVG.
        </p>
        <h2>What Sizes Do I Need?</h2>
        <p>
          This generator creates all the sizes you need: 16x16 and 32x32 for
          browser tabs, 48x48 for Windows shortcuts, 180x180 for Apple Touch
          Icon, and 192x192 + 512x512 for PWA manifest.json.
        </p>
        <h2>How to Add a Favicon to Your Website</h2>
        <p>
          Place the generated files in your website&apos;s root directory and add the
          following to your HTML &lt;head&gt;:
        </p>
        <pre>{`<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`}</pre>
      </section>
    </div>
  );
}
