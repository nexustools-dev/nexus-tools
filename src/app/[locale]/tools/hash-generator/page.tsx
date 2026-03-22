import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ToolJsonLd } from '@/components/ToolJsonLd';
import { HashGenerator } from './HashGenerator';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hashGenerator.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(', '),
  };
}

export default async function HashGeneratorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hashGenerator' });

  const faq = [
    { question: t('seo.section1Title'), answer: t('seo.section1Text') },
    { question: t('seo.section2Title'), answer: t('seo.section2Text') },
    { question: t('seo.section3Title'), answer: t('seo.section3Text') },
    { question: t('seo.section4Title'), answer: t('seo.section4List').replace(/ \| /g, '. ') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <ToolJsonLd
        name={t('heading')}
        description={t('metadata.description')}
        url={`https://toolnexus.dev/${locale}/tools/hash-generator`}
        faq={faq}
      />
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold mb-2">{t('heading')}</h1>
      <p className="text-slate-400 mb-8">{t('subheading')}</p>
      <HashGenerator />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>{t('seo.section1Title')}</h2>
        <p>{t('seo.section1Text')}</p>
        <h2>{t('seo.section2Title')}</h2>
        <p>{t('seo.section2Text')}</p>
        <h2>{t('seo.section3Title')}</h2>
        <p>{t('seo.section3Text')}</p>
        <h2>{t('seo.section4Title')}</h2>
        <ul>
          {t('seo.section4List')
            .split(' | ')
            .map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
        </ul>
      </section>
    </div>
  );
}
