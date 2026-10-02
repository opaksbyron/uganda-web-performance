/**
 * Gzip the per-run Lighthouse JSON in results/raw and drop the originals.
 * Lossless, so the published runs are still the runs; it roughly halves what
 * has to be pushed, which matters on the connections this study is about.
 *
 *   node scripts/compress-raw.mjs
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const dir = 'results/raw'
const files = readdirSync(dir).filter(f => f.endsWith('.json'))
if (!files.length) { console.log('nothing to compress'); process.exit(0) }

let before = 0, after = 0
for (const f of files) {
  const src = `${dir}/${f}`
  before += statSync(src).size
  const gz = gzipSync(readFileSync(src), { level: 9 })
  writeFileSync(`${src}.gz`, gz)
  unlinkSync(src)
  after += gz.length
}
const mb = n => (n / 1048576).toFixed(1)
console.log(`compressed ${files.length} runs: ${mb(before)} MB -> ${mb(after)} MB`)
