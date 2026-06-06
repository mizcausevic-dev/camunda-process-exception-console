import { mkdir, writeFile } from "node:fs/promises";
import { buildLedger } from "../src/index.js";
import sample from "../fixtures/camunda-process-sample.json" with { type: "json" };

const ledger = buildLedger(sample);
const laneCards = ledger.lanes
  .map(
    (lane) => `
      <article class="lane">
        <div class="lane-top">
          <span>${lane.severity}</span>
          <strong>${lane.exceptionScore}</strong>
        </div>
        <h3>${lane.name}</h3>
        <p>${lane.narrative}</p>
        <dl>
          <div><dt>Owner</dt><dd>${lane.owner}</dd></div>
          <div><dt>Open incidents</dt><dd>${lane.openIncidents}</dd></div>
          <div><dt>SLA breach</dt><dd>${lane.slaBreachRate}%</dd></div>
          <div><dt>Evidence</dt><dd>${lane.evidenceCompleteness}%</dd></div>
        </dl>
        <p class="action">${lane.nextAction}</p>
      </article>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Camunda Process Exception Console</title>
  <meta name="description" content="Board-readable Camunda process exception posture for incidents, SLA breach pressure, ownership drift, and remediation sequencing." />
  <style>
    :root {
      color-scheme: dark;
      --bg: #050914;
      --panel: #0c1726;
      --panel-2: #101c2e;
      --line: rgba(89, 241, 211, 0.24);
      --text: #f4f1e8;
      --muted: #aab6c8;
      --cyan: #28ddf2;
      --mint: #55f2bc;
      --violet: #a98cff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, rgba(40,221,242,0.14), transparent 36rem),
        radial-gradient(circle at bottom right, rgba(169,140,255,0.16), transparent 32rem),
        var(--bg);
      color: var(--text);
      font-family: "Segoe UI", system-ui, sans-serif;
    }
    main { width: min(1160px, calc(100vw - 32px)); margin: 0 auto; padding: 64px 0; }
    .hero {
      border: 1px solid var(--line);
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(16,28,46,0.94), rgba(8,13,26,0.94));
      padding: clamp(28px, 5vw, 56px);
      box-shadow: 0 30px 90px rgba(0,0,0,0.32);
    }
    .eyebrow { color: var(--mint); letter-spacing: .18em; text-transform: uppercase; font: 700 12px/1 ui-monospace, SFMono-Regular, Consolas, monospace; }
    h1 { max-width: 900px; margin: 18px 0; font-size: clamp(44px, 8vw, 104px); line-height: .92; letter-spacing: -.06em; }
    .lede { max-width: 760px; color: var(--muted); font-size: clamp(18px, 2.2vw, 24px); line-height: 1.55; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 34px; }
    .metric { border: 1px solid rgba(255,255,255,.09); border-radius: 18px; background: rgba(255,255,255,.04); padding: 20px; }
    .metric strong { display: block; font-size: 34px; }
    .metric span { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .12em; }
    .section { margin-top: 28px; border: 1px solid var(--line); border-radius: 26px; background: rgba(12,23,38,.74); padding: clamp(22px, 3vw, 34px); }
    h2 { margin: 0 0 18px; font-size: clamp(30px, 4vw, 54px); line-height: 1; letter-spacing: -.04em; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .lane { border: 1px solid rgba(255,255,255,.1); border-radius: 20px; background: var(--panel-2); padding: 22px; }
    .lane-top { display: flex; justify-content: space-between; color: var(--cyan); font: 700 12px/1 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .14em; }
    .lane-top strong { color: var(--mint); font-size: 28px; letter-spacing: 0; }
    h3 { margin: 16px 0 10px; font-size: 24px; line-height: 1.08; }
    p { color: var(--muted); line-height: 1.55; }
    dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 18px 0; }
    dt { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .1em; }
    dd { margin: 4px 0 0; font-weight: 800; }
    .action { color: var(--text); border-top: 1px solid rgba(255,255,255,.08); padding-top: 14px; }
    footer { color: var(--muted); padding: 24px 0 0; font-size: 14px; }
    @media (max-width: 760px) {
      main { padding: 28px 0; }
      .metrics, .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">Camunda process control</div>
      <h1>Process exceptions become board-readable before they become operating drag.</h1>
      <p class="lede">Camunda Process Exception Console turns BPMN incident backlog, failed jobs, SLA breach pressure, and evidence gaps into one owner-routed remediation posture.</p>
      <div class="metrics">
        <div class="metric"><strong>${ledger.summary.laneCount}</strong><span>Process lanes</span></div>
        <div class="metric"><strong>${ledger.summary.meanExceptionScore}</strong><span>Mean exception score</span></div>
        <div class="metric"><strong>${ledger.summary.totalOpenIncidents}</strong><span>Open incidents</span></div>
        <div class="metric"><strong>${ledger.summary.totalOverdueTasks}</strong><span>Overdue tasks</span></div>
      </div>
    </section>
    <section class="section">
      <h2>Exception register</h2>
      <p><strong>Primary recommendation:</strong> ${ledger.summary.primaryRecommendation}</p>
      <div class="grid">${laneCards}</div>
    </section>
    <footer>Camunda Process Exception Console · synthetic proof surface · no tenant data</footer>
  </main>
</body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
