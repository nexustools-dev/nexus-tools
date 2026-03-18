'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

/* ── Permission bits ── */
const PERM_BITS = [
  { label: 'read', bit: 4 },
  { label: 'write', bit: 2 },
  { label: 'execute', bit: 1 },
] as const;

const GROUPS = ['owner', 'group', 'others'] as const;

const SPECIAL_BITS = [
  { label: 'setuid', bit: 4 },
  { label: 'setgid', bit: 2 },
  { label: 'sticky', bit: 1 },
] as const;

interface Permissions {
  owner: number;
  group: number;
  others: number;
  special: number;
}

const PRESETS: { key: string; perms: Permissions }[] = [
  { key: 'fileDefault', perms: { owner: 6, group: 4, others: 4, special: 0 } },
  { key: 'dirDefault', perms: { owner: 7, group: 5, others: 5, special: 0 } },
  { key: 'private', perms: { owner: 6, group: 0, others: 0, special: 0 } },
  { key: 'fullAccess', perms: { owner: 7, group: 7, others: 7, special: 0 } },
  { key: 'readOnly', perms: { owner: 4, group: 0, others: 0, special: 0 } },
];

function permToSymbolic(n: number): string {
  return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
}

function toSymbolic(p: Permissions): string {
  const s = permToSymbolic(p.owner) + permToSymbolic(p.group) + permToSymbolic(p.others);
  // Apply special bits to symbolic
  const chars = s.split('');
  if (p.special & 4) chars[2] = chars[2] === 'x' ? 's' : 'S'; // setuid
  if (p.special & 2) chars[5] = chars[5] === 'x' ? 's' : 'S'; // setgid
  if (p.special & 1) chars[8] = chars[8] === 'x' ? 't' : 'T'; // sticky
  return chars.join('');
}

function toOctal(p: Permissions): string {
  if (p.special > 0) return `${p.special}${p.owner}${p.group}${p.others}`;
  return `${p.owner}${p.group}${p.others}`;
}

function parseOctal(str: string): Permissions | null {
  const clean = str.replace(/\D/g, '');
  if (clean.length === 3) {
    const [o, g, t] = clean.split('').map(Number);
    if ([o, g, t].some((n) => isNaN(n) || n > 7)) return null;
    return { owner: o, group: g, others: t, special: 0 };
  }
  if (clean.length === 4) {
    const [s, o, g, t] = clean.split('').map(Number);
    if ([s, o, g, t].some((n) => isNaN(n) || n > 7)) return null;
    return { owner: o, group: g, others: t, special: s };
  }
  return null;
}

export function ChmodCalculator() {
  const t = useTranslations('chmodCalculator.ui');
  const tc = useTranslations('ui');
  const [perms, setPerms] = useState<Permissions>({ owner: 7, group: 5, others: 5, special: 0 });
  const [octalInput, setOctalInput] = useState('755');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const symbolic = useMemo(() => toSymbolic(perms), [perms]);
  const octal = useMemo(() => toOctal(perms), [perms]);
  const command = useMemo(() => `chmod ${octal} filename`, [octal]);

  const toggleBit = useCallback((group: (typeof GROUPS)[number], bit: number) => {
    setPerms((prev) => {
      const next = { ...prev };
      next[group] = prev[group] ^ bit;
      setOctalInput(toOctal(next));
      return next;
    });
  }, []);

  const toggleSpecial = useCallback((bit: number) => {
    setPerms((prev) => {
      const next = { ...prev, special: prev.special ^ bit };
      setOctalInput(toOctal(next));
      return next;
    });
  }, []);

  const handleOctalChange = useCallback((val: string) => {
    setOctalInput(val);
    const parsed = parseOctal(val);
    if (parsed) setPerms(parsed);
  }, []);

  const applyPreset = useCallback((preset: Permissions) => {
    setPerms(preset);
    setOctalInput(toOctal(preset));
  }, []);

  const copyText = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-green-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Octal input */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-zinc-400">{t('octal')}:</label>
        <input
          value={octalInput}
          onChange={(e) => handleOctalChange(e.target.value)}
          maxLength={4}
          className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-2xl text-center focus:outline-none focus:border-green-500"
        />
        <div className="text-sm text-zinc-400">
          <span className="text-zinc-500">{t('symbolic')}:</span>{' '}
          <code className="font-mono text-lg text-green-400" translate="no">
            {symbolic}
          </code>
        </div>
      </div>

      {/* Permission grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 gap-0 border-b border-zinc-800">
          <div className="px-4 py-3" />
          {PERM_BITS.map((p) => (
            <div
              key={p.label}
              className="px-4 py-3 text-center text-xs text-zinc-500 uppercase font-medium"
            >
              {t(p.label)}
            </div>
          ))}
        </div>
        {/* Rows */}
        {GROUPS.map((group) => (
          <div key={group} className="grid grid-cols-4 gap-0 border-b border-zinc-800">
            <div className="px-4 py-3 text-sm font-medium text-zinc-300">{t(group)}</div>
            {PERM_BITS.map((p) => {
              const active = (perms[group] & p.bit) !== 0;
              return (
                <div key={p.label} className="flex items-center justify-center py-3">
                  <button
                    onClick={() => toggleBit(group, p.bit)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${active ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}
                  >
                    {active ? p.label[0].toUpperCase() : '—'}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        {/* Special bits */}
        <div className="grid grid-cols-4 gap-0">
          <div className="px-4 py-3 text-sm font-medium text-zinc-400">
            {t('special') || 'Special'}
          </div>
          {SPECIAL_BITS.map((s) => {
            const active = (perms.special & s.bit) !== 0;
            return (
              <div key={s.label} className="flex flex-col items-center justify-center py-3 gap-1">
                <button
                  onClick={() => toggleSpecial(s.bit)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${active ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}
                >
                  {active ? 'ON' : '—'}
                </button>
                <span className="text-[10px] text-zinc-500">{t(s.label)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Command output */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wide">{t('command')}</label>
            <code className="block font-mono text-lg text-zinc-200 mt-1" translate="no">
              {command}
            </code>
          </div>
          <button
            onClick={() => copyText(command, 'cmd')}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {copiedField === 'cmd' ? tc('copied') : t('copy')}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">
          {t('presets')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.perms)}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              <span className="font-mono text-green-400" translate="no">
                {toOctal(p.perms)}
              </span>
              <span className="text-zinc-400 ml-2">{t(p.key)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
