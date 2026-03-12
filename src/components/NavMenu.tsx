"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const TOOLS = [
  { key: "faviconGenerator", href: "/tools/favicon-generator", icon: "FI" },
  { key: "jsonFormatter", href: "/tools/json-formatter", icon: "{}" },
  { key: "metaTagGenerator", href: "/tools/meta-tag-generator", icon: "<>" },
  { key: "base64Encoder", href: "/tools/base64-encoder", icon: "B64" },
  { key: "colorConverter", href: "/tools/color-converter", icon: "CLR" },
  { key: "cssUnitConverter", href: "/tools/css-unit-converter", icon: "CSS" },
  { key: "hashGenerator", href: "/tools/hash-generator", icon: "#" },
  { key: "urlEncoder", href: "/tools/url-encoder", icon: "%" },
  { key: "regexTester", href: "/tools/regex-tester", icon: ".*" },
  { key: "loremIpsum", href: "/tools/lorem-ipsum", icon: "Aa" },
] as const;

export function NavMenu() {
  const t = useTranslations("home.tools");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
      >
        Tools
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 p-3 z-50">
          <div className="grid grid-cols-2 gap-1">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-[8px] font-mono font-bold text-emerald-400 shrink-0">
                  {tool.icon}
                </span>
                <span>{t(`${tool.key}.name`)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
