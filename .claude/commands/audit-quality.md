PHASE 1: CODE QUALITY AUDIT — Single Module Focus

Target module: $ARGUMENTS
Phase: Code Quality (readability, maintainability, conventions)
Mode: ANALYSIS ONLY — Do not make any changes yet.

<prerequisites>
Read these files first:
- docs/audit/progress-tracker.md (current state)
- docs/audit/known-issues-resolved.md (skip these)
- CLAUDE.md (project conventions)
</prerequisites>

<scope_lock>
ONLY analyze the specified tool component.
Do NOT analyze or comment on any other tool.
Do NOT report security, performance, or test coverage issues — those are later phases.
</scope_lock>

<context>
This is a Next.js 15 project with 34 client-side developer tools.
Each tool is a React client component ("use client") with 0 server calls.
Stack: TypeScript, Tailwind CSS v4, next-intl for i18n.
All processing happens in the browser (Canvas API, Web Crypto API, native JS).
</context>

Analyze for:
1. Functions exceeding 50 lines or high cyclomatic complexity
2. Code duplication (similar logic in multiple places within the component)
3. Naming inconsistencies (variables, functions, state)
4. Missing or incorrect TypeScript types (any usage)
5. Poor error handling (unhandled promise rejections, missing try/catch)
6. Dead code (unused imports, unreachable branches, commented-out code)
7. Violations of project conventions in CLAUDE.md
8. Component structure (could logic be extracted into custom hooks or utils?)

For each finding:
[SEVERITY: HIGH/MEDIUM/LOW] — Issue | file:line | Description | Specific fix suggestion

After all findings, provide:
- Module Quality Score: X/10
- Top 3 priority fixes (the ones that unlock the most improvement)
- Systemic patterns (if any suggest issues across other tools)

Cap at 8 findings maximum. If there are more than 8, only report the 8 highest severity.
