import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://toolnexus.dev";

  const paths = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/tools/favicon-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/json-formatter", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/meta-tag-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/base64-encoder", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/color-converter", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/css-unit-converter", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/hash-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/url-encoder", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/regex-tester", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/lorem-ipsum", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/uuid-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/jwt-decoder", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/timestamp-converter", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/markdown-preview", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/css-gradient-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/diff-checker", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/password-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/qr-code-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/cron-expression-builder", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/json-csv-converter", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/text-case-converter", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/tools/placeholder-image", changeFrequency: "monthly" as const, priority: 0.8 },
  ];

  return paths.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${path}`])
        ),
      },
    }))
  );
}
