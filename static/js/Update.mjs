import { Scatterplot } from "./Scatterplot.mjs";
import { scatterplots } from "./store.mjs";
import { Histogram } from "./Histogram.mjs";
import { Heatmap } from "./Heatmap.mjs";

let title,
    init,
    perp,
    iter,
    lr,
    nNeighbors,
    minDist,
    sc;

async function addTsne() {
  if (scatterplots.length() > 9) {
    alert("Cannot exceed 10 samples");
    return;
  }

  if (scatterplots.length() == 0) {
    title = d3.select("#dataTitle").property("value");
  } else if (title != d3.select("#dataTitle").property("value")) {
    alert("Cannot use more than one data");
    return;
  }

  init = d3.select("#init").property("value");
  perp = d3.select("#perp").property("value");
  iter = d3.select("#iter").property("value");
  lr = d3.select("#lr").property("value");

  sc = new Scatterplot(
    ".scatterplot-section",
    280,
    280,
    "t-SNE",
    { init: init, perp: perp, iter: iter, lr: lr }
  );
  scatterplots.append(sc)

  await d3
    .json(
      `http://127.0.0.1:50001/tsne?` +
        `title=${title}` +
        `&init=${init}` +
        `&perp=${perp}` +
        `&iter=${iter}` +
        `&lr=${lr}`
    )
    .then((data) => {
      scatterplots.update(sc, data);
    });
}

async function addUmap() {
  if (scatterplots.length() > 9) {
    alert("Cannot exceed 10 samples");
    return;
  }
  if (title == null) {
    title = d3.select("#dataTitle").property("value");
  } else if (title != d3.select("#dataTitle").property("value")) {
    alert("Cannot use more than one data");
    return;
  }

  nNeighbors = d3.select("#nNeighbors").property("value");
  minDist = d3.select("#minDist").property("value");

  sc = new Scatterplot(
    ".scatterplot-section",
    280,
    280,
    "UMAP",
    { n_neighbors: nNeighbors, min_dist: minDist}
  );
  scatterplots.append(sc)

  await d3
    .json(
      `http://127.0.0.1:50001/umap?` +
        `title=${title}` +
        `&nNeighbors=${nNeighbors}` +
        `&minDist=${minDist}`
    )
    .then((data) => {
      scatterplots.update(sc, data);
    });
}

async function ensembleDR(){
  await d3
    .json(`http://127.0.0.1:50001/ensembleDR`)
    .then((fsm) => {
      console.log(fsm);
    });
}

export { addTsne, addUmap, ensembleDR };

// let boxes,
//     settings = [],
//     title,
//     initialization,
//     perplexity,
//     iteration,
//     learningRate,
//     nNeighbors,
//     minDist,
//     data = [],
//     frqSubG,
//     fsm,
//     pMax, pMin,
//     init = true;

// async function Run(){
//   await d3.json(`http://127.0.0.1:50001/ensembleDR?`
//                 + `title=${title}`
//                 + `&perp=${perplexity}`
//                 + `&iter=${iteration}`
//                 + `&lr=${learningRate}`
//                 + `&pca=${pcaIteration}`
//                 + `&random=${randomIteration}`
//                 )
//           .then((response)=>{
//                   fsm = response.FSM;
//                   frqSubG = response.FSM[0].FS.sort((a,b)=> b.length - a.length);
//                   response.DR.forEach((d, i)=>{
//                     data[i] = d.embedding;
//                 })})

//   pMax = data[0][0]["0"];
//   pMin = data[0][0]["0"];

//   data.forEach((datum)=>{
//     datum.forEach((d)=>{
//       pMax = pMax < d["0"] ? d["0"] : pMax;
//       pMin = pMin > d["0"] ? d["0"] : pMin;
//       pMax = pMax < d["1"] ? d["1"] : pMax;
//       pMin = pMin > d["1"] ? d["1"] : pMin;
//     })
//   })
//   drawScatterplot();
//   drawHistorgram();
//   drawHeatmap();
// }

// function Update(DR) {
//   /*
//     Take title and hyperparameters
//     -> update url and data
//   */
//   if(settings.length==0){
//     title=d3.select("#dataTitle").property("value");
//   }
//   else if(title != d3.select("#dataTitle").property("value")){
//     alert("Cannot contain more than one data");
//     return;
//   }

//   if(settings.length > 9){
//     alert("Cannot exceed 10");
//     return;
//   }

//   d3.selectAll(".box")
//     .filter((d,i)=> i == settings.length)
//     .classed("chacked", true);

//   if(DR=='tsne'){
//     initialization = d3.select("#init").property("value");
//     perplexity = d3.select("#perplexity").property("value");
//     iteration = d3.select("#iteration").property("value");
//     learningRate = d3.select("#learningRate").property("value");
//     settings.push(
//       {
//         "DR":"tsne",
//         "init": initialization,
//         "perp":perplexity,
//         "iter": iteration,
//         "lr":learningRate
//       }
//     )
//   }
//   else{
//     nNeighbors = d3.select("#nNeighbors").property("value");
//     minDist = d3.select("#minDist").property("value");
//     settings.push(
//       {
//         "DR":"umap",
//         "nNeighbors":nNeighbors,
//         "minDist":minDist
//       }
//     )
//   }

//   console.log(settings);
// }

// let scatterplots =[],
//     histogram,
//     heatmap;

// function drawScatterplot() {
//   if(init){
//     scatterplots = data.map((_, i) => new Scatterplot(`#scatterplot${i}`, 260, 260));

//     scatterplots.forEach(sc => sc.initialize());

//     scatterplots.forEach(sc => {
//       sc.on("brush", (brushedIndex) => {
//         scatterplots.forEach(sc2 =>{
//           sc2.updateBrushSet(brushedIndex);
//         });
//       });
//     });
//   }
//   scatterplots.forEach((sc,i) =>{
//     sc.update(data[i], pMax, pMin);
//     sc.updateFrqSubG(frqSubG);
//   })
// }

// function drawHistorgram(){
//   if(init){
//     histogram = new Histogram('#histogram', 400, 450);
//     histogram.initialize();
//   }
//   histogram.update(frqSubG);
// }

// function drawHeatmap(){
//   if(init){
//     init=false;
//     heatmap = new Heatmap('#heatmap', 280, 280);
//     heatmap.initialize();
//     heatmap.on("click", (k,ms)=>{
//       updateFS(k, ms);
//     })
//   }
//   heatmap.update(fsm);
// }

// async function updateFS(k, ms){
//   fsm.forEach((d)=>{
//     if(d['k']== k && d['min_support']==ms){
//       frqSubG = d['FS'].sort((a,b)=> b.length - a.length);
//     }
//   })
//   await scatterplots.forEach((sc)=>{
//     sc.updateFrqSubG(frqSubG);
//   })
//   await histogram.update(frqSubG);
//   console.log('bbb')
// }

// function Reset() {
//   scatterplots.forEach((sc) => sc.resetBrush());
// }

// function ChangeMode(mode){
//   if(init) return;

//   scatterplots.forEach((sc)=>{
//     sc.changeMode(mode);
//   })
// }

// export { Update, Reset, ChangeMode, Run };
