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
    storage,
    textureScale;

projectionsView = {
    scatterplots: [],
    brushedSet: new Set(),

    add(method, hyperparams, embedding, storage, textureScale) {
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

        sc.initialize(embedding, storage).updateView().changeMode('dualMode');

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

    updateView() {
        this.scatterplots.forEach((sc) => {
            sc.updateView();
        });
    },

    changeMode(mode) {
        this.scatterplots.forEach((sc) => {
            sc.changeMode(mode);
        });
    },

    updateToggle(onSet) {
        this.scatterplots.forEach((sc) => {
            sc.updateToggle(onSet);
        });
    },

    highlightClass(target) {
        this.scatterplots.forEach((sc) => {
            sc.highlightClass(target);
        });
    },

    mouseOut(eventType, target) {
        this.scatterplots.forEach((sc) => {
            sc.mouseOut(eventType, target);
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

    add(storage, textureScale) {
        this.sankey.initialize(storage, textureScale, eventHandlers).update();
    },
    updateView() {
        this.sankey.update();
    },

    hover(type, target) {
        this.sankey.hover(type, target);
    },

    updateToggle(onSet) {
        this.sankey.updateToggle(onSet);
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

storage = {
    labels: [],
    labelSet: [],
    fsmResult: [],
    subgraphs: [],
    contourData: [],
    groupedData: [],

    add(data) {
        this.labels = data.dr_results[0].embedding.map((d) => d.l);
        this.labelSet = [...new Set(this.labels)].sort();
        this.fsmResult = data.fsm_results;
        this.updateHyperparams();
    },

    updateHyperparams() {
        this.fsmResult.forEach((fs) => {
            if (
                fs.ms == d3.select('#msRange').property('value') &&
                fs.k == d3.select('#kRange').property('value')
            ) {
                this.contourData = fs.coords;
                this.subgraphs = fs.subgs;
            }
        });
        this.updatePointGroup();
        return this;
    },

    updatePointGroup() {
        let group = {},
            outliers = [...new Array(this.labels.length)].map((_, i) => i);

        this.groupedData = [];

        this.subgraphs.forEach((s, i) => {
            outliers = outliers.filter((o) => !s.includes(o));
            group = {};
            s.forEach((d) => {
                group[this.labels[d]]
                    ? group[this.labels[d]].push(d)
                    : (group[this.labels[d]] = [d]);
            });

            Object.keys(group).forEach((k) => {
                this.groupedData.push({
                    FS: i,
                    label: k,
                    points: group[k],
                    state: 'default',
                    change: '',
                });
            });
        });

        group = {};
        outliers.forEach((d) => {
            group[this.labels[d]]
                ? group[this.labels[d]].push(d)
                : (group[this.labels[d]] = [d]);
        });
        Object.keys(group).forEach((k) => {
            this.groupedData.push({
                FS: 'outliers',
                label: k,
                points: group[k],
                state: 'default',
                change: '',
            });
        });

        console.log(this.groupedData);

        return this;
    },

    toggleFS(target, onSet) {
        console.log(target);

        if (!onSet.has(target)) {
            // toggle on event
            if (!onSet.size) {
                // first toggle
                if (target === 'remainders') {
                    // toggle on remainders
                    this.groupedData.forEach((d) => {
                        (d.FS !== 'outliers') & (d.FS >= 10)
                            ? (d.change = 'on')
                            : (d.change = 'off');
                    });
                } else {
                    this.groupedData.forEach((d) => {
                        d.FS === target
                            ? (d.change = 'on')
                            : (d.change = 'off');
                    });
                }
            } else {
                if (target === 'remainders') {
                    // toggle off remainders
                    this.groupedData.forEach((d) => {
                        (d.FS !== 'outliers') & (d.FS >= 10)
                            ? (d.change = 'on')
                            : (d.change = '');
                    });
                } else {
                    this.groupedData.forEach((d) => {
                        d.FS === target ? (d.change = 'on') : (d.change = '');
                    });
                }
            }
            onSet.add(target);
        } else {
            // toggle off event
            if (onSet.size === 1) {
                // toggle off last one
                this.groupedData.forEach((d) => {
                    d.change = 'default';
                });
            } else {
                this.groupedData.forEach((d) => {
                    d.FS === target && !onSet.has(d.label)
                        ? (d.change = 'off')
                        : (d.change = '');
                });
            }
            onSet.delete(target);
        }
    },
    toggleClass(target, onSet) {
        if (!onSet.has(target)) {
            // toggle on event
            if (!onSet.size) {
                // first toggle
                this.groupedData.forEach((d) => {
                    d.label === target ? (d.change = 'on') : (d.change = 'off');
                });
            } else {
                this.groupedData.forEach((d) => {
                    d.label === target ? (d.change = 'on') : (d.change = '');
                });
            }
            onSet.add(target);
        } else {
            // toggle off event
            if (onSet.size === 1) {
                // toggle off last one
                this.groupedData.forEach((d) => {
                    d.change = 'default';
                });
            } else {
                this.groupedData.forEach((d) => {
                    d.label === target && !onSet.has(d.FS)
                        ? (d.change = 'off')
                        : (d.change = '');
                });
            }
            onSet.delete(target);
        }
    },

    completeChange() {
        this.groupedData.forEach((d) => {
            d.state = d.change;
            d.change = '';
        });
    },
};

eventHandlers = {
    onSet: new Set(),

    clickCell: function (args) {
        d3.select('#kRange').property('value', args.k);
        d3.select('#msRange').property('value', args.ms);
        d3.select(`#kRangeValue`).text(args.k);
        d3.select(`#msRangeValue`).text(args.ms);
        this.updateViews();
    },

    updateViews: function () {
        storage.updateHyperparams();
        projectionsView.updateView();
        realtionView.updateView();
        hyperparameterView.updateView();
    },

    changeMode: function (mode) {
        projectionsView.changeMode(mode);
    },

    linkViews: function (type, target) {
        type === 'FS'
            ? storage.toggleFS(target, this.onSet)
            : storage.toggleClass(target, this.onSet);

        projectionsView.updateToggle(this.onSet);
        realtionView.updateToggle(this.onSet);
        storage.completeChange();
    },
};

textureScale = {
    textures: [
        textures.paths().d('crosses').thicker(),
        textures.paths().d('waves').thicker(),
        textures.paths().d('caps').thicker(),
        textures.paths().d('squares').thicker(),

        textures
            .lines()
            .orientation('horizontal')
            .stroke('white')
            .size(8)
            .strokeWidth(2)
            .background('rgb(120,120,120)'),
        textures.lines().orientation('horizontal').size(7).strokeWidth(2),

        textures.lines().thicker(),
        textures.lines().orientation('6/8').size(8).strokeWidth(3),
        textures.lines().orientation('vertical').size(6).strokeWidth(1.5),
        textures
            .lines()
            .orientation('vertical')
            .stroke('white')
            .size(8)
            .strokeWidth(2)
            .background('rgb(160,160,160)'),
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

    await d3
        .json(
            `http://localhost:50004/v1/preset?title=${title}&method=${method}`
        )
        .then((data) => {
            console.log(data);
            drResult = data.dr_results;
            fsmResult = data.fsm_results;

            drResult.forEach((dr) => {
                dr.embedding = Papa.parse(dr.embedding, { header: true }).data;
            });

            storage.add(data);

            console.log(drResult);
            drResult.forEach((e) => {
                projectionsView.add(
                    method,
                    e.hprams,
                    e.embedding,
                    storage,
                    textureScale
                );
            });

            realtionView.add(storage, textureScale);
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
