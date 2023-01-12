import { Update, Reset } from "./Update.mjs";

function main() {
  d3.select("#runBtn").on("click", Update);
  d3.select("#resetBtn").on("click", Reset);
}

main();
