import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "python"))

from camunda_process_exception import build_board_pack


def test_board_pack_prioritizes_highest_risk_lane():
    pack = build_board_pack(ROOT / "fixtures" / "camunda-process-sample.json")

    assert pack["organization"] == "Kinetic Gain synthetic process estate"
    assert pack["highestRiskLane"] == "Quote-to-contract approvals"
    assert pack["totalOpenIncidents"] > 0
    assert "Stabilize" in pack["recommendedMove"]
