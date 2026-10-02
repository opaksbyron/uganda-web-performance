export type Category = "government" | "financial" | "university" | "control"

/** One site, as written by scripts/measure.mjs: the median of its runs. */
export type Site = {
  category: Category
  country: "UG" | "INT"
  name: string
  url: string
  status: "ok" | "failed"
  n?: number
  score?: number
  fcp?: number
  lcp?: number
  tbt?: number
  cls?: number
  si?: number
  tti?: number
  bytes?: number
  requests?: number
  /** Why a site could not be measured. Reported as observed. */
  reason?: string
}

export type Measured = Site & { status: "ok"; lcp: number; score: number }

/** Core Web Vitals thresholds for Largest Contentful Paint, in milliseconds. */
export const LCP_GOOD = 2500
export const LCP_POOR = 4000

export type Verdict = "good" | "warning" | "critical"

export function verdict(lcp: number): Verdict {
  if (lcp <= LCP_GOOD) return "good"
  if (lcp <= LCP_POOR) return "warning"
  return "critical"
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  good: "Good",
  warning: "Needs improvement",
  critical: "Poor",
}

export const CATEGORY_LABEL: Record<Category, string> = {
  government: "Government",
  financial: "Banking & telecom",
  university: "University",
  control: "International control",
}
