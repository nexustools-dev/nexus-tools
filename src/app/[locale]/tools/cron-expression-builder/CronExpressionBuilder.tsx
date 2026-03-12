"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

/* ── Presets ── */
const PRESETS = [
  { key: "everyMinute", cron: "* * * * *" },
  { key: "everyHour", cron: "0 * * * *" },
  { key: "dailyMidnight", cron: "0 0 * * *" },
  { key: "dailyNoon", cron: "0 12 * * *" },
  { key: "weekdaysOnly", cron: "0 9 * * 1-5" },
  { key: "weekly", cron: "0 0 * * 0" },
  { key: "monthly", cron: "0 0 1 * *" },
  { key: "yearly", cron: "0 0 1 1 *" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ── Parse cron to human readable ── */
function describeField(val: string, type: "minute" | "hour" | "dom" | "month" | "dow"): string {
  if (val === "*") return "every";
  if (val.includes("/")) {
    const [, step] = val.split("/");
    return `every ${step}`;
  }
  if (val.includes("-")) return val;
  if (val.includes(",")) return val;
  if (type === "month" && !isNaN(Number(val))) return MONTHS[Number(val) - 1] || val;
  if (type === "dow" && !isNaN(Number(val))) return DAYS[Number(val)] || val;
  return val;
}

function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid expression";
  const [min, hour, dom, month, dow] = parts;

  const pieces: string[] = [];

  if (min === "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return "Every minute";
  }

  if (min.includes("/")) pieces.push(`Every ${min.split("/")[1]} minutes`);
  else if (min !== "*") pieces.push(`At minute ${min}`);

  if (hour.includes("/")) pieces.push(`every ${hour.split("/")[1]} hours`);
  else if (hour !== "*") pieces.push(`at ${hour.padStart(2, "0")}:${min === "*" ? "00" : min.padStart(2, "0")}`);

  if (dom !== "*") pieces.push(`on day ${dom} of the month`);
  if (month !== "*") pieces.push(`in ${describeField(month, "month")}`);
  if (dow !== "*") {
    const dayNames = dow.split(",").map((d) => {
      if (d.includes("-")) {
        const [a, b] = d.split("-");
        return `${DAYS[Number(a)] || a}-${DAYS[Number(b)] || b}`;
      }
      return DAYS[Number(d)] || d;
    });
    pieces.push(`on ${dayNames.join(", ")}`);
  }

  return pieces.join(" ") || "Every minute";
}

/* ── Next N execution times ── */
function getNextExecutions(cron: string, count: number): Date[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minF, hourF, domF, monthF, dowF] = parts;
  const results: Date[] = [];
  const now = new Date();
  const check = new Date(now.getTime() + 60000); // start from next minute
  check.setSeconds(0, 0);

  const matches = (val: string, num: number, max: number): boolean => {
    if (val === "*") return true;
    if (val.includes("/")) {
      const [base, step] = val.split("/");
      const start = base === "*" ? 0 : Number(base);
      return (num - start) % Number(step) === 0 && num >= start;
    }
    return val.split(",").some((part) => {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        return num >= a && num <= b;
      }
      return num === Number(part);
    });
  };

  for (let i = 0; i < 525600 && results.length < count; i++) { // max 1 year of minutes
    const m = check.getMinutes();
    const h = check.getHours();
    const d = check.getDate();
    const mo = check.getMonth() + 1;
    const dw = check.getDay();

    if (matches(minF, m, 59) && matches(hourF, h, 23) && matches(domF, d, 31) && matches(monthF, mo, 12) && matches(dowF, dw, 6)) {
      results.push(new Date(check));
    }
    check.setTime(check.getTime() + 60000);
  }
  return results;
}

/* ── Field input with local state — select-on-focus, sync-on-blur ── */
function CronFieldInput({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync from parent when not focused (e.g. preset clicked)
  if (!focused && local !== value) setLocal(value);

  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1.5 text-center">{label}</label>
      <input
        ref={inputRef}
        type="text"
        value={focused ? local : value}
        onChange={(e) => setLocal(e.target.value)}
        onFocus={() => {
          setFocused(true);
          setLocal(value);
          setTimeout(() => inputRef.current?.select(), 0);
        }}
        onBlur={() => {
          setFocused(false);
          onChange(local.trim() || "*");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 font-mono text-sm text-center focus:outline-none focus:border-lime-500"
        translate="no"
      />
      <div className="text-[10px] text-zinc-600 text-center mt-1">{hint}</div>
    </div>
  );
}

export function CronExpressionBuilder() {
  const t = useTranslations("cronExpressionBuilder.ui");
  const tc = useTranslations("ui");
  const [cron, setCron] = useState("0 9 * * 1-5");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const parts = cron.trim().split(/\s+/);
  const isValid = parts.length === 5;

  const description = useMemo(() => (isValid ? describeCron(cron) : ""), [cron, isValid]);
  const nextExecs = useMemo(() => (isValid ? getNextExecutions(cron, 5) : []), [cron, isValid]);

  const setPart = (idx: number, val: string) => {
    const p = [...parts];
    while (p.length < 5) p.push("*");
    p[idx] = val;
    setCron(p.join(" "));
  };

  const copyText = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const fields = [
    { label: t("minute"), idx: 0, hint: "0-59" },
    { label: t("hour"), idx: 1, hint: "0-23" },
    { label: t("dayOfMonth"), idx: 2, hint: "1-31" },
    { label: t("month"), idx: 3, hint: "1-12" },
    { label: t("dayOfWeek"), idx: 4, hint: "0-6" },
  ];

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-lime-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Expression input */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("expression")}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-lg text-center focus:outline-none focus:border-lime-500 placeholder-zinc-600"
            spellCheck={false}
            translate="no"
          />
          <button
            onClick={() => copyText(cron, "cron")}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {copiedField === "cron" ? tc("copied") : tc("copy")}
          </button>
        </div>
      </div>

      {/* Human readable */}
      {isValid && (
        <div className="bg-lime-900/30 border border-lime-800/50 rounded-lg px-4 py-3">
          <div className="text-xs text-zinc-500 mb-1">{t("humanReadable")}</div>
          <p className="text-sm text-lime-300 font-medium">{description}</p>
        </div>
      )}

      {/* Field editors */}
      <div className="grid grid-cols-5 gap-3">
        {fields.map((f) => (
          <CronFieldInput
            key={f.idx}
            label={f.label}
            hint={f.hint}
            value={parts[f.idx] || "*"}
            onChange={(val) => setPart(f.idx, val)}
          />
        ))}
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("presets")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setCron(p.cron)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-lime-700 hover:bg-zinc-800 text-xs transition-colors text-left"
            >
              <div className="text-zinc-300 font-medium">{t(p.key)}</div>
              <code className="text-zinc-500 text-[10px] font-mono" translate="no">{p.cron}</code>
            </button>
          ))}
        </div>
      </div>

      {/* Next executions */}
      {isValid && nextExecs.length > 0 && (
        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">{t("nextExecutions")}</label>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800">
            {nextExecs.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/30">
                <span className="text-xs text-zinc-500">{i + 1}.</span>
                <span className="font-mono text-sm text-zinc-300">
                  {d.toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
