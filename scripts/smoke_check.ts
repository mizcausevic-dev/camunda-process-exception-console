import { readFile } from "node:fs/promises";

const html = await readFile("site/index.html", "utf8");
const markers = [
  "Camunda Process Exception Console",
  "Process exceptions become board-readable",
  "Quote-to-contract approvals",
  "Primary recommendation"
];

for (const marker of markers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing marker: ${marker}`);
  }
}

console.log("smoke ok");
