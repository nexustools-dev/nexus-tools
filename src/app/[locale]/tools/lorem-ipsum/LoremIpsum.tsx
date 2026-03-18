'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

const LOREM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'perspiciatis',
  'unde',
  'omnis',
  'iste',
  'natus',
  'error',
  'voluptatem',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
  'explicabo',
  'nemo',
  'ipsam',
  'quia',
  'voluptas',
  'aspernatur',
  'aut',
  'odit',
  'fugit',
  'consequuntur',
  'magni',
  'dolores',
  'eos',
  'ratione',
  'sequi',
  'nesciunt',
  'neque',
  'porro',
  'quisquam',
  'dolorem',
  'adipisci',
  'numquam',
  'eius',
  'modi',
  'tempora',
  'magnam',
  'aliquam',
  'quaerat',
  'minima',
  'nostrum',
  'exercitationem',
  'ullam',
  'corporis',
  'suscipit',
  'laboriosam',
  'aliquid',
  'commodi',
  'consequatur',
  'autem',
  'vel',
  'eum',
  'iure',
  'reprehenderit',
  'blanditiis',
  'praesentium',
  'voluptatum',
  'deleniti',
  'atque',
  'corrupti',
  'quos',
  'quas',
  'molestias',
  'excepturi',
  'occaecati',
  'cupiditate',
  'provident',
  'similique',
  'mollitia',
  'animi',
  'sapiente',
  'delectus',
  'rerum',
  'hic',
  'tenetur',
  'eligendi',
  'optio',
  'cumque',
  'nihil',
  'impedit',
  'quo',
  'minus',
  'maxime',
  'placeat',
  'facere',
  'possimus',
  'assumenda',
  'repellendus',
  'temporibus',
  'quibusdam',
  'illum',
  'soluta',
  'nobis',
  'debitis',
  'necessitatibus',
  'saepe',
  'eveniet',
  'voluptates',
  'repudiandae',
  'recusandae',
  'itaque',
  'earum',
  'harum',
  'quidem',
  'reiciendis',
];

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord(): string {
  return LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)];
}

function generateSentence(): string {
  const length = randomInt(8, 20);
  const words: string[] = [];
  for (let i = 0; i < length; i++) {
    words.push(randomWord());
  }
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateParagraph(): string {
  const sentenceCount = randomInt(4, 8);
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(' ');
}

type OutputType = 'paragraphs' | 'sentences' | 'words';

export function LoremIpsum() {
  const t = useTranslations('loremIpsum.ui');
  const tc = useTranslations('ui');
  const [outputType, setOutputType] = useState<OutputType>('paragraphs');
  const [quantity, setQuantity] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState<'text' | 'html' | null>(null);

  // Generate on mount
  const generate = useCallback(() => {
    let result = '';

    if (outputType === 'paragraphs') {
      const paragraphs: string[] = [];
      for (let i = 0; i < quantity; i++) {
        paragraphs.push(generateParagraph());
      }
      if (startWithLorem && paragraphs.length > 0) {
        paragraphs[0] = LOREM_START + paragraphs[0];
      }
      result = paragraphs.join('\n\n');
    } else if (outputType === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < quantity; i++) {
        sentences.push(generateSentence());
      }
      if (startWithLorem && sentences.length > 0) {
        sentences[0] = LOREM_START.trim();
      }
      result = sentences.join(' ');
    } else {
      const words: string[] = [];
      for (let i = 0; i < quantity; i++) {
        words.push(randomWord());
      }
      if (startWithLorem && words.length >= 5) {
        const loremStart = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
        for (let i = 0; i < Math.min(5, words.length); i++) {
          words[i] = loremStart[i];
        }
      }
      result = words.join(' ');
    }

    setOutput(result);
  }, [outputType, quantity, startWithLorem]);

  // Auto-generate on first render
  useState(() => {
    const paragraphs: string[] = [];
    for (let i = 0; i < 3; i++) paragraphs.push(generateParagraph());
    paragraphs[0] = LOREM_START + paragraphs[0];
    setOutput(paragraphs.join('\n\n'));
  });

  const copyText = async () => {
    await navigator.clipboard.writeText(output);
    setCopied('text');
    setTimeout(() => setCopied(null), 2000);
  };

  const copyHtml = async () => {
    const html = output
      .split('\n\n')
      .map((p) => `<p>${p}</p>`)
      .join('\n');
    await navigator.clipboard.writeText(html);
    setCopied('html');
    setTimeout(() => setCopied(null), 2000);
  };

  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const charCount = output.length;

  const typeLabel =
    outputType === 'paragraphs'
      ? t('paragraphCount', { count: quantity })
      : outputType === 'sentences'
        ? t('sentenceCount', { count: quantity })
        : t('wordCount', { count: quantity });

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type selector */}
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
          {(['paragraphs', 'sentences', 'words'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOutputType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                outputType === type
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t(type)}
            </button>
          ))}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">{t('quantity')}</label>
          <input
            type="number"
            min={1}
            max={outputType === 'words' ? 1000 : outputType === 'sentences' ? 100 : 20}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Start with Lorem */}
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
          />
          {t('startWithLorem')}
        </label>

        {/* Generate */}
        <button
          onClick={generate}
          className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
        >
          {t('generate')}
        </button>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <label className="block text-xs text-zinc-500 uppercase tracking-wide">
              {t('outputLabel')}
            </label>
            <span className="text-xs text-zinc-600">
              {typeLabel} &middot; {t('statsWords', { words: wordCount })} &middot;{' '}
              {t('statsChars', { chars: charCount.toLocaleString() })}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyText}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {copied === 'text' ? tc('copied') : t('copyText')}
            </button>
            <button
              onClick={copyHtml}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              {copied === 'html' ? tc('copied') : t('copyHtml')}
            </button>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 min-h-[200px] max-h-[500px] overflow-y-auto">
          {output.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-sm text-zinc-300 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
