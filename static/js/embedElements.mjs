import { embeddingView, fsView, heatmap } from "./store.mjs";

let title,
    method,
    data;

async function ensembleDR(){
  title = d3.select("#dataTitle").property("value");
  method = d3.select("#method").property("value");
  await d3
    .json(`http://127.0.0.1:50001/ensembleDR?`
      + `title=${title}`
      + `&method=${method}`
    )
    .then((response) => {
      data = response;
    });
    console.log(data)
}

function addEmbedding() {
  checkEmbeddingView()

  method = d3.select("#method").property("value");
  if(method.indexOf("tsne")){
    init = d3.select("#init").property("value");
    perp = d3.select("#perp").property("value");
    iter = d3.select("#iter").property("value");
    lr = d3.select("#lr").property("value");
    embeddingView.add(method, {title, init, perp, iter, lr}).request(i);
  } 
  else{
    nNeighbors = d3.select("#nNeighbors").property("value");
    minDist = d3.select("#minDist").property("value");
    embeddingView.add(method, {title, nNeighbors, minDist}).request(i);    
  }
}

export { ensembleDR };