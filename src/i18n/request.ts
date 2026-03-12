import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

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
    },
  };
});
