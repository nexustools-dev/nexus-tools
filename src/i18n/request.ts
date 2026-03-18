import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const common = (await import(`../messages/${locale}/common.json`)).default;
  const faviconGenerator = (await import(`../messages/${locale}/favicon-generator.json`)).default;
  const jsonFormatter = (await import(`../messages/${locale}/json-formatter.json`)).default;
  const metaTagGenerator = (await import(`../messages/${locale}/meta-tag-generator.json`)).default;
  const base64Encoder = (await import(`../messages/${locale}/base64-encoder.json`)).default;
  const colorConverter = (await import(`../messages/${locale}/color-converter.json`)).default;
  const cssUnitConverter = (await import(`../messages/${locale}/css-unit-converter.json`)).default;
  const hashGenerator = (await import(`../messages/${locale}/hash-generator.json`)).default;
  const urlEncoder = (await import(`../messages/${locale}/url-encoder.json`)).default;
  const regexTester = (await import(`../messages/${locale}/regex-tester.json`)).default;
  const loremIpsum = (await import(`../messages/${locale}/lorem-ipsum.json`)).default;
  const uuidGenerator = (await import(`../messages/${locale}/uuid-generator.json`)).default;
  const jwtDecoder = (await import(`../messages/${locale}/jwt-decoder.json`)).default;
  const timestampConverter = (await import(`../messages/${locale}/timestamp-converter.json`))
    .default;
  const markdownPreview = (await import(`../messages/${locale}/markdown-preview.json`)).default;
  const cssGradientGenerator = (await import(`../messages/${locale}/css-gradient-generator.json`))
    .default;
  const diffChecker = (await import(`../messages/${locale}/diff-checker.json`)).default;
  const passwordGenerator = (await import(`../messages/${locale}/password-generator.json`)).default;
  const qrCodeGenerator = (await import(`../messages/${locale}/qr-code-generator.json`)).default;
  const cronExpressionBuilder = (await import(`../messages/${locale}/cron-expression-builder.json`))
    .default;
  const jsonCsvConverter = (await import(`../messages/${locale}/json-csv-converter.json`)).default;
  const textCaseConverter = (await import(`../messages/${locale}/text-case-converter.json`))
    .default;
  const placeholderImage = (await import(`../messages/${locale}/placeholder-image.json`)).default;
  const sqlFormatter = (await import(`../messages/${locale}/sql-formatter.json`)).default;
  const jsonYamlConverter = (await import(`../messages/${locale}/json-yaml-converter.json`))
    .default;
  const chmodCalculator = (await import(`../messages/${locale}/chmod-calculator.json`)).default;
  const boxShadowGenerator = (await import(`../messages/${locale}/box-shadow-generator.json`))
    .default;
  const borderRadiusGenerator = (await import(`../messages/${locale}/border-radius-generator.json`))
    .default;
  const aspectRatioCalculator = (await import(`../messages/${locale}/aspect-ratio-calculator.json`))
    .default;
  const imageCompressor = (await import(`../messages/${locale}/image-compressor.json`)).default;
  const svgToPng = (await import(`../messages/${locale}/svg-to-png.json`)).default;
  const htmlEntityEncoder = (await import(`../messages/${locale}/html-entity-encoder.json`))
    .default;
  const colorPaletteGenerator = (await import(`../messages/${locale}/color-palette-generator.json`))
    .default;
  const textShadowGenerator = (await import(`../messages/${locale}/text-shadow-generator.json`))
    .default;
  const csvToSql = (await import(`../messages/${locale}/csv-to-sql.json`)).default;

  return {
    locale,
    messages: {
      ...common,
      faviconGenerator,
      jsonFormatter,
      metaTagGenerator,
      base64Encoder,
      colorConverter,
      cssUnitConverter,
      hashGenerator,
      urlEncoder,
      regexTester,
      loremIpsum,
      uuidGenerator,
      jwtDecoder,
      timestampConverter,
      markdownPreview,
      cssGradientGenerator,
      diffChecker,
      passwordGenerator,
      qrCodeGenerator,
      cronExpressionBuilder,
      jsonCsvConverter,
      textCaseConverter,
      placeholderImage,
      sqlFormatter,
      jsonYamlConverter,
      chmodCalculator,
      boxShadowGenerator,
      borderRadiusGenerator,
      aspectRatioCalculator,
      imageCompressor,
      svgToPng,
      htmlEntityEncoder,
      colorPaletteGenerator,
      textShadowGenerator,
      csvToSql,
    },
  };
});
