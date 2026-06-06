# camunda-process-exception-console

Board-readable process exception console for Camunda lanes, BPMN incident backlog, failed jobs, SLA breach pressure, owner routing, and remediation posture.

[![ci](https://github.com/mizcausevic-dev/camunda-process-exception-console/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/camunda-process-exception-console/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/camunda-process-exception-console/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/camunda-process-exception-console/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

Camunda and BPMN estates often show technical incident counts, but executives need a cleaner answer:

- Which process lanes are aging into customer, compliance, or revenue risk?
- Which exceptions are ownerless, evidence-poor, or SLA-breaching?
- Which remediation packet should move before the next board or operating review?

This repo converts synthetic process telemetry into an exception ledger that leaders can read without opening an admin console.

## What it includes

- TypeScript scoring engine for process lanes and exception severity
- CLI renderer for markdown and JSON outputs
- Python board-pack helper for analyst workflows
- Static proof page for GitHub Pages
- Synthetic fixture only; no real tenant or workflow data
- CI, coverage, prerender, smoke checks, and Pages deploy workflow

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx camunda-process-exception-console fixtures/camunda-process-sample.json --format markdown
npx camunda-process-exception-console fixtures/camunda-process-sample.json --format json
```

## Data contract

Each lane tracks:

- active process instances
- open incidents
- failed jobs
- overdue tasks
- average exception age
- SLA breach rate
- automation coverage
- evidence completeness
- business impact
- owner, audience, narrative, and next action

## Kinetic Gain fit

This is a process-governance signal repo: it connects Camunda-style workflow operations to board-ready remediation sequencing. It supports Kinetic Gain's broader language, platform, and industry atlas by adding a BPMN/process-automation lane with concrete executive intelligence output.
