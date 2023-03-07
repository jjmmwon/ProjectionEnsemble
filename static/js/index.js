import { changeMethod, addEmbedding, ensembleDR, reset } from "./EventHandlers.mjs";

function main() {
  for(let i=0; i<10; i++){
    addEmbedding(i);
  }
  d3.select("#method").on("change", changeMethod);
  d3.select("#addBtn").on("click", addEmbedding);
  d3.select("#runBtn").on("click", ensembleDR);
  d3.select("#resetBtn").on("click", reset);
}

main();