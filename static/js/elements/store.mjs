import { Heatmap } from './Heatmap.mjs';
import { Sankey } from './Sankey.mjs';
import { Scatterplot } from './Scatterplot.mjs';

let embeddingView = {
    scatterplots: [],
    brushedSet: new Set(),

    add(method, hyperparams, embedding, labelInfo, fsmResult, textureScale) {
        let sc = new Scatterplot(
            this.scatterplots.length,
            '.scatterplot-section',
            295,
            295,
            method,
            hyperparams,
            this.brushedSet,
            linkViews
        );

        sc.initialize()
            // .on('brush', (brushedSet) => {
            //     this.brushedSet.clear();
            //     brushedSet.forEach((d) => this.brushedSet.add(d));
            //     this.scatterplots.forEach((sc2) => {
            //         sc2.highlightBrushed();
            //         if (sc !== sc2) sc2.hideBrush();
            //     });
            // })
            .embedData(embedding, labelInfo, fsmResult, textureScale)
            .updateView('dualMode');

        this.scatterplots.push(sc);

        return sc;
    },

    hoverEvent(eventType, circleIndices = []) {
        if (eventType == 'mouseOver') {
            this.scatterplots.forEach((sc) => {
                sc.mouseOver(circleIndices);
            });
        } else {
            this.scatterplots.forEach((sc) => {
                sc.mouseOut();
            });
        }
    },

    updateView(mode) {
        this.scatterplots.forEach((sc) => {
            sc.updateView(mode);
        });
    },

    highlightFS(target) {
        this.scatterplots.forEach((sc) => {
            sc.highlightFS(target);
        });
    },

    highlightClass(target) {
        this.scatterplots.forEach((sc) => {
            sc.highlightClass(target);
        });
    },

    mouseOut() {
        this.scatterplots.forEach((sc) => {
            sc.mouseOut();
        });
    },

    length() {
        return this.scatterplots.length;
    },

    reset() {
        this.scatterplots.forEach((sc) => {
            sc.div.remove();
        });
        this.scatterplots = [];
        this.brushedSet.clear();
    },
};

let fsView = {
    sankey: new Sankey('#fsView', 280, 380),

    add(data, labelInfo, textureScale) {
        this.sankey
            .initialize(data, labelInfo, textureScale, linkViews)
            .update();
    },
    updateView() {
        this.sankey.update();
    },

    highlightFS(target) {
        this.sankey.highlightFS(target);
    },

    highlightClass(target) {
        this.sankey.highlightClass(target);
    },

    mouseOut() {
        this.sankey.mouseOut();
    },

    reset() {
        this.sankey.div.remove();
    },
};

let hyperparameterView = {
    heatmap: new Heatmap('#hpramView', 220, 220),

    add(fsmResult) {
        this.heatmap
            .initialize()
            .update(fsmResult)
            .on('click', (ms, k) => {
                d3.select('#kSelector').property('value', k);
                d3.select('#msSelector').property('value', ms);
                embeddingView.updateView();
                fsView.updateView();
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
    },
};

let textureScale = {
    textures: [
        textures.lines().thicker(),
        textures.lines().orientation('vertical').size(6).strokeWidth(1.5),
        textures.lines().orientation('horizontal').size(7).strokeWidth(2),
        textures.paths().d('crosses').thicker(),
        textures.paths().d('waves').thicker(),
        textures.paths().d('caps').thicker(),
        textures.paths().d('squares').thicker(),
        textures.lines().orientation('4/8').size(8).strokeWidth(3),
        textures
            .lines()
            .orientation('vertical')
            .stroke('white')
            .size(8)
            .strokeWidth(2)
            .background('rgb(160,160,160)'),
        textures
            .lines()
            .orientation('horizontal')
            .stroke('white')
            .size(8)
            .strokeWidth(2)
            .background('rgb(120,120,120)'),
    ],

    getTexture(i) {
        return this.textures[i];
    },
    length() {
        return this.textures.length;
    },
    callTextures(f) {
        this.textures.forEach((t) => f(t));
    },
};

async function ensembleDR(title, method) {
    let drResult, fsmResult;

    reset();

    await d3.json(`/v1/preset?title=${title}&method=${method}`).then((data) => {
        console.log(data);
        drResult = data.dr_results;
        fsmResult = data.fsm_results;

        labelInfo.add(drResult[0].embedding.map((e) => e.label));

        drResult.forEach((e) => {
            embeddingView.add(
                method,
                e.hyper_parameters,
                e.embedding,
                labelInfo,
                fsmResult,
                textureScale
            );
        });

        fsView.add(fsmResult, labelInfo, textureScale);
        hyperparameterView.add(fsmResult);
    });
}

function updateView(mode) {
    embeddingView.updateView(mode);
    fsView.updateView();
}

function reset() {
    if (!embeddingView.length()) return;
    embeddingView.reset();
    fsView.reset();
    hyperparameterView.reset();
}

function linkViews(eventType, target) {
    if (eventType == 'fsHover') {
        embeddingView.highlightFS(target);
        fsView.highlightFS(target);
    } else if (eventType == 'classHover') {
        embeddingView.highlightClass(target);
        fsView.highlightClass(target);
    } else if (eventType == 'mouseOut') {
        embeddingView.mouseOut();
        fsView.mouseOut();
    }
}

export { ensembleDR, updateView };
