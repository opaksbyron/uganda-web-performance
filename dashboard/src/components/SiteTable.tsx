import { useMemo, useState } from "react"
import type { Measured } from "../data/types"
import { CATEGORY_LABEL, VERDICT_LABEL, verdict } from "../data/types"

type Key = "name" | "category" | "score" | "lcp" | "bytes" | "requests"

const COLUMNS: { key: Key; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Site" },
  { key: "category", label: "Category" },
  { key: "score", label: "Score", numeric: true },
  { key: "lcp", label: "LCP", numeric: true },
  { key: "bytes", label: "Weight", numeric: true },
  { key: "requests", label: "Requests", numeric: true },
]

const CHIP: Record<string, string> = {
  good: "text-good",
  warning: "text-warning",
  critical: "text-critical",
}

/** The table view the charts are checked against, and the accessible fallback. */
export function SiteTable({ sites }: { sites: Measured[] }) {
  const [sort, setSort] = useState<{ key: Key; dir: "asc" | "desc" }>({ key: "lcp", dir: "desc" })

  const rows = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1
    return [...sites].sort((a, b) => {
      const x = a[sort.key] as string | number | undefined
      const y = b[sort.key] as string | number | undefined
      if (typeof x === "string" && typeof y === "string") return x.localeCompare(y) * dir
      return (((x as number) ?? 0) - ((y as number) ?? 0)) * dir
    })
  }, [sites, sort])

  const toggle = (key: Key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }))

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">
          Measured sites with performance score, largest contentful paint, page weight and request count.
        </caption>
        <thead>
          <tr className="border-b border-line">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                className={`px-4 py-3 font-medium ${c.numeric ? "text-right" : "text-left"}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(c.key)}
                  className="text-xs uppercase tracking-wider text-faint transition-colors hover:text-ink"
                >
                  {c.label}
                  <span aria-hidden="true" className="ml-1">
                    {sort.key === c.key ? (sort.dir === "asc" ? "↑" : "↓") : ""}
                  </span>
                </button>
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-faint">
              Verdict
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const v = verdict(s.lcp)
            return (
              <tr key={s.name} className="border-b border-line last:border-0 hover:bg-raised">
                <td className="px-4 py-3">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-ink transition-colors hover:text-accent"
                  >
                    {s.name}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted">{CATEGORY_LABEL[s.category]}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">{Math.round(s.score)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">{(s.lcp / 1000).toFixed(1)}s</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">
                  {s.bytes ? (s.bytes / 1_048_576).toFixed(1) : "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">
                  {s.requests != null ? Math.round(s.requests) : "—"}
                </td>
                <td className={`px-4 py-3 text-xs font-medium ${CHIP[v]}`}>{VERDICT_LABEL[v]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
