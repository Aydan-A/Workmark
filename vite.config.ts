import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { gzipSync } from 'node:zlib'

// Per-chunk gzipped size budgets in KB. A chunk over its budget fails the build.
// Defaults apply to any chunk not matched by name. Tune deliberately — bumping a
// number should be a conscious tradeoff, not a workaround.
const CHUNK_BUDGETS_KB: Record<string, number> = {
  // Critical landing path — must stay tiny.
  index: 60,
  Landing: 40,
  react: 70,
  router: 35,
  // Heavy but lazy/auth-only chunks.
  mui: 180,
  firebase: 140,
  framer: 50,
  'date-fns': 20,
  // Off-critical-path: only loaded behind auth or user action.
  pdf: 280,
  p5: 380,
  recharts: 130,
  fullcalendar: 120,
  three: 200,
  gsap: 60,
  lenis: 15,
}
const DEFAULT_BUDGET_KB = 60

function bundleSizeBudget(): Plugin {
  return {
    name: 'bundle-size-budget',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const violations: string[] = []
      const reports: Array<{ name: string; chunk: string; gzipKb: number; budgetKb: number }> = []
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type !== 'chunk' || !fileName.endsWith('.js')) continue
        const base = fileName.replace(/^assets\//, '').replace(/-[A-Za-z0-9_-]{6,}\.js$/, '')
        const budgetKb = CHUNK_BUDGETS_KB[base] ?? DEFAULT_BUDGET_KB
        const gzipKb = gzipSync(asset.code).byteLength / 1024
        reports.push({ name: base, chunk: fileName, gzipKb, budgetKb })
        if (gzipKb > budgetKb) {
          violations.push(
            `  ${fileName}  ${gzipKb.toFixed(1)} KB gz > budget ${budgetKb} KB (chunk: "${base}")`,
          )
        }
      }
      reports.sort((a, b) => b.gzipKb - a.gzipKb)
      const lines = reports
        .slice(0, 15)
        .map((r) => `  ${r.gzipKb.toFixed(1).padStart(6)} KB gz / ${String(r.budgetKb).padStart(3)} KB budget  ${r.chunk}`)
      this.info(`bundle-size-budget — top chunks (gzipped):\n${lines.join('\n')}`)
      if (violations.length > 0) {
        this.warn(
          `bundle-size-budget exceeded for ${violations.length} chunk(s):\n${violations.join('\n')}\n` +
            `Reduce the chunk or update CHUNK_BUDGETS_KB in vite.config.ts with justification.`,
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), bundleSizeBudget()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase'
          if (id.includes('/p5/')) return 'p5'
          if (id.includes('/jspdf') || id.includes('/html2canvas') || id.includes('/dompurify') || id.includes('/canvg')) return 'pdf'
          if (id.includes('/@fullcalendar/')) return 'fullcalendar'
        },
      },
    },
  },
})
