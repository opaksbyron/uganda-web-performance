import type { Measured, Site } from "./types"

export const isMeasured = (s: Site): s is Measured =>
  s.status === "ok" && typeof s.lcp === "number" && typeof s.score === "number"

export function median(values: number[]): number | null {
  const v = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b)
  if (!v.length) return null
  const m = v.length >> 1
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

/** Pearson r. Returns null below three usable pairs, where it would be noise. */
export function pearson(xs: number[], ys: number[]): number | null {
  const pairs = xs.map((x, i) => [x, ys[i]] as const).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
  const n = pairs.length
  if (n < 3) return null
  const sx = pairs.reduce((a, [x]) => a + x, 0)
  const sy = pairs.reduce((a, [, y]) => a + y, 0)
  const sxy = pairs.reduce((a, [x, y]) => a + x * y, 0)
  const sxx = pairs.reduce((a, [x]) => a + x * x, 0)
  const syy = pairs.reduce((a, [, y]) => a + y * y, 0)
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy))
  return den === 0 ? null : (n * sxy - sx * sy) / den
}

export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`
export const megabytes = (bytes: number) => `${(bytes / 1_048_576).toFixed(1)} MB`
