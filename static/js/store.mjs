import { Heatmap } from './elements/Heatmap.mjs';
import { Sankey } from './elements/Sankey.mjs';
import { Scatterplot } from './elements/Scatterplot.mjs';

let embeddingView = {
    scatterplots: [],
    brushedSet: new Set(),
    add(id, method, hyperparams, embedding, fsmResult) {
        let sc = new Scatterplot(
            id,
            '.scatterplot-section',
            290,
            290,
            method,
            hyperparams,
            this.brushedSet
        );

        sc.initialize()
            .on('brush', (brushedSet) => {
                this.brushedSet.clear();
                brushedSet.forEach((d) => this.brushedSet.add(d));
                this.scatterplots.forEach((sc2) => {
                    sc2.highlightBrushed();
                    if (sc !== sc2) sc2.hideBrush();
                });
            })
            .update(embedding, fsmResult)
            .drawContour(5, 8);

        this.scatterplots.push(sc);

        return sc;
    },

    updateContour(k = 5, min_support = 8) {
        this.scatterplots.forEach((sc) => {
            sc.drawContour(k, min_support);
        });
    },

    length() {
        return this.scatterplots.length;
    },
};

let fsView = {
    sankey: new Sankey('#fsView', 270, 350),

    add(data) {
        this.sankey.initialize(data).update();
    },
    update(k, ms) {
        this.sankey.update(k, ms);
    },

    reset() {
        this.sankey.div.remove();
    },
};

let heatmapView = {
    heatmap: new Heatmap('#heatmap', 250, 250),

    add(fsmResult) {
        this.heatmap
            .initialize()
            .update(fsmResult)
            .on('click', (ms, k) => {
                embeddingView.updateContour(k, ms);
                fsView.update(k, ms);
            });
    },

    reset() {
        this.heatmap.div.remove();
    },
};

export { embeddingView, fsView, heatmapView };
