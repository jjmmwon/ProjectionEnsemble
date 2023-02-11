import { Update, Reset, ChangeMode } from "./Update.mjs";

function main() {
  d3.select("#runBtn").on("click", Update);
  d3.select("#resetBtn").on("click", Reset);
  d3.select("#classMode").on("click",()=> ChangeMode("class"));
  d3.select("#FSMode").on("click",()=> ChangeMode("FS"));
}

main();
