import { Scatterplot } from "./Scatterplot.mjs";
//import { url } from "./url.mjs";
//import { ResultTable } from "./Table.mjs";
//import { Procrustes } from "./Procrustes.mjs";

let title,
    perplexity,
    iteration,
    learningRate,
    pcaIteration,
    randomIteration,
    minSupport,
    data = [],
    frqSubG;

async function Update() {
  /*
    Take title and hyperparameters
    -> update url and data
  */
  
  title = d3.select("#dataTitle").property("value");
  perplexity = d3.select("#perplexity").property("value");
  iteration = d3.select("#iteration").property("value");
  learningRate = d3.select("#learningRate").property("value");
  pcaIteration = d3.select("#pcaIter").property("value");
  randomIteration = d3.select("#randIter").property("value");
  minSupport = d3.select("#minSupport").property("value");

  let url = 

  await d3.json(`http://127.0.0.1:50001/ensembleDR?`
                + `title=${title}`
                + `&perp=${perp}`
                + `&iter=${iter}`
                + `&lr=${lr}`
                + `&pca=${pca}`
                + `&random=${random}`
                + `&min_sup=${minSup}`)
          .then((d)=>{
                  frqSubG = d.FSM;
                for(let i=0; i < d["DR"].length; i++){
                  data[i] = d["DR"][i];
                  // data[i][""] = d["DR"][i]["Embeddings"]["idx"];
                  // data[i]["0"] = d["DR"][i]["Embeddings"]["0"];
                  // data[i]["1"] = d["DR"][i]["Embeddings"]["1"];
                  // data[i]["class"] = d["DR"][i]["Embeddings"]["class"];
                }})
    
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
