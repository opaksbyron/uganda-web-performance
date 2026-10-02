# Uganda Web Performance Index

How long Uganda's government, banking and university websites take to load on a
mobile connection, measured from Kampala against an international control group.

**Dashboard:** https://opaksbyron.github.io/uganda-web-performance

Everything here is reproducible: the site list, the measurement script, the raw
Lighthouse output for every run, and the dashboard that reads it.

## Findings

Measured 2 October 2026. 35 sites, 32 measured, 3 could not be loaded.

| | Uganda (n=27) | International controls (n=5) |
|---|---|---|
| Median load time (LCP) | **19.2s** | 3.6s |
| Median page weight | 5.7 MB | 1.6 MB |
| Median Lighthouse score | 44 | 73 |
| Meeting the 2.5s target | **0 of 27** | 1 of 5 |

**No Ugandan site in the sample reaches the Core Web Vitals target.** The fastest
is NIRA at 5.1 seconds, which is still twice the threshold. The Ugandan median is
5.4× the control median.

By sector, median load time: government 12.7s (n=8), banking and telecom 19.1s
(n=9), universities 20.2s (n=10).

**Page weight is the clearest predictor** (Pearson r between bytes and LCP across
the Ugandan sample is positive and strong). The three heaviest homepages are
Busitema University at 61.2 MB, Kabale University at 34.1 MB, and Bank of Uganda
at 17.7 MB. For scale, GOV.UK serves its homepage in 0.19 MB and renders in 1.8
seconds under the same throttling — Busitema ships 323 times the bytes.

**Three sites could not be measured**, each because the browser refused to load
them:

- **Post Bank Uganda** — expired TLS certificate (`ERR_CERT_DATE_INVALID`).
  Visitors see a full-page security warning.
- **Ministry of Health** — security interstitial; the host also returned no
  response to a plain HTTP request.
- **State House Uganda** — security interstitial; the edge returned HTTP 526,
  an invalid certificate on the origin.

These are reported as observed on the measurement date. Certificates expire and
get renewed; this is a snapshot, not a standing claim.

## Why

Core Web Vitals set one bar for the whole web. Most published performance data is
gathered in places with fast networks and recent phones, so it is easy to assume
the bar is being cleared. This measures a sample that is rarely measured, under
conditions closer to how it is actually used, and publishes the raw numbers.

## Method

| | |
|---|---|
| Tool | Google Lighthouse 13.4.1, performance category only |
| Form factor | Mobile, with screen emulation |
| Throttling | 150ms RTT, 1.6 Mbps down, 4× CPU slowdown (Lighthouse simulated) |
| Runs per site | 3, median reported |
| Measured from | Kampala, Uganda |

Three runs matter: a single Lighthouse run varies by 10 to 20 percent on the same
page, so one run is not a measurement.

Throttling is simulated rather than live, which makes sites comparable to each
other under identical conditions. It is not a claim about what any individual
visitor experiences.

## Sample

35 sites in four groups, listed in [`sites.csv`](sites.csv):

- **Government** (10) — ministries, revenue, statistics, police, judiciary
- **Banking & telecom** (10) — the largest retail banks and mobile operators
- **University** (10) — the largest public and private universities
- **International control** (5) — well-optimised sites, for scale

The control group is the point. Without it, a 12 second load is just a number.

## Reproduce

```bash
npm install
node scripts/measure.mjs --runs 3            # full sweep, writes results/
node scripts/measure.mjs --runs 3 --resume   # continue an interrupted sweep
node scripts/measure.mjs --only government --limit 3   # a quick subset

node scripts/compress-raw.mjs                # gzip the per-run output
node scripts/sync-dashboard.mjs              # publish results to the dashboard
cd dashboard && npm install && npm run build
```

A full sweep takes several hours. Results are flushed after every site, so an
interrupted run keeps everything measured so far and `--resume` picks up where it
stopped.

## Files

| Path | What it is |
|---|---|
| `sites.csv` | The sample, with category and country |
| `scripts/measure.mjs` | The sweep: Lighthouse, 3 runs, median |
| `scripts/rebuild-from-raw.mjs` | Re-derive the table from `results/raw` |
| `scripts/compress-raw.mjs` | Gzip the per-run output before publishing |
| `scripts/sync-dashboard.mjs` | Copy results into the dashboard and stamp the date |
| `scripts/analyse.py` | Static HTML report with correlations |
| `results/measurements.json` | One row per site, the medians |
| `results/measurements.csv` | The same, as a spreadsheet |
| `results/raw/` | Every individual Lighthouse run, gzipped and otherwise unmodified |
| `dashboard/` | The published dashboard (React, TypeScript, Vite) |

## Limitations

Read these before quoting a number.

- **Simulated throttling, not a real connection.** Sites are comparable to each
  other, not to a stopwatch held in Kampala.
- **One location, one point in time.** No CDN-edge variation, no time-of-day
  effects, no repeat-visit caching.
- **Lab data, not field data.** Lighthouse measures a cold load of one page. It
  does not capture what real users experience across a session.
- **Homepages only.** A fast homepage can front a slow application.
- **A site that failed to load is reported as failed**, without inference about
  why. Causes vary: TLS interstitials, geoblocking, timeouts, or being down at
  that moment.

## License

Code MIT. Measurements published under CC BY 4.0 — use them, cite the source.
