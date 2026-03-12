"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const localeLabels: Record<string, string> = {
  en: "EN",
  es: "ES",
  pt: "PT",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex gap-1" translate="no">
      {Object.entries(localeLabels).map(([code, label]) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code })}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            locale === code
              ? "bg-emerald-600 text-white"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
