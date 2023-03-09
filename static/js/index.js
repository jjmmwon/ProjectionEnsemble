import { ensembleDR } from "./embedElements.mjs";

function main() {
  d3.select("#runBtn").on("click", ensembleDR);
}

main();