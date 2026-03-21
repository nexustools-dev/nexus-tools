'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

const SAMPLE_CIDR = '192.168.1.0/24';

const COMMON_SUBNETS = [
  { cidr: '/8', mask: '255.0.0.0', hosts: '16,777,214', label: 'Class A' },
  { cidr: '/16', mask: '255.255.0.0', hosts: '65,534', label: 'Class B' },
  { cidr: '/24', mask: '255.255.255.0', hosts: '254', label: 'Class C' },
  { cidr: '/25', mask: '255.255.255.128', hosts: '126', label: '' },
  { cidr: '/26', mask: '255.255.255.192', hosts: '62', label: '' },
  { cidr: '/27', mask: '255.255.255.224', hosts: '30', label: '' },
  { cidr: '/28', mask: '255.255.255.240', hosts: '14', label: '' },
  { cidr: '/29', mask: '255.255.255.248', hosts: '6', label: '' },
  { cidr: '/30', mask: '255.255.255.252', hosts: '2', label: 'Point-to-point' },
  { cidr: '/31', mask: '255.255.255.254', hosts: '2', label: 'RFC 3021' },
  { cidr: '/32', mask: '255.255.255.255', hosts: '1', label: 'Host route' },
] as const;

function parseIp(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (isNaN(n) || n < 0 || n > 255) return null;
    result = (result << 8) | n;
  }
  return result >>> 0;
}

function ipToString(ip: number): string {
  return [
    (ip >>> 24) & 0xff,
    (ip >>> 16) & 0xff,
    (ip >>> 8) & 0xff,
    ip & 0xff,
  ].join('.');
}

function ipToBinary(ip: number): string {
  return ip.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1);
}

function calculateCidr(input: string) {
  const match = input.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!match) return null;

  const ip = parseIp(match[1]);
  const prefix = parseInt(match[2], 10);
  if (ip === null || prefix < 0 || prefix > 32) return null;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;
  const totalHosts = prefix === 32 ? 1 : prefix === 31 ? 2 : Math.pow(2, 32 - prefix) - 2;

  // Determine IP class
  const firstOctet = (ip >>> 24) & 0xff;
  let ipClass = 'Unknown';
  if (firstOctet < 128) ipClass = 'Class A';
  else if (firstOctet < 192) ipClass = 'Class B';
  else if (firstOctet < 224) ipClass = 'Class C';
  else if (firstOctet < 240) ipClass = 'Class D (Multicast)';
  else ipClass = 'Class E (Reserved)';

  // Private range check
  let isPrivate = false;
  if ((ip >>> 24) === 10) isPrivate = true; // 10.0.0.0/8
  else if ((ip >>> 20) === (172 << 4 | 1)) isPrivate = true; // 172.16.0.0/12
  else if ((ip >>> 16) === (192 << 8 | 168)) isPrivate = true; // 192.168.0.0/16

  return {
    ip: ipToString(ip),
    prefix,
    mask: ipToString(mask),
    wildcard: ipToString(wildcard),
    network: ipToString(network),
    broadcast: ipToString(broadcast),
    firstHost: ipToString(firstHost),
    lastHost: ipToString(lastHost),
    totalHosts,
    ipBinary: ipToBinary(ip),
    maskBinary: ipToBinary(mask),
    ipClass,
    isPrivate,
  };
}

export function CidrCalculator() {
  const t = useTranslations('cidrCalculator.ui');
  const tc = useTranslations('ui');
  const [input, setInput] = useState(SAMPLE_CIDR);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const result = useMemo(() => calculateCidr(input), [input]);

  const copyValue = useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* clipboard unavailable */ }
  }, []);

  const ResultRow = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-white">{value}</span>
        <button
          onClick={() => copyValue(value, field)}
          className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] transition-colors"
        >
          {copiedField === field ? tc('copied') : tc('copy')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400 font-medium">{tc('howItWorks')}</span>{' '}
          {t('howItWorksText')}
        </p>
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-2">{t('inputLabel')}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="192.168.1.0/24"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-lg focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
          />
          <button
            onClick={() => setInput(SAMPLE_CIDR)}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
          >
            {t('sample')}
          </button>
        </div>
        {input && !result && (
          <p className="text-red-400 text-xs mt-2">{t('invalidCidr')}</p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Network Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">{t('networkInfo')}</h3>
            <ResultRow label={t('networkAddress')} value={result.network} field="network" />
            <ResultRow label={t('broadcastAddress')} value={result.broadcast} field="broadcast" />
            <ResultRow label={t('subnetMask')} value={result.mask} field="mask" />
            <ResultRow label={t('wildcardMask')} value={result.wildcard} field="wildcard" />
            <ResultRow label={t('prefix')} value={`/${result.prefix}`} field="prefix" />
          </div>

          {/* Host Range */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">{t('hostRange')}</h3>
            <ResultRow label={t('firstHost')} value={result.firstHost} field="first" />
            <ResultRow label={t('lastHost')} value={result.lastHost} field="last" />
            <ResultRow label={t('totalHosts')} value={result.totalHosts.toLocaleString()} field="total" />
            <ResultRow label={t('ipClass')} value={result.ipClass} field="class" />
            <ResultRow label={t('privateRange')} value={result.isPrivate ? t('yes') : t('no')} field="private" />
          </div>

          {/* Binary */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">{t('binaryRepresentation')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-24">{t('ipAddress')}</span>
                <code className="text-xs font-mono text-white bg-zinc-800 px-3 py-1.5 rounded flex-1 overflow-x-auto">{result.ipBinary}</code>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-24">{t('subnetMask')}</span>
                <code className="text-xs font-mono text-emerald-400 bg-zinc-800 px-3 py-1.5 rounded flex-1 overflow-x-auto">{result.maskBinary}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick reference table */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">{t('quickReference')}</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-4 py-2">CIDR</th>
                <th className="text-left px-4 py-2">{t('subnetMask')}</th>
                <th className="text-right px-4 py-2">{t('hosts')}</th>
                <th className="text-left px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {COMMON_SUBNETS.map((s) => (
                <tr
                  key={s.cidr}
                  className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  onClick={() => setInput(`${input.split('/')[0] || '192.168.1.0'}${s.cidr}`)}
                >
                  <td className="px-4 py-2 font-mono text-emerald-400">{s.cidr}</td>
                  <td className="px-4 py-2 font-mono text-zinc-300">{s.mask}</td>
                  <td className="px-4 py-2 text-right text-zinc-300">{s.hosts}</td>
                  <td className="px-4 py-2 text-zinc-500 text-xs">{s.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
