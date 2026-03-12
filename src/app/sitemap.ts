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
