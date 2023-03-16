import { Heatmap } from './elements/Heatmap.mjs';
import { Sankey } from './elements/Sankey.mjs';
import { Scatterplot } from './elements/Scatterplot.mjs';

let embeddingView = {
    scatterplots: [],
    brushedSet: new Set(),
    add(id, method, hyperparams, embedding, labelInfo, fsmResult) {
        let sc = new Scatterplot(
            id,
            '.scatterplot-section',
            295,
            295,
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
            .update(embedding, labelInfo, fsmResult)
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
    sankey: new Sankey('#fsView', 280, 380),

    add(data, labelInfo) {
        this.sankey.initialize(data, labelInfo).update();
    },
    update(k, ms) {
        this.sankey.update(k, ms);
    },

    reset() {
        this.sankey.div.remove();
    },
};

let hyperparameterView = {
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

let labelInfo = {
    labelSet: [],
    labels: [],
    add(labels) {
        this.labels = labels;
        this.labelSet = [...new Set(labels)];
        this.labelSet.sort((a, b) => {
            return (
                this.labels.filter((c) => c == b).length -
                this.labels.filter((c) => c == a).length
            );
        });
    },
};

export { embeddingView, fsView, hyperparameterView, labelInfo };
