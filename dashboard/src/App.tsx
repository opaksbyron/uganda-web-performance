import raw from "./data/measurements.json"
import meta from "./data/meta.json"
import type { Site } from "./data/types"
import { LCP_GOOD } from "./data/types"
import { isMeasured, median, seconds } from "./data/stats"
import { CategoryChart } from "./components/CategoryChart"
import { LcpChart } from "./components/LcpChart"
import { Methodology } from "./components/Methodology"
import { Section } from "./components/Section"
import { SiteTable } from "./components/SiteTable"
import { StatTiles } from "./components/StatTiles"
import { ThemeToggle } from "./components/ThemeToggle"
import { WeightScatter } from "./components/WeightScatter"

const sites = raw as Site[]
const measured = sites.filter(isMeasured)
const failed = sites
  .filter((s) => s.status !== "ok")
  .map((s) => ({ name: s.name, url: s.url, reason: s.reason }))

const ug = measured.filter((s) => s.country === "UG")
const intl = measured.filter((s) => s.country === "INT")

const ugMedian = median(ug.map((s) => s.lcp))
const intlMedian = median(intl.map((s) => s.lcp))
const ratio = ugMedian && intlMedian ? ugMedian / intlMedian : null
const passing = ug.filter((s) => s.lcp <= LCP_GOOD).length
const weightMedian = median(ug.map((s) => s.bytes ?? 0).filter(Boolean))

const tiles = [
  { value: String(ug.length), label: "Ugandan sites measured", note: `${intl.length} international controls` },
  { value: ugMedian ? seconds(ugMedian) : "—", label: "Median load time, Uganda", note: "Largest Contentful Paint" },
  {
    value: ratio ? `${ratio.toFixed(1)}×` : "—",
    label: "Slower than the controls",
    note: intlMedian ? `controls median ${seconds(intlMedian)}` : undefined,
  },
  {
    value: `${passing} of ${ug.length}`,
    label: "Meet the 2.5s target",
    note: weightMedian ? `median page weight ${(weightMedian / 1_048_576).toFixed(1)} MB` : undefined,
  },
]

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
          <span className="font-mono text-sm text-muted">
            <span className="text-accent">UG</span> web performance
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-6">
        <div className="py-12 sm:py-16">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Uganda Web Performance Index
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            How long the country's government, banking and university websites take to load on a mobile
            connection, measured from Kampala against the same international benchmark everyone else is held to.
          </p>
          <p className="mt-4 font-mono text-xs text-faint">Measured {meta.runDate} · Lighthouse {meta.lighthouse}</p>

          <div className="mt-10">
            <StatTiles tiles={tiles} />
          </div>
        </div>

        <Section
          id="ranking"
          title="Every site, slowest first"
          lede="Largest Contentful Paint is the moment the main content finishes rendering. Google calls 2.5 seconds good and anything past 4 seconds poor."
        >
          <LcpChart sites={measured} />
        </Section>

        <Section id="categories" title="By sector" lede="Median load time within each group, and the international control group for scale.">
          <CategoryChart sites={measured} />
        </Section>

        <Section id="weight" title="Why they are slow" lede="The clearest single predictor is how many bytes a page ships.">
          <WeightScatter sites={measured} />
        </Section>

        <Section id="data" title="The data" lede="Sortable. Click any column heading. Every figure is the median of three runs.">
          <SiteTable sites={measured} />
        </Section>

        <Section id="method" title="Method">
          <Methodology runDate={meta.runDate} failed={failed} />
        </Section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm text-muted">
            Measurements, scripts and raw Lighthouse output are public.
          </p>
          <p className="mt-6 font-mono text-xs text-faint">
            © {new Date().getFullYear()} {meta.author}. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
