PHASE 4: PERFORMANCE AUDIT

Target module: $ARGUMENTS

<prerequisites>
1. Verify module has Phases 1, 2, 3 approved in docs/audit/approved-modules.md
2. Read docs/audit/known-issues-resolved.md
</prerequisites>

<scope_lock>
ONLY analyze the specified tool component.
Focus on CLIENT-SIDE performance only:
- Unnecessary re-renders (missing useMemo, useCallback, React.memo)
- Heavy computation on every keystroke (should debounce)
- Large state objects causing cascade re-renders
- Canvas/DOM operations that could be optimized
- ObjectURL leaks (missing revokeObjectURL)
- Expensive operations in render path (should be in useEffect)
Do NOT suggest infrastructure changes — this is a static site.
Do NOT suggest server-side optimizations — there is no server.
</scope_lock>

<context>
This is a Next.js 15 client-side tool. All processing happens in the browser.
Users interact with inputs and see real-time output transformations.
Performance matters for UX responsiveness, not for server load.
</context>

For each finding:
[IMPACT: HIGH/MEDIUM/LOW]
- Bottleneck: [description]
- Location: [file:line]
- Estimated impact: [e.g., "prevents re-render of entire component on each keystroke"]
- Fix: [specific code]
- Measurement: [how to verify improvement]

Rank top 3 optimizations by impact-to-effort ratio.
Score: Module Performance Score X/10.
