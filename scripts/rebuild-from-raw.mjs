/**
 * Rebuild results/measurements.json from the per-run Lighthouse JSON in
 * results/raw. Useful when a sweep was interrupted before it aggregated,
 * or to re-derive the table after changing which metrics are reported.
 *
 *   node scripts/rebuild-from-raw.mjs [--out results/measurements.json]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d }
const OUT = arg('--out', 'results/measurements.json')

const median = a => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

const sites = readFileSync('sites.csv', 'utf8').trim().split('\n').slice(1)
  .map(l => { const [category, country, name, url] = l.split(','); return { category, country, name, url } })

const byKey = new Map(sites.map(s => [s.name.replace(/\W+/g, '_'), s]))
const runsFor = new Map()

for (const file of readdirSync('results/raw').filter(f => /\.json(\.gz)?$/.test(f))) {
  const key = file.replace(/_\d+\.json(\.gz)?$/, '')
  if (!byKey.has(key)) continue
  let lh
  try {
    const buf = readFileSync(`results/raw/${file}`)
    lh = JSON.parse(file.endsWith('.gz') ? gunzipSync(buf).toString('utf8') : buf.toString('utf8'))
  } catch { continue }
  const a = lh.audits
  if (!a?.['largest-contentful-paint']) continue
  if (!runsFor.has(key)) runsFor.set(key, [])
  runsFor.get(key).push({
    score: Math.round((lh.categories.performance.score ?? 0) * 100),
    fcp: a['first-contentful-paint'].numericValue,
    lcp: a['largest-contentful-paint'].numericValue,
    tbt: a['total-blocking-time'].numericValue,
    cls: a['cumulative-layout-shift'].numericValue,
    si: a['speed-index'].numericValue,
    tti: a['interactive']?.numericValue ?? null,
    bytes: a['total-byte-weight'].numericValue,
    requests: a['network-requests']?.details?.items?.length ?? null,
  })
}

const out = sites.map(site => {
  const runs = runsFor.get(site.name.replace(/\W+/g, '_')) ?? []
  if (!runs.length) return { ...site, status: 'failed' }
  const pick = k => median(runs.map(r => r[k]).filter(v => v != null))
  return { ...site, status: 'ok', n: runs.length,
    score: pick('score'), fcp: pick('fcp'), lcp: pick('lcp'), tbt: pick('tbt'),
    cls: pick('cls'), si: pick('si'), tti: pick('tti'),
    bytes: pick('bytes'), requests: pick('requests') }
})

writeFileSync(OUT, JSON.stringify(out, null, 2))
const ok = out.filter(r => r.status === 'ok').length
console.log(`wrote ${OUT} — ${ok}/${out.length} sites rebuilt from raw runs`)
