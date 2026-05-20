"""
Creates the full frontend/ directory tree with all config files.
Run once from the ASMTrace root before npm install.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND = os.path.join(ROOT, "frontend")


def write(rel_path: str, content: str) -> None:
    path = os.path.join(FRONTEND, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  created {rel_path}")


def mkdir(rel_path: str) -> None:
    os.makedirs(os.path.join(FRONTEND, rel_path), exist_ok=True)
    print(f"  mkdir   {rel_path}")


def main() -> None:
    if os.path.exists(FRONTEND):
        print(f"frontend/ already exists at {FRONTEND}")
        print("Delete it first if you want a clean scaffold.")
        sys.exit(1)

    print(f"Scaffolding frontend at {FRONTEND} ...")

    # ── package.json ──────────────────────────────────────────────────────────
    write("package.json", """\
{
  "name": "asmtrace-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "zustand": "^4.5.2",
    "recharts": "^2.12.7",
    "axios": "^1.7.2",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1",
    "tailwindcss": "^3.4.4",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19",
    "typescript": "^5.5.3",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0"
  }
}
""")

    # ── vite.config.ts ────────────────────────────────────────────────────────
    write("vite.config.ts", """\
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, ''),
      },
    },
  },
})
""")

    # ── tailwind.config.ts ────────────────────────────────────────────────────
    write("tailwind.config.ts", """\
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        verdict: {
          safe: '#22c55e',
          suspicious: '#f59e0b',
          dangerous: '#ef4444',
        },
        asm: {
          register: '#60a5fa',
          mnemonic: '#f472b6',
          immediate: '#4ade80',
          address: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
""")

    # ── postcss.config.js ─────────────────────────────────────────────────────
    write("postcss.config.js", """\
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""")

    # ── tsconfig.json ─────────────────────────────────────────────────────────
    write("tsconfig.json", """\
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
""")

    write("tsconfig.node.json", """\
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts"]
}
""")

    # ── index.html ────────────────────────────────────────────────────────────
    write("index.html", """\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ASMTrace — Assembly Behavior Analysis</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
""")

    write("public/favicon.svg", """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6366f1">
  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
</svg>
""")

    # ── src/ skeleton ─────────────────────────────────────────────────────────
    for d in [
        "src/types", "src/data/samples", "src/api", "src/store", "src/hooks",
        "src/styles",
        "src/components/layout",
        "src/components/panels",
        "src/components/trace",
        "src/components/heatmap",
        "src/components/report",
        "src/components/learn",
        "src/components/common",
    ]:
        mkdir(d)

    write("src/styles/globals.css", """\
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-zinc-950 text-zinc-100 font-mono;
}

/* PDF export: hide navigation, show only report content */
@media print {
  #sidebar,
  #topbar,
  #step-controls,
  .no-print {
    display: none !important;
  }
  #print-report {
    display: block !important;
  }
  body {
    background: white;
    color: black;
  }
}
""")

    write("src/main.tsx", """\
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
""")

    write("src/App.tsx", """\
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

export default function App() {
  return <RouterProvider router={router} />
}
""")

    write("src/router.tsx", """\
import { createBrowserRouter } from 'react-router-dom'
import AppShell from './components/layout/AppShell'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
  },
])
""")

    write("src/data/index.ts", """\
import type { SampleProgram } from '../types/sample'
import helloWorld from './samples/hello_world.json'
import keylogger from './samples/keylogger.json'
import shellcode from './samples/shellcode.json'
import rootkit from './samples/rootkit.json'

export const SAMPLES: Record<string, SampleProgram> = {
  hello_world: helloWorld as SampleProgram,
  keylogger: keylogger as SampleProgram,
  shellcode: shellcode as SampleProgram,
  rootkit: rootkit as SampleProgram,
}

export const SAMPLE_IDS = Object.keys(SAMPLES) as Array<keyof typeof SAMPLES>
""")

    # Stub placeholder files so tsc resolves imports
    for stub_path, stub_content in [
        ("src/types/trace.ts", "// TODO: implement — see plan\nexport type BehaviorCategory = 'filesystem'|'network'|'memory'|'privilege'|'process'|'crypto'\n"),
        ("src/types/report.ts", "// TODO: implement — see plan\n"),
        ("src/types/sample.ts", "// TODO: implement — see plan\nexport interface SampleProgram { id: string; displayName: string; description: string; architecture: string; riskLevel: string; tags: string[]; trace: unknown; report: unknown }\n"),
        ("src/types/api.ts", "// TODO: implement — see plan\n"),
        ("src/store/index.ts", "export * from './analysisStore'\nexport * from './uiStore'\n"),
        ("src/store/analysisStore.ts", "// TODO: implement — see plan\n"),
        ("src/store/uiStore.ts", "// TODO: implement — see plan\n"),
        ("src/hooks/useTracePlayback.ts", "// TODO: implement — see plan\n"),
        ("src/hooks/useAnalysis.ts", "// TODO: implement — see plan\n"),
        ("src/hooks/useStreamingReport.ts", "// TODO: implement — see plan (Phase 3)\n"),
        ("src/api/client.ts", "// TODO: implement — see plan\n"),
        ("src/api/analysis.ts", "// TODO: implement — see plan\n"),
        ("src/api/samples.ts", "// TODO: implement — see plan\n"),
        ("src/components/layout/AppShell.tsx", "export default function AppShell() { return <div>AppShell stub</div> }\n"),
        ("src/components/layout/Sidebar.tsx", "export default function Sidebar() { return <aside>Sidebar stub</aside> }\n"),
        ("src/components/layout/TopBar.tsx", "export default function TopBar() { return <header>TopBar stub</header> }\n"),
        ("src/components/panels/UploadPanel.tsx", "export default function UploadPanel() { return <div>Panel 1: Upload</div> }\n"),
        ("src/components/panels/TracePanel.tsx", "export default function TracePanel() { return <div>Panel 2: Trace</div> }\n"),
        ("src/components/panels/HeatmapPanel.tsx", "export default function HeatmapPanel() { return <div>Panel 3: Heatmap</div> }\n"),
        ("src/components/panels/ReportPanel.tsx", "export default function ReportPanel() { return <div>Panel 4: Report</div> }\n"),
        ("src/components/panels/LearnPanel.tsx", "export default function LearnPanel() { return <div>Panel 5: Learn</div> }\n"),
        ("src/components/common/Badge.tsx", "// TODO: implement\nexport default function Badge({ children }: { children: React.ReactNode }) { return <span>{children}</span> }\nimport React from 'react'\n"),
        ("src/components/common/LoadingSpinner.tsx", "export default function LoadingSpinner() { return <div className='animate-spin'>⟳</div> }\n"),
        ("src/components/common/ErrorBoundary.tsx", "// TODO: implement\n"),
        ("src/components/common/CodeBlock.tsx", "// TODO: implement\n"),
        ("src/components/common/ExportButton.tsx", "export default function ExportButton() { return <button onClick={() => window.print()}>Export PDF</button> }\n"),
    ]:
        write(stub_path, stub_content)

    print("\nScaffold complete.")
    print("Next: cd frontend && npm install")
    print("Then: npx tsc --noEmit  (should pass with stubs)")


if __name__ == "__main__":
    main()
