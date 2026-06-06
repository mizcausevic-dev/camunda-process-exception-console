from __future__ import annotations

import json
from pathlib import Path


def _score(lane: dict) -> int:
    active = max(lane["activeInstances"], 1)
    incident_pressure = min((lane["openIncidents"] / active) * 200, 100)
    failed_job_pressure = min((lane["failedJobs"] / active) * 150, 100)
    overdue_pressure = min((lane["overdueTasks"] / active) * 100, 100)
    absolute_exception_pressure = min(
        lane["openIncidents"] * 2 + lane["failedJobs"] * 1.5 + lane["overdueTasks"] * 0.7,
        100,
    )
    age_pressure = min(lane["averageAgeHours"] / 2.4, 100)
    automation_gap = 100 - lane["automationCoverage"]
    evidence_gap = 100 - lane["evidenceCompleteness"]
    return round(
        incident_pressure * 0.20
        + failed_job_pressure * 0.16
        + absolute_exception_pressure * 0.18
        + lane["slaBreachRate"] * 0.18
        + overdue_pressure * 0.14
        + age_pressure * 0.12
        + automation_gap * 0.10
        + evidence_gap * 0.06
        + lane["businessImpact"] * 0.04
    )


def build_board_pack(path: str | Path) -> dict:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    lanes = sorted(
        ({**lane, "exceptionScore": _score(lane)} for lane in data["lanes"]),
        key=lambda lane: lane["exceptionScore"],
        reverse=True,
    )
    return {
        "organization": data["organization"],
        "highestRiskLane": lanes[0]["name"],
        "meanExceptionScore": round(sum(lane["exceptionScore"] for lane in lanes) / len(lanes)),
        "totalOpenIncidents": sum(lane["openIncidents"] for lane in lanes),
        "recommendedMove": f"Stabilize {lanes[0]['name']} before the next process review.",
    }
