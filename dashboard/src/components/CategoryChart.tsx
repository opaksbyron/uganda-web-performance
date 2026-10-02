import type { Measured } from "../data/types"
import { CATEGORY_LABEL, LCP_GOOD, type Category } from "../data/types"
import { median, seconds } from "../data/stats"

const ORDER: Category[] = ["government", "financial", "university", "control"]

/** Median LCP per category. One measure, one hue; every bar directly labelled. */
export function CategoryChart({ sites }: { sites: Measured[] }) {
  const rows = ORDER.map((c) => {
    const inCat = sites.filter((s) => s.category === c)
    return { category: c, n: inCat.length, lcp: median(inCat.map((s) => s.lcp)) }
  }).filter((r) => r.lcp != null) as { category: Category; n: number; lcp: number }[]

  if (!rows.length) return null
  const max = Math.max(...rows.map((r) => r.lcp))

  return (
    <figure className="m-0">
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <ul className="space-y-6">
          {rows.map((r) => (
            <li key={r.category}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-ink">
                  {CATEGORY_LABEL[r.category]}
                  <span className="ml-2 text-xs text-faint">n={r.n}</span>
                </span>
                <span className="font-mono text-sm tabular-nums text-ink">{seconds(r.lcp)}</span>
              </div>
              <div className="relative mt-2.5 h-3">
                <div
                  className="absolute inset-y-0 left-0 rounded-r-[4px] bg-series"
                  style={{ width: `${(r.lcp / max) * 100}%` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-[-4px] border-l border-dashed border-accent"
                  style={{ left: `${(LCP_GOOD / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-3 text-xs text-faint">
        Median Largest Contentful Paint by category. The dashed line is the 2.5s Core Web Vitals target.
      </figcaption>
    </figure>
  )
}
