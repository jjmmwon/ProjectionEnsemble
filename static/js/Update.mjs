import { Scatterplot } from "./Scatterplot.mjs";
//import { url } from "./url.mjs";
//import { ResultTable } from "./Table.mjs";
//import { Procrustes } from "./Procrustes.mjs";

let title, perp, iter, lr, pca, random, minSup, resultTable;
let init = true;

const dataTitle = document.getElementById("dataTitle");
const pcaIter = document.getElementById("pcaIter");
const randIter = document.getElementById("randIter");
const perplexity = document.getElementById("perplexity");
const iteration = document.getElementById("iteration");
const learningRate = document.getElementById("learningRate");
const minSupport = document.getElementById("minSupport");

//resultTable = new ResultTable("#result-table");

let data, frqSubG;

async function Update() {
  /*
    Take title and hyperparameters
    -> update url and data
  */
  
  title = dataTitle.options[dataTitle.selectedIndex].value;
  perp = perplexity.value;
  iter = iteration.value;
  lr = learningRate.value;
  pca = pcaIter.value;
  random = randIter.value;
  minSup = minSupport.value;

  let url = `http://127.0.0.1:50001/ensembleDR?title=${title}&perp=${perp}&iter=${iter}&lr=${lr}&pca=${pca}&random=${random}&min_sup=${minSup}`;

  console.log(url);

  await dataLoad(url)
    
  drawScatterplot();
  frequentSubgraph(frqSubG, minSup);  
 
  // let x = new XMLHttpRequest("sdfsdfdsf");
  // x.onload = function(data) {}
  // x.send();

//   $.ajax({
//     url: "sdfsdfds",
//     success: function() {
//       $.ajax({
//         url: "dasdfsdf",
//         success: function() {
// //          $.ajax()
//         }
//       })
//     }
//   })
  // abc;

  
  // Promise
  // d3.json("url")
  //   .then(() => d3.json("asdf"))
  //   .then(() => (dfdf ? d3.json("sdf") : d3.json(w))
  //   .then(() => {
  //   }) 

  // async await

  // data = await d3.json("url");
  // data2 = await d3.json("asdf");
  
  // data3 = await d3.json("sdf");
    


  console.log("data", data);
  console.log("frqSubG", frqSubG);
}

let scatterplot, brushedIndex;

function drawScatterplot() {
  scatterplot = [];
  let size = 480;
  
  // for(let i=0;i<data.length;i++){
  //   scatterplot[i] = new Scatterplot(
  //     `#scatterplot${i}`,
  //     data[i],
  //     size,
  //     size
  //   );
  //   scatterplot[i].initialize();
  //   scatterplot[i].on("brush", (brushedItems) => {
  //     brushedIndex = new Set(brushedItems.map((d) => d[""]));
  //     brushOccured(brushedIndex);
  //   });  
  //   initScatterplot(scatterplot);
  // }

  scatterplot = data.map((d, i) => new Scatterplot(
      `#scatterplot${i}`,
      d,
      size,
      size
  ))
 

  scatterplot.forEach(sc => sc.initialize());

  scatterplot.forEach(sc => {
    sc.on("brush", (brushedItems) => {
      brushedIndex = new Set(brushedItems.map((d) => d[""]));
      brushOccured(brushedIndex);
    });  
  });

  initScatterplot(scatterplot);
}

function initScatterplot(scatterplot) {
  scatterplot.forEach((d) => d.selectionUpdate());
}

function brushOccured(brushedIndex) {
  scatterplot.forEach((d) => d.brushUpdate(brushedIndex));
}

function dataLoad(url) {
  data = [];
  return d3.json(url).then((d)=>{
    console.log(d);
    console.log(d["FSM"]);
    frqSubG = d.FSM;
    console.log(frqSubG);
    for(let i=0; i < d["DR"].length; i++){
      data[i] = d["DR"][i];
      // data[i][""] = d["DR"][i]["Embeddings"]["idx"];
      // data[i]["0"] = d["DR"][i]["Embeddings"]["0"];
      // data[i]["1"] = d["DR"][i]["Embeddings"]["1"];
      // data[i]["class"] = d["DR"][i]["Embeddings"]["class"];
    }
  })
}

function frequentSubgraph(frqSubG, minSup) {
  frqSubG.forEach((d)=>{
    if(d["Min_support"]==minSup){
      if(d["FS"].length > 10){
        d["FS"].sort((a,b) =>{
          return b.length - a.length;
        });
      }
      scatterplot.forEach((s)=>{
        s.frequentSubgraphUpdate(d["FS"]);
      })
    }
  })
}

function Reset() {
  scatterplot.forEach((d) => d.brushReset());
}

export { Update, Reset };
