import { Scatterplot } from "./Scatterplot.mjs";
import { Histogram } from "./Histogram.mjs";
import { Heatmap } from "./Heatmap.mjs";

let title,
    perplexity,
    iteration,
    learningRate,
    pcaIteration,
    randomIteration,
    data = [],
    frqSubG,
    fsm,
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
  

  await d3.json(`http://127.0.0.1:50001/ensembleDR?`
                + `title=${title}`
                + `&perp=${perplexity}`
                + `&iter=${iteration}`
                + `&lr=${learningRate}`
                + `&pca=${pcaIteration}`
                + `&random=${randomIteration}`
                )
          .then((response)=>{
                  fsm = response.FSM;
                  frqSubG = response.FSM[0].FS.sort((a,b)=> b.length - a.length);
                  response.DR.forEach((d, i)=>{
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
  drawHeatmap();
}

let scatterplots =[],
    histogram,
    heatmap;

function drawScatterplot() {
  if(init){
    scatterplots = data.map((_, i) => new Scatterplot(`#scatterplot${i}`, 260, 260));

    scatterplots.forEach(sc => sc.initialize());

    scatterplots.forEach(sc => {
      sc.on("brush", (brushedIndex) => {
        scatterplots.forEach(sc2 =>{
          sc2.updateBrushSet(brushedIndex);
        });
      });
    });
  }
  scatterplots.forEach((sc,i) =>{
    sc.update(data[i], pMax, pMin);
    sc.updateFrqSubG(frqSubG);
  })
}

function drawHistorgram(){
  if(init){
    histogram = new Histogram('#histogram', 400, 450);
    histogram.initialize();
  }
  histogram.update(frqSubG);
}

function drawHeatmap(){
  if(init){
    init=false;
    heatmap = new Heatmap('#heatmap', 280, 280);
    heatmap.initialize();
    heatmap.on("click", (k,ms)=>{
      updateFS(k, ms);
    })
  }
  heatmap.update(fsm);  
}

async function updateFS(k, ms){
  fsm.forEach((d)=>{
    if(d['k']== k && d['min_support']==ms){
      frqSubG = d['FS'].sort((a,b)=> b.length - a.length);
    }
  })
  await scatterplots.forEach((sc)=>{
    sc.updateFrqSubG(frqSubG);
  })
  await histogram.update(frqSubG);
  console.log('bbb')
}

function Reset() {
  scatterplots.forEach((sc) => sc.resetBrush());
}

function ChangeMode(mode){
  if(init) return;

  scatterplots.forEach((sc)=>{
    sc.changeMode(mode);
  })
}

export { Update, Reset, ChangeMode };
