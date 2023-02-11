import { Scatterplot } from "./Scatterplot.mjs";
import { Histogram } from "./Histogram.mjs";

let title,
    perplexity,
    iteration,
    learningRate,
    pcaIteration,
    randomIteration,
    minSupport,
    data = [],
    frqSubG,
    pMax, pMin,
    init = true;

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
  //minSupport = d3.select("#minSupport").property("value");
  

  await d3.json(`http://127.0.0.1:50001/ensembleDR?`
                + `title=${title}`
                + `&perp=${perplexity}`
                + `&iter=${iteration}`
                + `&lr=${learningRate}`
                + `&pca=${pcaIteration}`
                + `&random=${randomIteration}`
                + `&min_sup=${8}`)
          .then((result)=>{
                  frqSubG = result.FSM[0].FS.sort((a,b)=> b.length - a.length);
                  console.log(frqSubG);
                  result.DR.forEach((d, i)=>{
                    data[i] = d.embedding;
                })})
  pMax = data[0][0]["0"];
  pMin = data[0][0]["0"];
  
  data.forEach((datum)=>{
    datum.forEach((d)=>{
      pMax = pMax < d["0"] ? d["0"] : pMax;
      pMin = pMin > d["0"] ? d["0"] : pMin;
      pMax = pMax < d["1"] ? d["1"] : pMax;
      pMin = pMin > d["1"] ? d["1"] : pMin;
    })
  })
  drawScatterplot();   
  drawHistorgram();
}

let scatterplot =[],
    histogram;

function drawScatterplot() {
  if(init){
    scatterplot = data.map((_, i) => new Scatterplot(`#scatterplot${i}`, 260, 260));

    scatterplot.forEach(sc => sc.initialize());

    scatterplot.forEach(sc => {
      sc.on("brush", (brushedIndex) => {
        scatterplot.forEach(sc2 =>{
          sc2.updateBrushSet(brushedIndex);
        });
      });
    });
  }
  scatterplot.forEach((sc,i) =>{
    sc.update(data[i], pMax, pMin, frqSubG);
  })
}

function drawHistorgram(){
  if(init){
    init=false;
    histogram = new Histogram('#histogram', 450, 500);
    histogram.initialize()
  }
  histogram.update(frqSubG);
}

function Reset() {
  scatterplot.forEach((sc) => sc.resetBrush());
}

function ChangeMode(mode){
  if(init) return;

  scatterplot.forEach((sc)=>{
    sc.changeMode(mode);
  })
}

export { Update, Reset, ChangeMode };
