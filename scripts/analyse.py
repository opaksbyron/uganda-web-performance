#!/usr/bin/env python3
"""Analyse measurements.csv and emit an HTML report for PDF rendering."""
import csv, math, statistics as st, html, datetime, sys

def load(p="results/measurements.csv"):
    rows=[]
    for r in csv.DictReader(open(p)):
        if r["status"]!="ok": rows.append(r); continue
        for k in ("score","fcp_ms","lcp_ms","tbt_ms","speed_index_ms","tti_ms","total_bytes","requests"):
            r[k]=float(r[k]) if r[k] not in ("","None") else None
        r["cls"]=float(r["cls"]) if r["cls"] not in ("","None") else None
        rows.append(r)
    return rows

def med(v): v=[x for x in v if x is not None]; return st.median(v) if v else None
def mean(v): v=[x for x in v if x is not None]; return st.fmean(v) if v else None

def pearson(xs, ys):
    p=[(x,y) for x,y in zip(xs,ys) if x is not None and y is not None]
    n=len(p)
    if n<3: return None,None,n
    sx=sum(x for x,_ in p); sy=sum(y for _,y in p)
    sxy=sum(x*y for x,y in p); sxx=sum(x*x for x,_ in p); syy=sum(y*y for _,y in p)
    den=math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy))
    if den==0: return None,None,n
    r=(n*sxy-sx*sy)/den
    return r, r*r, n

def fmt(v,d=0,suf=""):
    if v is None: return "—"
    return f"{v:,.{d}f}{suf}"

rows=load()
ok=[r for r in rows if r["status"]=="ok"]
failed=[r for r in rows if r["status"]!="ok"]
ug=[r for r in ok if r["country"]=="UG"]
intl=[r for r in ok if r["country"]=="INT"]
cats=["government","financial","university","control"]

def block(rs):
    return dict(n=len(rs), score=med([r["score"] for r in rs]),
        lcp=med([r["lcp_ms"] for r in rs]), fcp=med([r["fcp_ms"] for r in rs]),
        tbt=med([r["tbt_ms"] for r in rs]), si=med([r["speed_index_ms"] for r in rs]),
        bytes=med([r["total_bytes"] for r in rs]), req=med([r["requests"] for r in rs]))

r_bytes_lcp, r2_bytes_lcp, n_c = pearson([r["total_bytes"] for r in ug],[r["lcp_ms"] for r in ug])
r_req_lcp,   r2_req_lcp,   n_r = pearson([r["requests"] for r in ug],[r["lcp_ms"] for r in ug])

ugb, intb = block(ug), block(intl)
gap = (ugb["lcp"]/intb["lcp"]) if (ugb["lcp"] and intb["lcp"]) else None
passing = [r for r in ug if r["lcp_ms"] is not None and r["lcp_ms"]<=2500]

rowsr = "".join(
  f"<tr><td>{html.escape(r['name'].strip(chr(34)))}</td><td>{r['category']}</td>"
  f"<td class='n'>{fmt(r['score'])}</td><td class='n'>{fmt(r['lcp_ms'])}</td>"
  f"<td class='n'>{fmt(r['tbt_ms'])}</td><td class='n'>{fmt(r['total_bytes']/1024 if r['total_bytes'] else None)}</td>"
  f"<td class='n'>{fmt(r['requests'])}</td></tr>"
  for r in sorted(ok, key=lambda x:(x["category"], -(x["lcp_ms"] or 0))))

catrows = "".join(
  f"<tr><td>{c}</td><td class='n'>{block([r for r in ok if r['category']==c])['n']}</td>"
  + "".join(f"<td class='n'>{fmt(block([r for r in ok if r['category']==c])[k],1 if k=='score' else 0)}</td>"
            for k in ("score","lcp","fcp","tbt","si"))
  + f"<td class='n'>{fmt((block([r for r in ok if r['category']==c])['bytes'] or 0)/1024)}</td>"
    f"<td class='n'>{fmt(block([r for r in ok if r['category']==c])['req'])}</td></tr>"
  for c in cats)

failrows = "".join(f"<li><strong>{html.escape(r['name'].strip(chr(34)))}</strong> — {r['url']}</li>" for r in failed) or "<li>None</li>"

# scatter: bytes vs lcp
pts=[(r["total_bytes"]/1024, r["lcp_ms"], r["category"]) for r in ug if r["total_bytes"] and r["lcp_ms"]]
if pts:
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    x0,x1=0,max(xs)*1.08; y0,y1=0,max(ys)*1.08
    W,H,L,B,T,R=620,340,64,46,16,16
    px=lambda v: L+(v-x0)/(x1-x0)*(W-L-R); py=lambda v: H-B-(v-y0)/(y1-y0)*(H-T-B)
    colour={"government":"#1B5C63","financial":"#A8551C","university":"#4A5A78"}
    marks="".join(f'<circle cx="{px(x):.1f}" cy="{py(y):.1f}" r="4.5" fill="{colour.get(c,"#555")}" fill-opacity=".8"/>' for x,y,c in pts)
    xt=[round(x1*i/4) for i in range(5)]; yt=[round(y1*i/4) for i in range(5)]
    grid="".join(f'<line x1="{L}" y1="{py(v):.1f}" x2="{W-R}" y2="{py(v):.1f}" stroke="#D8E2E8"/>'
                 f'<text x="{L-8}" y="{py(v)+4:.1f}" text-anchor="end" font-size="9" fill="#7C8A98">{v:,.0f}</text>' for v in yt)
    grid+="".join(f'<line x1="{px(v):.1f}" y1="{T}" x2="{px(v):.1f}" y2="{H-B}" stroke="#D8E2E8"/>'
                  f'<text x="{px(v):.1f}" y="{H-B+16}" text-anchor="middle" font-size="9" fill="#7C8A98">{v:,.0f}</text>' for v in xt)
    scatter=(f'<svg viewBox="0 0 {W} {H}">{grid}{marks}'
             f'<text x="{(L+W-R)/2}" y="{H-6}" text-anchor="middle" font-size="10" fill="#4A5866">Total page weight (KB)</text>'
             f'<text transform="translate(14,{(T+H-B)/2}) rotate(-90)" text-anchor="middle" font-size="10" fill="#4A5866">LCP (ms)</text></svg>')
else: scatter="<p>Insufficient data to plot.</p>"

today=datetime.date.today().strftime("%d %B %Y")
open("results/report.html","w").write(f"""<!doctype html><meta charset="utf-8">
<title>Web Performance on Constrained Networks in Uganda</title>
<style>
 @page {{ size:A4; margin:16mm 15mm; }}
 body{{font-family:Georgia,'Times New Roman',serif;color:#131A22;line-height:1.45;font-size:10.2pt;margin:0}}
 h1{{font-size:17pt;margin:0 0 4px;line-height:1.15}}
 .sub{{color:#4A5866;font-size:9.4pt;margin:0 0 14px}}
 h2{{font-size:11.6pt;margin:16px 0 5px;border-bottom:1px solid #CFDDE7;padding-bottom:3px}}
 p{{margin:0 0 8px}}
 table{{border-collapse:collapse;width:100%;font-size:8.6pt;font-family:'Helvetica Neue',Arial,sans-serif}}
 th,td{{border:1px solid #CFDDE7;padding:3px 5px;text-align:left}}
 th{{background:#EEF4F7;font-size:7.6pt;text-transform:uppercase;letter-spacing:.05em;color:#4A5866}}
 td.n{{text-align:right;font-variant-numeric:tabular-nums}}
 .kpis{{display:flex;gap:8px;margin:10px 0}}
 .kpi{{flex:1;border:1px solid #CFDDE7;padding:7px 9px}}
 .kpi dt{{font-size:7.4pt;text-transform:uppercase;letter-spacing:.06em;color:#7C8A98;margin:0 0 2px}}
 .kpi dd{{margin:0;font-size:14pt;font-weight:bold;color:#A8551C;font-family:'Helvetica Neue',Arial,sans-serif}}
 svg{{width:100%;height:auto;border:1px solid #CFDDE7}}
 ul{{margin:4px 0 8px 18px;padding:0}} li{{margin:0 0 2px}}
 .note{{font-size:8.6pt;color:#4A5866;border-left:2px solid #A8551C;padding-left:8px;margin:8px 0}}
 footer{{margin-top:14px;padding-top:6px;border-top:1px solid #CFDDE7;font-size:7.6pt;color:#7C8A98}}
</style>
<h1>An Empirical Study of Web Performance on Constrained Networks in Uganda</h1>
<p class="sub">Measured {today} · Lighthouse {13} · Slow-3G profile (1.6 Mbps, 150 ms RTT, 4× CPU slowdown) · median of 3 runs per site · mobile form factor</p>

<h2>1 · Summary</h2>
<div class="kpis">
 <div class="kpi"><dt>Ugandan sites measured</dt><dd>{ugb['n']}</dd></div>
 <div class="kpi"><dt>Median LCP, Uganda</dt><dd>{fmt(ugb['lcp'])} ms</dd></div>
 <div class="kpi"><dt>Median LCP, controls</dt><dd>{fmt(intb['lcp'])} ms</dd></div>
 <div class="kpi"><dt>Meeting 2.5 s LCP</dt><dd>{len(passing)}/{ugb['n']}</dd></div>
</div>
<p>Ugandan sites recorded a median Largest Contentful Paint of <strong>{fmt(ugb['lcp'])} ms</strong> against
<strong>{fmt(intb['lcp'])} ms</strong> for international controls{f", a factor of <strong>{gap:.1f}×</strong>" if gap else ""}.
Median page weight was <strong>{fmt((ugb['bytes'] or 0)/1024)} KB</strong> across <strong>{fmt(ugb['req'])}</strong> requests,
compared with <strong>{fmt((intb['bytes'] or 0)/1024)} KB</strong> and <strong>{fmt(intb['req'])}</strong> for controls.
Only <strong>{len(passing)} of {ugb['n']}</strong> Ugandan sites met the 2.5-second LCP threshold Google treats as "good".</p>

<h2>2 · Results by category</h2>
<table><thead><tr><th>Category</th><th>n</th><th>Score</th><th>LCP ms</th><th>FCP ms</th><th>TBT ms</th><th>Speed Index</th><th>KB</th><th>Req</th></tr></thead>
<tbody>{catrows}</tbody></table>

<h2>3 · Page weight against load time</h2>
<p>Pearson correlation between total page weight and LCP across Ugandan sites:
<strong>r = {fmt(r_bytes_lcp,4)}</strong>, r² = <strong>{fmt(r2_bytes_lcp,4)}</strong> (n = {n_c}).
Between request count and LCP: r = <strong>{fmt(r_req_lcp,4)}</strong>, r² = <strong>{fmt(r2_req_lcp,4)}</strong> (n = {n_r}).</p>
{scatter}
<p class="note">If page weight explains only part of the variance, the remainder points to connection-level
costs — DNS resolution, redirect chains and TLS handshakes — consistent with Zaki et al.'s finding in Ghana
that these, not bandwidth, dominate web latency in the region.</p>

<h2>4 · Availability</h2>
<p>Sites that could not be measured at all:</p><ul>{failrows}</ul>

<h2>5 · Full results</h2>
<table><thead><tr><th>Site</th><th>Category</th><th>Score</th><th>LCP ms</th><th>TBT ms</th><th>KB</th><th>Req</th></tr></thead>
<tbody>{rowsr}</tbody></table>

<footer>Instrument: Lighthouse CLI, simulated throttling, headless Chrome. Median of 3 runs per site.
Raw JSON retained in results/raw/. Generated {today}.</footer>
""")
print("wrote results/report.html")
print(f"  UG median LCP {fmt(ugb['lcp'])} ms vs control {fmt(intb['lcp'])} ms")
print(f"  bytes~LCP r={fmt(r_bytes_lcp,4)} r2={fmt(r2_bytes_lcp,4)} n={n_c}")
