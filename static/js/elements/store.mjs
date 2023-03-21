import { Heatmap } from './Heatmap.mjs';
import { Sankey } from './Sankey.mjs';
import { Scatterplot } from './Scatterplot.mjs';

let embeddingView = {
    scatterplots: [],
    brushedSet: new Set(),
    add(
        id,
        method,
        hyperparams,
        embedding,
        labelInfo,
        fsmResult,
        textureScale
    ) {
        let sc = new Scatterplot(
            id,
            '.scatterplot-section',
            295,
            295,
            method,
            hyperparams,
            this.brushedSet,
            this.hoverEvent.bind(this)
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
            .update(embedding, labelInfo, fsmResult, textureScale)
            .changeMode('dualMode');

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
                console.log('mouseOut');
                sc.mouseOut();
            });
        }
    },

    updateHyperparams() {
        this.scatterplots.forEach((sc) => {
            sc.updateHyperparams();
        });
    },

    changeMode(mode) {
        this.scatterplots.forEach((sc) => {
            sc.changeMode(mode);
        });
    },

    length() {
        return this.scatterplots.length;
    },
};

let fsView = {
    sankey: new Sankey('#fsView', 280, 380),

    add(data, labelInfo, textureScale) {
        this.sankey.initialize(data, labelInfo, textureScale).update();
    },
    update() {
        this.sankey.update();
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
                embeddingView.updateHyperparams();
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
    },
};

let textureScale = {
    textures1: [
        textures.lines().thicker(),
        textures.lines().orientation('vertical').size(8).strokeWidth(1),
        textures.lines().orientation('6/8').thicker(),
        textures.lines().orientation('horizontal').size(8).strokeWidth(1.5),
        textures.paths().d('caps').thicker(),
        textures.paths().d('waves').thicker(),
        textures.paths().d('woven').thicker(),
        textures.paths().d('crosses').thicker(),
        textures.paths().d('hexagons').size(4).strokeWidth(1.5),
        textures.paths().d('squares').size(6).strokeWidth(1),

        textures.lines().thicker().background('rgb(190,190,190)'),
        textures
            .lines()
            .orientation('vertical')
            .size(8)
            .strokeWidth(1)
            .background('rgb(190,190,190)'),
        textures
            .lines()
            .orientation('6/8')
            .thicker()
            .background('rgb(190,190,190)'),
        textures
            .lines()
            .orientation('horizontal')
            .size(8)
            .strokeWidth(1.5)
            .background('rgb(190,190,190)'),
        textures.paths().d('caps').thicker().background('rgb(190,190,190)'),
        textures.paths().d('waves').thicker().background('rgb(190,190,190)'),
        textures.paths().d('woven').thicker().background('rgb(190,190,190)'),
        textures.paths().d('crosses').thicker().background('rgb(190,190,190)'),
        textures
            .paths()
            .d('hexagons')
            .size(4)
            .strokeWidth(1.5)
            .background('rgb(190,190,190)'),
        textures
            .paths()
            .d('squares')
            .size(6)
            .strokeWidth(1)
            .background('rgb(190,190,190)'),

        textures.lines().thicker().background('rgb(100,100,100)'),
        textures
            .lines()
            .orientation('vertical')
            .size(8)
            .strokeWidth(1)
            .background('rgb(100,100,100)'),
        textures
            .lines()
            .orientation('6/8')
            .thicker()
            .background('rgb(100,100,100)'),
        textures
            .lines()
            .orientation('horizontal')
            .size(8)
            .strokeWidth(1.5)
            .background('rgb(100,100,100)'),
        textures.paths().d('caps').thicker().background('rgb(100,100,100)'),
        textures.paths().d('waves').thicker().background('rgb(100,100,100)'),
        textures.paths().d('woven').thicker().background('rgb(100,100,100)'),
        textures.paths().d('crosses').thicker().background('rgb(100,100,100)'),
        textures
            .paths()
            .d('hexagons')
            .size(4)
            .strokeWidth(1.5)
            .background('rgb(100,100,100)'),
        textures
            .paths()
            .d('squares')
            .size(6)
            .strokeWidth(1)
            .background('rgb(100,100,100)'),
    ],

    texture2: [
        textures.lines().background('rgb(255,255,255)'),
        textures
            .lines()
            .orientation('vertical')
            .strokeWidth(2)
            .shapeRendering('crispEdges')
            .background('rgb(255,255,255)'),
        textures.paths().d('waves').thicker().background('rgb(255,255,255)'),
        textures
            .paths()
            .d('crosses')
            .lighter()
            .thicker()
            .background('rgb(255,255,255)'),
        textures
            .paths()
            .d('hexagons')
            .size(4)
            .strokeWidth(2)
            .background('rgb(255,255,255)'),
        textures.lines().orientation('3/8').background('rgb(255,255,255)'),
        textures.lines().size(4).strokeWidth(1).background('rgb(255,255,255)'),
        textures
            .lines()
            .orientation('vertical', 'horizontal')
            .size(3)
            .strokeWidth(1)
            .shapeRendering('crispEdges')
            .background('rgb(255,255,255)'),
        textures
            .paths()
            .d('caps')
            .lighter()
            .thicker()
            .background('rgb(255,255,255)'),
        textures.paths().d('squares').background('rgb(255,255,255)'),

        textures.lines().background('rgb(220,220,220)'),
        textures
            .lines()
            .orientation('vertical')
            .strokeWidth(2)
            .shapeRendering('crispEdges')
            .background('rgb(220,220,220)'),
        textures.paths().d('waves').thicker().background('rgb(220,220,220)'),
        textures
            .paths()
            .d('crosses')
            .lighter()
            .thicker()
            .background('rgb(220,220,220)'),
        textures
            .paths()
            .d('hexagons')
            .size(4)
            .strokeWidth(2)
            .background('rgb(220,220,220)'),
        textures.lines().orientation('3/8').background('rgb(220,220,220)'),
        textures.lines().size(4).strokeWidth(1).background('rgb(220,220,220)'),
        textures
            .lines()
            .orientation('vertical', 'horizontal')
            .size(3)
            .strokeWidth(1)
            .shapeRendering('crispEdges')
            .background('rgb(220,220,220)'),
        textures
            .paths()
            .d('caps')
            .lighter()
            .thicker()
            .background('rgb(220,220,220)'),
        textures.paths().d('squares').background('rgb(220,220,220)'),

        textures.lines().background('rgb(140,140,140)'),
        textures
            .lines()
            .orientation('vertical')
            .strokeWidth(2)
            .shapeRendering('crispEdges')
            .background('rgb(140,140,140)'),
        textures.paths().d('waves').thicker().background('rgb(140,140,140)'),
        textures
            .paths()
            .d('crosses')
            .lighter()
            .thicker()
            .background('rgb(140,140,140)'),
        textures
            .paths()
            .d('hexagons')
            .size(4)
            .strokeWidth(2)
            .background('rgb(140,140,140)'),
        textures.lines().orientation('3/8').background('rgb(140,140,140)'),
        textures.lines().size(4).strokeWidth(1).background('rgb(140,140,140)'),
        textures
            .lines()
            .orientation('vertical', 'horizontal')
            .size(3)
            .strokeWidth(1)
            .shapeRendering('crispEdges')
            .background('rgb(140,140,140)'),
        textures
            .paths()
            .d('caps')
            .lighter()
            .thicker()
            .background('rgb(140,140,140)'),
        textures.paths().d('squares').background('rgb(140,140,140)'),
    ],

    getTexture(i) {
        return this.textures1[i];
    },
    length() {
        return this.textures1.length;
    },
    callTextures(f) {
        this.textures1.forEach((t) => f(t));
    },
};

export { embeddingView, fsView, hyperparameterView, labelInfo, textureScale };
