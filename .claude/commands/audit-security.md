PHASE 3: SECURITY AUDIT

Target module: $ARGUMENTS

<prerequisites>
1. Verify module has Phase 1 AND Phase 2 approved in docs/audit/approved-modules.md
2. Read docs/audit/known-issues-resolved.md — NEVER re-report these
</prerequisites>

<threat_model>
Application type: Client-side developer tools website (NO backend, NO auth, NO database)
Exposure: Public internet — static site with client-side processing only
Data sensitivity: NONE — all data stays in user's browser, never transmitted
Attack surface: XSS via dangerouslySetInnerHTML, clipboard injection, malicious input rendering
</threat_model>

<scope_lock>
ONLY analyze the specified tool component.
Focus on client-side security issues:
- XSS via dangerouslySetInnerHTML or innerHTML
- URL injection (javascript:, vbscript:, data: protocols)
- Clipboard API abuse
- Input that gets rendered without sanitization
- ObjectURL memory leaks (URL.revokeObjectURL)
- File input handling (if applicable)
Do NOT report server-side issues — there is no server.
Do NOT report CSRF, SQL injection, or auth issues — they don't apply.
</scope_lock>

For each finding:
[SEVERITY: CRITICAL/HIGH/MEDIUM/LOW]
- Vulnerability: [type]
- Location: [file:line]
- Exploit scenario: [specific attack for a client-side tool]
- Fix: [code example]
- Confidence: [HIGH/MEDIUM/LOW]

CRITICAL and HIGH only — cap at 5 findings.
Include: Module Security Score X/10.
