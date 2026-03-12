import type { Metadata } from "next";
import { MetaTagGenerator } from "./MetaTagGenerator";

export const metadata: Metadata = {
  title: "Meta Tag Generator — Create SEO Meta Tags for Your Website",
  description:
    "Free meta tag generator for SEO. Create title, description, Open Graph, Twitter Card, and other HTML meta tags. Live preview of Google and social media results.",
  keywords: [
    "meta tag generator",
    "seo meta tags",
    "open graph generator",
    "twitter card generator",
    "html meta tags",
    "meta description generator",
    "og tags generator",
    "seo tools",
  ],
};

export default function MetaTagGeneratorPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Meta Tag Generator</h1>
      <p className="text-zinc-400 mb-8">
        Generate HTML meta tags for SEO, Open Graph, and Twitter Cards. Preview
        how your page will look in Google and social media.
      </p>
      <MetaTagGenerator />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>What Are Meta Tags?</h2>
        <p>
          Meta tags are HTML elements that provide metadata about a web page.
          They don&apos;t appear on the page itself, but are read by search engines
          and social media platforms to understand your content and display it
          correctly in search results and social shares.
        </p>
        <h2>Essential Meta Tags for SEO</h2>
        <p>
          The most important meta tags for SEO are the title tag and meta
          description. The title tag appears as the clickable headline in search
          results and should be 50-60 characters. The meta description appears
          below the title and should be 150-160 characters.
        </p>
        <h2>Open Graph Tags</h2>
        <p>
          Open Graph (OG) tags control how your page appears when shared on
          Facebook, LinkedIn, and other platforms. Key tags include og:title,
          og:description, og:image, and og:url.
        </p>
        <h2>Twitter Card Tags</h2>
        <p>
          Twitter Cards use their own meta tags (twitter:card, twitter:title,
          twitter:description, twitter:image) to control how your content
          appears in tweets. The &quot;summary_large_image&quot; card type displays a
          large image preview.
        </p>
        <h2>How to Add Meta Tags</h2>
        <p>
          Copy the generated HTML and paste it inside the &lt;head&gt; section
          of your HTML document, before the closing &lt;/head&gt; tag. If
          you&apos;re using a framework like Next.js or Nuxt, use their built-in
          metadata APIs instead.
        </p>
      </section>
    </div>
  );
}
