"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type UuidVersion = "v4" | "v1";

/* ── UUID v1 (timestamp-based, pure JS) ── */
let clockSeq = (Math.random() * 0x3fff) | 0;
function uuidV1(): string {
  const now = Date.now();
  // UUID epoch offset: Oct 15, 1582
  const uuidEpoch = now * 10000 + 0x01b21dd213814000;
  const timeLow = ((uuidEpoch & 0xffffffff) >>> 0).toString(16).padStart(8, "0");
  const timeMid = (((uuidEpoch >>> 32) & 0xffff) >>> 0).toString(16).padStart(4, "0");
  const timeHi = ((((uuidEpoch >>> 48) & 0x0fff) | 0x1000) >>> 0).toString(16).padStart(4, "0");
  clockSeq = (clockSeq + 1) & 0x3fff;
  const csHi = ((clockSeq >>> 8) | 0x80).toString(16).padStart(2, "0");
  const csLo = (clockSeq & 0xff).toString(16).padStart(2, "0");
  // Random node (6 bytes) with multicast bit set
  const node = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b, i) => (i === 0 ? b | 0x01 : b).toString(16).padStart(2, "0"))
    .join("");
  return `${timeLow}-${timeMid}-${timeHi}-${csHi}${csLo}-${node}`;
}

/* ── UUID v4 (random) ── */
function uuidV4(): string {
  return crypto.randomUUID();
}

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/* ── Validate UUID ── */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function detectVersion(uuid: string): string | null {
  if (!UUID_REGEX.test(uuid)) return null;
  if (uuid === NIL_UUID) return "nil";
  const version = uuid.charAt(14);
  return `v${version}`;
}

export function UuidGenerator() {
  const t = useTranslations("uuidGenerator.ui");
  const tc = useTranslations("ui");
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [uuids, setUuids] = useState<string[]>(() => [uuidV4()]);
  const [quantity, setQuantity] = useState(10);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [validateInput, setValidateInput] = useState("");

  const generate = useCallback(() => {
    const fn = version === "v4" ? uuidV4 : uuidV1;
    setUuids([fn()]);
  }, [version]);

  const generateBulk = useCallback(() => {
    const fn = version === "v4" ? uuidV4 : uuidV1;
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) list.push(fn());
    setUuids(list);
  }, [version, quantity]);

  const generateNil = () => setUuids([NIL_UUID]);

  const copyOne = async (uuid: string, idx: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const validationResult = validateInput.trim()
    ? UUID_REGEX.test(validateInput.trim())
    : null;
  const detectedVer = validateInput.trim() ? detectVersion(validateInput.trim()) : null;

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc("howItWorks")}</span>{" "}
          {t("howItWorksText")}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition-colors"
          title={t("generateTitle")}
        >
          {t("generate")}
        </button>
        <button
          onClick={generateBulk}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("bulkTitle")}
        >
          {t("bulk")}
        </button>
        <button
          onClick={generateNil}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          title={t("nilTitle")}
        >
          {t("nil")}
        </button>
        {uuids.length > 1 && (
          <button
            onClick={copyAll}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {copiedAll ? t("copiedAll") : t("copyAll")}
          </button>
        )}
        <button
          onClick={() => setUuids([])}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
        >
          {t("clear")}
        </button>

        <div className="ml-auto flex items-center gap-3">
          <label className="text-sm text-zinc-400">{t("version")}</label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as UuidVersion)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="v4">{t("v4")}</option>
            <option value="v1">{t("v1")}</option>
          </select>
        </div>
      </div>

      {/* Version description */}
      <p className="text-xs text-zinc-500">
        {version === "v4" ? t("v4Desc") : t("v1Desc")}
      </p>

      {/* Bulk quantity */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-400">{t("quantity")}</label>
        <input
          type="number"
          min={1}
          max={100}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(100, Math.max(1, Number(e.target.value))))}
          className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
        />
        {uuids.length > 0 && (
          <span className="text-xs text-zinc-500">
            {uuids.length} {t("generated")}
          </span>
        )}
      </div>

      {/* Results */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
          {uuids.length === 1 ? t("result") : t("results")}
        </label>
        {uuids.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 text-sm">
            {t("howItWorksText").split(".")[0]}.
          </div>
        ) : uuids.length === 1 ? (
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors"
            onClick={() => copyOne(uuids[0], 0)}
          >
            <span className="font-mono text-lg text-zinc-100 select-all">{uuids[0]}</span>
            <button className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium transition-colors shrink-0 ml-4">
              {copiedIdx === 0 ? tc("copied") : tc("copy")}
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 max-h-80 overflow-y-auto space-y-1">
            {uuids.map((uuid, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => copyOne(uuid, idx)}
              >
                <span className="font-mono text-sm text-zinc-300 select-all">{uuid}</span>
                <span className="text-xs text-zinc-600 shrink-0 ml-2">
                  {copiedIdx === idx ? tc("copied") : `#${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validator */}
      <div className="border-t border-zinc-800 pt-6">
        <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide">
          {t("validator")}
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={validateInput}
            onChange={(e) => setValidateInput(e.target.value)}
            placeholder={t("validatePlaceholder")}
            spellCheck={false}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
          />
          {validationResult !== null && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                validationResult
                  ? "bg-emerald-900/50 text-emerald-400 border-emerald-800"
                  : "bg-red-900/50 text-red-400 border-red-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  validationResult ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              {validationResult ? t("validUuid") : t("invalidUuid")}
              {detectedVer && ` (${detectedVer})`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
