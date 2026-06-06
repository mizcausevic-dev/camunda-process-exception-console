#!/usr/bin/env node
import { loadLedger, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: camunda-process-exception-console <input.json> [--format markdown|json]");
  process.exit(1);
}

const ledger = await loadLedger(inputPath);

if (formatFlag === "--format" && format === "json") {
  console.log(JSON.stringify(ledger, null, 2));
} else {
  console.log(renderMarkdown(ledger));
}
