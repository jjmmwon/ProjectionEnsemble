import { Heatmap } from "./Heatmap.mjs";
import { Histogram } from "./Histogram.mjs";

let scatterplots = {
  scatterplot: [],

  append(sc) {
    sc.initialize()
      .on("brush", (brushedIndex) => {
        this.scatterplot.forEach((sc2) => {
          sc2.updateBrushSet(brushedIndex, new Set());
        });
      })
    this.scatterplot.push(sc);

    sc.delBtn.on("click", () => {
      sc.div.remove();
      this.scatterplot.forEach((d, i) =>
        d == sc ? this.scatterplot.splice(i, 1) : null
      );
    });
  },

  update(sc, data) {
    sc.update(data);
  },

  reset() {
    this.scatterplot.forEach((sc) => {
      sc.div.remove();
    });
    this.scatterplot = [];
  },

  length() {
    return this.scatterplot.length;
  },
};

let fsview = {
  histogram: new Histogram(".fsView-section", 280, 300),

  update(data) {
    this.histogram.initialize().update(data);
  },

  reset() {
    this.histogram.div.remove();
  },
};

let heatmap = {
  heatmap: new Heatmap(".heatmap-section", 250, 250),

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

export { scatterplots, fsview, heatmap };
