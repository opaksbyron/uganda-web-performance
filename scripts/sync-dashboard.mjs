/**
 * Copy the measurement output into the dashboard's data directory and stamp
 * the run date, so the published figures and the date on the page cannot drift
 * apart. Run after a sweep, before building the dashboard.
 *
 *   node scripts/sync-dashboard.mjs
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs'

const SRC = 'results/measurements.json'
const DEST = 'dashboard/src/data/measurements.json'
const META = 'dashboard/src/data/meta.json'

const rows = JSON.parse(readFileSync(SRC, 'utf8'))
writeFileSync(DEST, JSON.stringify(rows, null, 2))

const runDate = statSync(SRC).mtime.toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric',
})
const meta = JSON.parse(readFileSync(META, 'utf8'))
writeFileSync(META, JSON.stringify({ ...meta, runDate }, null, 2))

const ok = rows.filter(r => r.status === 'ok').length
console.log(`synced ${rows.length} rows (${ok} measured) to the dashboard, dated ${runDate}`)
