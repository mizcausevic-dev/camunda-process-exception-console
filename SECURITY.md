# Security

Do not commit real Camunda exports, BPMN tenant IDs, process instance IDs, worker credentials, ticket IDs, customer identifiers, authorization tokens, screenshots from production consoles, or incident payloads.

Use the synthetic fixture shape in `fixtures/camunda-process-sample.json` when demonstrating the project publicly.

If this is adapted for live use, load real telemetry only through a private ingestion path and publish aggregated board-pack output.
