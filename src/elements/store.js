import { Heatmap } from './Heatmap.js';
import { Sankey } from './Sankey.js';
import { Scatterplot } from './Scatterplot.js';
import * as d3 from 'd3';
import textures from 'textures';
import Papa from 'papaparse';

let projectionsView,
    realtionView,
    hyperparameterView,
    eventHandlers,
    labelInfo,
    textureScale;

projectionsView = {
    scatterplots: [],
    brushedSet: new Set(),

    add(method, hyperparams, embedding, labelInfo, fsmResult, textureScale) {
        let sc = new Scatterplot(
            this.scatterplots.length,
            '.scatterplot-section',
            285,
            285,
            method,
            hyperparams,
            this.brushedSet,
            textureScale,
            eventHandlers
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
            .embedData(embedding, labelInfo, fsmResult)
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

realtionView = {
    sankey: new Sankey('#fsView', 280, 380),

    add(data, labelInfo, textureScale) {
        this.sankey
            .initialize(data, labelInfo, textureScale, eventHandlers)
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

hyperparameterView = {
    heatmap: new Heatmap('#hpramView', 240, 190),

    add(fsmResult) {
        this.heatmap
            .initialize(eventHandlers)
            .update(fsmResult)
            .highlightCell();
    },

    updateView() {
        this.heatmap.highlightCell();
    },

    reset() {
        this.heatmap.div.remove();
    },
};

eventHandlers = {
    clickCell: function (args) {
        d3.select('#kRange').property('value', args.k);
        d3.select('#msRange').property('value', args.ms);
        this.updateViews();
    },

    updateViews: function (mode) {
        projectionsView.updateView(mode);
        realtionView.updateView();
        hyperparameterView.updateView();
    },

    linkViews: function (eventType, target) {
        if (eventType == 'fsHover') {
            projectionsView.highlightFS(target);
            realtionView.highlightFS(target);
        } else if (eventType == 'classHover') {
            projectionsView.highlightClass(target);
            realtionView.highlightClass(target);
        } else if (eventType == 'mouseOut') {
            projectionsView.mouseOut();
            realtionView.mouseOut();
        }
    },
};

labelInfo = {
    labelSet: [],
    labels: [],

    add(labels) {
        this.labels = labels;
        this.labelSet = [...new Set(labels)];
    },
};

textureScale = {
    textures: [
        textures.paths().d('crosses').thicker(),
        textures.paths().d('waves').thicker(),
        textures.paths().d('caps').thicker(),
        textures.paths().d('squares').thicker(),

        textures.lines().thicker(),
        textures.lines().orientation('vertical').size(6).strokeWidth(1.5),
        textures.lines().orientation('horizontal').size(7).strokeWidth(2),
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

    remainders: textures
        .lines()
        .orientation('vertical', 'horizontal')
        .size(4)
        .strokeWidth(1)
        .shapeRendering('crispEdges'),

    getTexture(i) {
        return i == -1 ? this.remainders : this.textures[i];
    },
    length() {
        return this.textures.length;
    },
    callTextures(f) {
        this.textures.forEach((t) => f(t));
        f(this.remainders);
    },
};

async function ensembleDR(title, method) {
    let drResult, fsmResult;

    reset();

    await d3
        .json(
            `http://localhost:50008/v1/preset?title=${title}&method=${method}`
        )
        .then((data) => {
            console.log(data);
            drResult = data.dr_results;
            fsmResult = data.fsm_results;

            drResult.forEach((dr) => {
                dr.embedding = Papa.parse(dr.embedding, { header: true }).data;
            });
            console.log(drResult);

            labelInfo.add(drResult[0].embedding.map((e) => e.l));

            drResult.forEach((e) => {
                projectionsView.add(
                    method,
                    e.hprams,
                    e.embedding,
                    labelInfo,
                    fsmResult,
                    textureScale
                );
            });

            realtionView.add(fsmResult, labelInfo, textureScale);
            hyperparameterView.add(fsmResult);
        });
}

function reset() {
    if (!projectionsView.length()) return;
    projectionsView.reset();
    realtionView.reset();
    hyperparameterView.reset();
}

export { ensembleDR, eventHandlers };
