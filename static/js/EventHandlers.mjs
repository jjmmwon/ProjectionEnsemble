import { embeddingView, fsview, heatmap } from "./store.mjs";

let title,
    method,
    init,
    perp,
    iter,
    lr,
    nNeighbors,
    minDist;

function changeMethod(){
  method = d3.select("#method").property("value");
  if(method=="t-SNE"){
    d3.select(".UMAP")
      .transition()
      .style("display", "none");
    d3.select(".t-SNE")
      .transition()
      .style("display", "");
  }
  else{
    d3.select(".t-SNE")
      .transition()
      .style("display", "none");
    d3.select(".UMAP")
      .transition()
      .style("display", "");
  }
}

async function addEmbedding(i) {
  checkEmbeddingView()

  method = d3.select("#method").property("value");
  if(method == "t-SNE"){
    init = d3.select("#init").property("value");
    perp = d3.select("#perp").property("value");
    iter = d3.select("#iter").property("value");
    lr = d3.select("#lr").property("value");
    await embeddingView.add(method, {title, init, perp, iter, lr}).request(i);
  } 
  else{
    nNeighbors = d3.select("#nNeighbors").property("value");
    minDist = d3.select("#minDist").property("value");
    await embeddingView.add(method, {title, nNeighbors, minDist}).request(i);    
  }
}

async function ensembleDR(){
  await d3
    .json(`http://127.0.0.1:50001/ensembleDR`)
    .then((fsm) => {
      embeddingView.update(fsm);
      fsview.update(fsm);
      heatmap.update(fsm.FSM);
    });
}

function reset(){ 
  embeddingView.reset();
  fsview.reset();
  heatmap.reset();
}

function checkEmbeddingView(){
  if (embeddingView.length() > 9) {
    alert("Cannot exceed 10 samples");
    return;
  }

  if (embeddingView.length() == 0) {
    title = d3.select("#dataTitle").property("value");
  }
  else if (title != d3.select("#dataTitle").property("value")) {
    alert("Cannot use more than one data");
    return;
  }
}

export { changeMethod, addEmbedding, ensembleDR, reset };