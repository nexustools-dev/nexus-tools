import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ToolJsonLd } from '@/components/ToolJsonLd';
import { JsonFormatter } from './JsonFormatter';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'jsonFormatter.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(', '),
  };
}

export default async function JsonFormatterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'jsonFormatter' });

  const faq = [
    { question: t('seo.section1Title'), answer: t('seo.section1Text') },
    { question: t('seo.section2Title'), answer: t('seo.section2Text') },
    { question: t('seo.section3Title'), answer: t('seo.section3List').replace(/ \| /g, '. ') },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <ToolJsonLd
        name={t('heading')}
        description={t('metadata.description')}
        url={`https://toolnexus.dev/${locale}/tools/json-formatter`}
        faq={faq}
      />
      <h1 className="text-3xl font-bold mb-2">{t('heading')}</h1>
      <p className="text-zinc-400 mb-8">{t('subheading')}</p>
      <JsonFormatter />

      <section className="mt-16 prose prose-invert prose-sm max-w-none">
        <h2>{t('seo.section1Title')}</h2>
        <p>{t('seo.section1Text')}</p>
        <h2>{t('seo.section2Title')}</h2>
        <p>{t('seo.section2Text')}</p>
        <h2>{t('seo.section3Title')}</h2>
        <ul>
          {t('seo.section3List')
            .split(' | ')
            .map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
        </ul>
      </section>
    </div>
  );
}
