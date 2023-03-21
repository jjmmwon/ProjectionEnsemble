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
                console.log('mouseOut');
                sc.mouseOut();
            });
        }
    },

    updateView(mode) {
        this.scatterplots.forEach((sc) => {
            sc.updateView(mode);
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
        this.sankey.initialize(data, labelInfo, textureScale).update();
    },
    updateView() {
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

export { ensembleDR, updateView };
