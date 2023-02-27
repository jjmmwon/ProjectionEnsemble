import { addTsne, addUmap, ensembleDR, reset } from "./Update.mjs";
import { scatterplots } from "./store.mjs";

function main() {
  d3.select("#tsneAdd").on("click", addTsne);
  d3.select("#umapAdd").on("click", addUmap);
  d3.select("#runBtn").on("click", ensembleDR);
  d3.select("#resetBtn").on("click", reset);
}

main();