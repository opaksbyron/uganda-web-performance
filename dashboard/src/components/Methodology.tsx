export function Methodology({
  runDate,
  failed,
}: {
  runDate: string
  failed: { name: string; url: string; reason?: string }[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 text-sm leading-relaxed text-muted">
        <p>
          Every site is measured with Google Lighthouse {" "}
          <span className="font-mono text-xs text-ink">13.4.1</span> on a mobile form factor, under a fixed
          throttling profile: 150ms round-trip time, 1.6 Mbps down, and a 4× CPU slowdown. That profile stands
          in for a mid-range Android phone on a typical mobile connection, which is how most people in Uganda
          reach these sites.
        </p>
        <p>
          Each site is loaded three times and the median is reported. Single Lighthouse runs vary by 10 to 20
          percent on the same page, so one run is not a measurement.
        </p>
        <p>
          Measurements were taken from Kampala on {runDate}. Network conditions are simulated rather than
          live, so the figures are comparable to each other, not a claim about any one visitor's experience.
        </p>
        <p>
          The international control group exists so the Ugandan numbers have something to mean. Without it,
          a 12 second load is just a number.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink">What the metrics mean</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-mono text-xs text-accent">LCP</dt>
              <dd className="text-muted">
                Largest Contentful Paint: when the main content finishes rendering. Google's threshold for
                "good" is 2.5 seconds, and "poor" begins at 4 seconds.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">Score</dt>
              <dd className="text-muted">Lighthouse's own performance score out of 100.</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">Weight</dt>
              <dd className="text-muted">Total bytes transferred to load the page once.</dd>
            </div>
          </dl>
        </div>

        {failed.length ? (
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="text-sm font-semibold text-ink">Could not be measured</h3>
            <p className="mt-2 text-sm text-muted">
              These sites did not return a usable page during the run. That is reported as observed, without
              inference about the cause.
            </p>
            <ul className="mt-3 space-y-3">
              {failed.map((f) => (
                <li key={f.name} className="text-sm">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-ink transition-colors hover:text-accent"
                  >
                    {f.name}
                  </a>
                  {f.reason ? <p className="mt-0.5 text-xs leading-snug text-muted">{f.reason}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
