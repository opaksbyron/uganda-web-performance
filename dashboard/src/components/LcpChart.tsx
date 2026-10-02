import { useState } from "react"
import type { Measured } from "../data/types"
import { LCP_GOOD, VERDICT_LABEL, verdict } from "../data/types"
import { megabytes, seconds } from "../data/stats"

const NAME_COL = "w-28 sm:w-44"
const VALUE_COL = "w-14"

/**
 * Ranked horizontal bars. One measure, so one hue: the verdict is carried by the
 * labelled threshold line and by the table's status chips, never by the fill —
 * the documented status yellow sits below 3:1 on a light surface.
 */
export function LcpChart({ sites }: { sites: Measured[] }) {
  const [hover, setHover] = useState<string | null>(null)
  const ranked = [...sites].sort((a, b) => b.lcp - a.lcp)
  const max = Math.max(...ranked.map((s) => s.lcp))
  const pct = (v: number) => `${(v / max) * 100}%`

  return (
    <figure className="m-0">
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="relative">
          {/* Overlay mirrors a row's column widths so the threshold lands on the
              same scale as the bars without measuring the DOM. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex gap-3 px-1">
            <span className={`${NAME_COL} shrink-0`} />
            <span className="relative flex-1">
              <span
                className="absolute inset-y-0 border-l border-dashed border-accent"
                style={{ left: pct(LCP_GOOD) }}
              />
            </span>
            <span className={`${VALUE_COL} shrink-0`} />
          </div>

          <ul className="space-y-1.5">
            {ranked.map((s) => {
              const on = hover === s.name
              return (
                <li
                  key={s.name}
                  className="relative flex items-center gap-3 rounded-md px-1 py-0.5 transition-colors hover:bg-raised"
                  onMouseEnter={() => setHover(s.name)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className={`${NAME_COL} shrink-0 truncate text-xs text-muted sm:text-sm`} title={s.name}>
                    {s.name}
                  </span>

                  <span className="relative h-5 flex-1">
                    <span
                      className="absolute inset-y-0 left-0 rounded-r-[4px] bg-series"
                      style={{ width: pct(s.lcp), filter: on ? "brightness(1.18)" : undefined }}
                    />
                  </span>

                  <span className={`${VALUE_COL} shrink-0 text-right font-mono text-xs tabular-nums text-ink`}>
                    {seconds(s.lcp)}
                  </span>

                  {on ? (
                    <span className="pointer-events-none absolute left-28 top-0 z-20 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-raised px-3 py-1.5 text-xs shadow-lg sm:left-44">
                      <span className="font-medium text-ink">{s.name}</span>
                      <span className="ml-2 text-muted">
                        {seconds(s.lcp)} · {megabytes(s.bytes ?? 0)} · {s.requests != null ? Math.round(s.requests) : "—"} requests ·{" "}
                        {VERDICT_LABEL[verdict(s.lcp)]}
                      </span>
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-xs text-faint">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-3 border-l border-dashed border-accent" />
            Core Web Vitals target, {seconds(LCP_GOOD)}
          </span>
          <span>Largest Contentful Paint, median of 3 runs</span>
        </div>
      </div>
      <figcaption className="mt-3 text-xs text-faint">
        Lower is better. The full numbers are in the table below.
      </figcaption>
    </figure>
  )
}
