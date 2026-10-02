import { useState } from "react"
import type { Measured } from "../data/types"
import { megabytes, pearson, seconds } from "../data/stats"

const W = 640
const H = 300
const PAD = { top: 16, right: 16, bottom: 36, left: 46 }

/** Page weight against load time. One series, so no legend: the title names it. */
export function WeightScatter({ sites }: { sites: Measured[] }) {
  const [hover, setHover] = useState<Measured | null>(null)
  const pts = sites.filter((s) => typeof s.bytes === "number" && s.bytes > 0)
  if (pts.length < 3) return null

  const maxMb = Math.max(...pts.map((s) => (s.bytes as number) / 1_048_576)) * 1.08
  const maxS = Math.max(...pts.map((s) => s.lcp / 1000)) * 1.08

  const x = (mb: number) => PAD.left + (mb / maxMb) * (W - PAD.left - PAD.right)
  const y = (s: number) => H - PAD.bottom - (s / maxS) * (H - PAD.top - PAD.bottom)

  const r = pearson(pts.map((s) => s.bytes as number), pts.map((s) => s.lcp))
  const xTicks = Array.from({ length: 5 }, (_, i) => (maxMb / 4) * i)
  const yTicks = Array.from({ length: 5 }, (_, i) => (maxS / 4) * i)

  return (
    <figure className="m-0">
      <div className="overflow-x-auto rounded-xl border border-line bg-surface p-5 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img"
             aria-label="Scatter plot of page weight in megabytes against largest contentful paint in seconds">
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeWidth="1" />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-[var(--faint)] text-[10px]">
                {t.toFixed(0)}s
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={`x${t}`} x={x(t)} y={H - PAD.bottom + 16} textAnchor="middle"
                  className="fill-[var(--faint)] text-[10px]">
              {t.toFixed(0)}MB
            </text>
          ))}
          <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom}
                stroke="var(--axis)" strokeWidth="1" />

          {pts.map((s) => {
            const on = hover?.name === s.name
            return (
              <circle
                key={s.name}
                cx={x((s.bytes as number) / 1_048_576)}
                cy={y(s.lcp / 1000)}
                r={on ? 7 : 5}
                fill="var(--series)"
                stroke="var(--surface)"
                strokeWidth="2"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${s.name}: ${megabytes(s.bytes as number)}, ${seconds(s.lcp)}`}</title>
              </circle>
            )
          })}
        </svg>

        <p className="mt-3 border-t border-line pt-3 text-xs text-faint">
          {hover ? (
            <span className="text-ink">
              {hover.name}: {megabytes(hover.bytes as number)}, {seconds(hover.lcp)}
            </span>
          ) : (
            <>
              Page weight vs load time, {pts.length} sites.
              {r != null ? ` Pearson r = ${r.toFixed(2)}.` : ""}
            </>
          )}
        </p>
      </div>
      <figcaption className="mt-3 text-xs text-faint">
        Correlation is not causation: a heavy page is usually slow, but a light page can still be slow
        if the server or the network is.
      </figcaption>
    </figure>
  )
}
