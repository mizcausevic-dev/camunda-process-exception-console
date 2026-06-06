import { describe, expect, it } from "vitest";
import sample from "../fixtures/camunda-process-sample.json" with { type: "json" };
import { buildLedger, classifySeverity, renderMarkdown, scoreLane } from "../src/index.js";

describe("camunda process exception scoring", () => {
  it("classifies severity by score threshold", () => {
    expect(classifySeverity(88)).toBe("CRITICAL");
    expect(classifySeverity(72)).toBe("ELEVATED");
    expect(classifySeverity(52)).toBe("WATCH");
    expect(classifySeverity(22)).toBe("LOW");
  });

  it("scores lanes with exception pressure and evidence gaps", () => {
    const lane = scoreLane(sample.lanes[0]);
    expect(lane.exceptionScore).toBeGreaterThan(45);
    expect(lane.boardSignal).toContain("process risk");
  });

  it("builds a sorted board ledger", () => {
    const ledger = buildLedger(sample);
    expect(ledger.summary.laneCount).toBe(5);
    expect(ledger.lanes[0].exceptionScore).toBeGreaterThanOrEqual(ledger.lanes[1].exceptionScore);
    expect(ledger.summary.primaryRecommendation).toContain(ledger.summary.highestRiskLane);
  });

  it("renders markdown table output", () => {
    const markdown = renderMarkdown(buildLedger(sample));
    expect(markdown).toContain("| Lane | Severity | Exception score |");
    expect(markdown).toContain("Quote-to-contract approvals");
  });
});
