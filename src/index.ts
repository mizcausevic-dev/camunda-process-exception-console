import { readFile } from "node:fs/promises";

export type ProcessSeverity = "LOW" | "WATCH" | "ELEVATED" | "CRITICAL";

export interface ProcessLane {
  name: string;
  owner: string;
  audience: string;
  processKey: string;
  activeInstances: number;
  openIncidents: number;
  failedJobs: number;
  overdueTasks: number;
  averageAgeHours: number;
  slaBreachRate: number;
  automationCoverage: number;
  evidenceCompleteness: number;
  businessImpact: number;
  narrative: string;
  nextAction: string;
}

export interface ProcessInput {
  generatedAt: string;
  organization: string;
  reviewWindowDays: number;
  lanes: ProcessLane[];
}

export interface ScoredProcessLane extends ProcessLane {
  exceptionScore: number;
  severity: ProcessSeverity;
  boardSignal: string;
}

export interface ProcessLedger {
  generatedAt: string;
  organization: string;
  reviewWindowDays: number;
  lanes: ScoredProcessLane[];
  summary: {
    laneCount: number;
    criticalCount: number;
    highestRiskLane: string;
    meanExceptionScore: number;
    totalOpenIncidents: number;
    totalOverdueTasks: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifySeverity(score: number): ProcessSeverity {
  if (score >= 80) return "CRITICAL";
  if (score >= 65) return "ELEVATED";
  if (score >= 45) return "WATCH";
  return "LOW";
}

export function scoreLane(lane: ProcessLane): ScoredProcessLane {
  const incidentPressure = clamp((lane.openIncidents / Math.max(lane.activeInstances, 1)) * 100 * 2);
  const failedJobPressure = clamp((lane.failedJobs / Math.max(lane.activeInstances, 1)) * 100 * 1.5);
  const agePressure = clamp(lane.averageAgeHours / 2.4);
  const overduePressure = clamp((lane.overdueTasks / Math.max(lane.activeInstances, 1)) * 100);
  const absoluteExceptionPressure = clamp(lane.openIncidents * 2 + lane.failedJobs * 1.5 + lane.overdueTasks * 0.7);
  const automationGap = 100 - lane.automationCoverage;
  const evidenceGap = 100 - lane.evidenceCompleteness;
  const exceptionScore = Math.round(
    clamp(
      incidentPressure * 0.2 +
        failedJobPressure * 0.16 +
        absoluteExceptionPressure * 0.18 +
        lane.slaBreachRate * 0.18 +
        overduePressure * 0.14 +
        agePressure * 0.12 +
        automationGap * 0.1 +
        evidenceGap * 0.06 +
        lane.businessImpact * 0.04
    )
  );

  const severity = classifySeverity(exceptionScore);
  const boardSignal =
    severity === "CRITICAL"
      ? "Board-visible process risk: customer or regulated workflow outcomes can miss commitments without immediate owner action."
      : severity === "ELEVATED"
        ? "Escalation-ready process risk: incident backlog and SLA pressure need a named remediation packet."
        : severity === "WATCH"
          ? "Watchlist process risk: exception pressure is visible enough to track before the next review."
          : "Controlled process lane: current exception pressure is within operating tolerance.";

  return {
    ...lane,
    exceptionScore,
    severity,
    boardSignal
  };
}

export function buildLedger(input: ProcessInput): ProcessLedger {
  const lanes = input.lanes.map(scoreLane).sort((a, b) => b.exceptionScore - a.exceptionScore);
  const meanExceptionScore = Math.round(lanes.reduce((sum, lane) => sum + lane.exceptionScore, 0) / Math.max(lanes.length, 1));
  const totalOpenIncidents = lanes.reduce((sum, lane) => sum + lane.openIncidents, 0);
  const totalOverdueTasks = lanes.reduce((sum, lane) => sum + lane.overdueTasks, 0);
  const highestRiskLane = lanes[0]?.name ?? "No lanes";
  const criticalCount = lanes.filter((lane) => lane.severity === "CRITICAL").length;
  const primaryRecommendation =
    criticalCount > 0
      ? `Stabilize ${highestRiskLane} first, then clear incident evidence and SLA breach drivers before the next operating review.`
      : `Keep ${highestRiskLane} on the weekly process-risk review until exception score drops below 45.`;

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    reviewWindowDays: input.reviewWindowDays,
    lanes,
    summary: {
      laneCount: lanes.length,
      criticalCount,
      highestRiskLane,
      meanExceptionScore,
      totalOpenIncidents,
      totalOverdueTasks,
      primaryRecommendation
    }
  };
}

export async function loadLedger(path: string): Promise<ProcessLedger> {
  const raw = await readFile(path, "utf8");
  return buildLedger(JSON.parse(raw) as ProcessInput);
}

export function renderMarkdown(ledger: ProcessLedger): string {
  const rows = ledger.lanes
    .map(
      (lane) =>
        `| ${lane.name} | ${lane.severity} | ${lane.exceptionScore} | ${lane.openIncidents} | ${lane.slaBreachRate}% | ${lane.nextAction} |`
    )
    .join("\n");

  return [
    `# Camunda Process Exception Console`,
    ``,
    `Organization: ${ledger.organization}`,
    `Review window: ${ledger.reviewWindowDays} days`,
    ``,
    `Primary recommendation: ${ledger.summary.primaryRecommendation}`,
    ``,
    `| Lane | Severity | Exception score | Open incidents | SLA breach rate | Next action |`,
    `| --- | --- | ---: | ---: | ---: | --- |`,
    rows
  ].join("\n");
}
