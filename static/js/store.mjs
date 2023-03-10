import { Heatmap } from "./elements/Heatmap.mjs";
import { Sankey } from "./elements/Sankey.mjs";
import { Scatterplot } from "./elements/Scatterplot.mjs";


let embeddingView = {
  scatterplots: [],
  brushedSet: new Set(),
  add(id, method, params, embedding) {
    let sc = new Scatterplot(
      id,
      ".scatterplot-section",
      290,
      290,
      method,
      params,
      this.brushedSet
    );

    sc.initialize()
      .on("brush", (brushedSet) => {
        this.brushedSet.clear();
        brushedSet.forEach((d)=>this.brushedSet.add(d));        
        this.scatterplots.forEach((sc2) => {
          sc2.highlightBrushed();
          if(sc !== sc2) sc2.hideBrush();
        });
      })
      .update(embedding);
      
    this.scatterplots.push(sc);

    sc.delBtn.on("click", () => {
      sc.div.remove();
      this.scatterplots.forEach((d, i) =>
        d == sc ? this.scatterplots.splice(i, 1) : null
      );
    });

    return sc;
  },

  update(fsm){
    this.scatterplots.forEach((sc)=>{
      sc.drawFS(fsm);
    })
  },

  length() {
    return this.scatterplots.length;
  },
};

let fsView = {
  sankey: new Sankey(".fsView", 280, 300),

  update(data, k, ms) {
    this.sankey
      .initialize()
      .update(data, k,  ms);
  },

  reset() {
    this.sankey.div.remove();
  },
};

let heatmap = {
  heatmap: new Heatmap(".heatmap", 250, 250),

  update(fsm) {
    this.heatmap
      .initialize()
      .update(fsm)
      .on("click", (k, ms) => {});
  },

  reset() {
    this.heatmap.div.remove();
  },
};

export { embeddingView, fsView, heatmap };
