# Phase 1: Frontend Showcase

## Objective
Build a fully functional React UI with all five panels, realistic mock trace data, and hardcoded AI reports. No backend required. By the end of Week 2 any of the four sample programs can be selected, stepped through instruction-by-instruction, and all five panels render correct data.

## Inputs
- Node.js 20+ installed
- `tools/scaffold_frontend.py` available
- `tools/validate_mock_data.py` available
- This workflow

## Steps

### Step 1 — Scaffold the frontend project
```bash
cd ASMTrace
python tools/scaffold_frontend.py
cd frontend && npm install
```
Verify: `frontend/node_modules/` exists, no install errors.

### Step 2 — Write all TypeScript types first
Author these files before any component work:
- `src/types/trace.ts` — RegisterState, InstructionStep, TraceData, SyscallEvent, BehaviorCategory, InstructionCategory
- `src/types/report.ts` — Verdict, BehaviorEntry, Concept, AIReport
- `src/types/sample.ts` — SampleProgram
- `src/types/api.ts` — AnalyzeRequest, AnalyzeResponse

Run `npx tsc --noEmit` — must pass with zero errors before moving on.

### Step 3 — Author the 4 mock data fixtures
Write `src/data/samples/hello_world.json`, `keylogger.json`, `shellcode.json`, `rootkit.json`.

Requirements per fixture:
- Every `InstructionStep` must have all 10 register fields populated and a non-empty `annotation`
- Every `SyscallEvent` must reference a valid step `index`
- Program personalities:
  - **hello_world** → SAFE, ~12 steps, syscalls: write(fd=1) + exit(0)
  - **keylogger** → SUSPICIOUS, 40+ steps, open("/dev/input/event0") + read loop + write to hidden file, MITRE T1056.001
  - **shellcode** → DANGEROUS, 25 steps, execve("/bin/sh", NULL, NULL), MITRE T1059.004 + T1203
  - **rootkit** → DANGEROUS, 60+ steps, open("/proc/modules") + ioctl + setuid(0), MITRE T1014 + T1548.001

Run `python tools/validate_mock_data.py` — all 4 must pass. Fix any schema mismatches before continuing.

### Step 4 — Write Zustand stores
- `src/store/analysisStore.ts` — activeSample, activeTrace, activeReport, currentStep, isPlaying, playbackSpeed
- `src/store/uiStore.ts` — activePanel, isLoading, error
- `src/store/index.ts` — re-export both

### Step 5 — Build common primitives
Author these before panels (panels depend on them):
- `src/components/common/Badge.tsx`
- `src/components/common/CodeBlock.tsx`
- `src/components/common/LoadingSpinner.tsx`
- `src/components/common/ErrorBoundary.tsx`
- `src/components/common/ExportButton.tsx` — calls `window.print()`

### Step 6 — Build layout shell
- `src/components/layout/AppShell.tsx` — sidebar (240px fixed) + main content (flex-1)
- `src/components/layout/Sidebar.tsx` — 5 nav items with icons, reads uiStore.activePanel
- `src/components/layout/TopBar.tsx` — title + sample selector `<select>`

Create stub versions of all 5 panels (each returns `<div>Panel Name</div>`).
Wire `src/router.tsx` → `src/App.tsx` → `src/main.tsx`.

Run `npm run dev` — sidebar navigation between stub panels must work.

### Step 7 — Implement Panel 1: UploadPanel
- Grid of 4 SampleCard components showing displayName, description, riskLevel badge, "Load Sample" button
- Clicking a card: calls `setActiveSample()` → navigates to 'trace' panel
- Dashed dropzone below cards with "Backend integration coming in Phase 2" (disabled)

### Step 8 — Implement Panel 2: TracePanel
Sub-components to build first:
- `src/components/trace/SyscallBadge.tsx`
- `src/components/trace/InstructionRow.tsx` — color by category, highlight active step
- `src/components/trace/RegisterSidebar.tsx`
- `src/components/trace/StepControls.tsx` — play/pause/step fwd/back/reset + speed slider

Hook: `src/hooks/useTracePlayback.ts` — useEffect + setInterval auto-advance when isPlaying.

Assemble `TracePanel.tsx`. Load hello_world and verify step-through works end-to-end.

### Step 9 — Implement Panel 3: HeatmapPanel
- `src/components/heatmap/BehaviorHeatmap.tsx` — Recharts RadarChart with data from report.behaviors
- `src/components/heatmap/CategoryCard.tsx` — risk-tier background color
- `src/components/heatmap/SyscallList.tsx`

Assemble `HeatmapPanel.tsx`.

### Step 10 — Implement Panel 4: ReportPanel
- `src/components/report/VerdictBadge.tsx` — SAFE/SUSPICIOUS/DANGEROUS color chips
- `src/components/report/ConfidenceRing.tsx` — circular gauge
- `src/components/report/NarrativeBlock.tsx` — react-markdown with Tailwind prose
- `src/components/report/MitreTable.tsx` — links to attack.mitre.org
- `src/components/report/RiskScoreBar.tsx`

Add `@media print` block in `globals.css` hiding sidebar + controls.
Assemble `ReportPanel.tsx`. Verify window.print() renders report-only layout.

### Step 11 — Implement Panel 5: LearnPanel
- `src/components/learn/CourseTopicBadge.tsx`
- `src/components/learn/ConceptCard.tsx` — CSS 3D flip card (Tailwind group + rotate-y-180 on hover)
- `src/components/learn/ConceptGrid.tsx`

Assemble `LearnPanel.tsx`.

### Step 12 — Stub the API client
- `src/api/client.ts` — Axios instance with baseURL from env, interceptors
- `src/api/analysis.ts` — stub functions (not called yet)
- `src/api/samples.ts` — stub

### Step 13 — Cross-sample QA
For each of the 4 sample programs:
1. Load it from UploadPanel
2. Step through 10 instructions in TracePanel
3. Verify register sidebar updates each step
4. Check HeatmapPanel renders radar chart with correct risk scores
5. Check ReportPanel shows correct verdict + narrative
6. Check LearnPanel shows all concept cards
7. Open print preview — report-only layout must render

Run `npx tsc --noEmit` — zero errors.

## Expected Outputs
- `frontend/` — fully functional React app, all 5 panels working with all 4 samples
- All panels accessible via sidebar navigation
- Step-through execution works on all 4 samples
- PDF export works via browser print
- TypeScript strict-mode clean

## Edge Cases
- If a sample fixture fails `validate_mock_data.py`, fix the JSON before wiring to components — type mismatches cause silent undefined rendering bugs
- If Recharts RadarChart renders blank, check that `data` array has at least 1 entry with both `subject` and `score` fields
- If CSS flip card doesn't animate, ensure `perspective` is set on the parent container
- If `window.print()` shows sidebar, check `@media print` CSS specificity — may need `!important` on `display: none`
