import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Base64Encoder } from "./Base64Encoder";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "base64Encoder.metadata" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
  };
}

export default async function Base64EncoderPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "base64Encoder" });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">{t("heading")}</h1>
      <p className="text-zinc-400 mb-8">{t("subheading")}</p>
      <Base64Encoder />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>{t("seo.section1Title")}</h2>
        <p>{t("seo.section1Text")}</p>
        <h2>{t("seo.section2Title")}</h2>
        <p>{t("seo.section2Text")}</p>
        <h2>{t("seo.section3Title")}</h2>
        <p>{t("seo.section3Text")}</p>
        <h2>{t("seo.section4Title")}</h2>
        <ul>
          {t("seo.section4List").split(" | ").map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
