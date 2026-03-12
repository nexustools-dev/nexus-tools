"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  { key: "uuidGenerator", href: "/tools/uuid-generator", icon: "ID" },
  { key: "jwtDecoder", href: "/tools/jwt-decoder", icon: "JWT" },
  { key: "timestampConverter", href: "/tools/timestamp-converter", icon: "TS" },
  { key: "markdownPreview", href: "/tools/markdown-preview", icon: "MD" },
  { key: "cssGradientGenerator", href: "/tools/css-gradient-generator", icon: "GR" },
  { key: "diffChecker", href: "/tools/diff-checker", icon: "±" },
] as const;

export function NavMenu() {
  const t = useTranslations("home.tools");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard shortcut: Ctrl+K to toggle
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) setSearch("");
          return !prev;
        });
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return TOOLS;
    const q = search.toLowerCase();
    return TOOLS.filter((tool) => {
      const name = t(`${tool.key}.name`).toLowerCase();
      const slug = tool.href.toLowerCase();
      const icon = tool.icon.toLowerCase();
      return name.includes(q) || slug.includes(q) || icon.includes(q);
    });
  }, [search, t]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (open) setSearch("");
        }}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800/50"
      >
        Tools
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500 font-mono ml-1">
          Ctrl+K
        </kbd>
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
        <div className="absolute right-0 top-full mt-2 w-[28rem] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 p-3 z-50 max-h-[80vh] overflow-y-auto">
          {/* Search input */}
          <div className="mb-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-1">
            {filtered.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => {
                  setOpen(false);
                  setSearch("");
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-[8px] font-mono font-bold text-emerald-400 shrink-0" translate="no">
                  {tool.icon}
                </span>
                <span>{t(`${tool.key}.name`)}</span>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-xs text-zinc-500 py-4">
              No tools found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
