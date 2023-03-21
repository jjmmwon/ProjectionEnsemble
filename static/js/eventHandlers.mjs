import {
    embeddingView,
    fsView,
    hyperparameterView,
    labelInfo,
    textureScale,
} from './elements/store.mjs';

let title,
    method,
    data,
    drResult,
    fsmResult,
    id = 0;

async function ensembleDR() {
    loading(true);
    title = d3.select('#dataTitle').property('value');
    method = d3.select('#method').property('value');
    if (id) reset();
    await d3
        .json(`/v1/preset?title=${title}&method=${method}`)
        .then((response) => {
            console.log(response);
            data = response;
            drResult = data.dr_results;
            fsmResult = data.fsm_results;
            labelInfo.add(drResult[0].embedding.map((e) => e.label));

            drResult.forEach((e) => {
                embeddingView.add(
                    id++,
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
    loading(false);
}

function changeMode() {
    d3.selectAll('#modeBtns').each(function () {
        d3.select(this).classed('btn-outline-primary', true);
        d3.select(this).classed('btn-primary', false);
    });
    d3.select(this).classed('btn-outline-primary', false);
    d3.select(this).classed('btn-primary', true);

    embeddingView.changeMode(d3.select(this).property('value'));
}

function reset() {
    embeddingView.scatterplots.forEach((sc) => {
        sc.div.remove();
    });
    embeddingView.scatterplots = [];
    id = 0;
    fsView.reset();
    hyperparameterView.reset();
}

function loading(isLoading) {
    d3.select('#runBtn').selectAll('span').remove();

    isLoading
        ? d3
              .select('#runBtn')
              .append('span')
              .attr('class', 'spinner-border spinner-border-sm')
              .attr('role', 'status')
              .attr('aria-hidden', 'true')
        : d3.select('#runBtn').append('span').text('RUN');
}

function controlConfigView() {
    if (d3.select(this).classed('fold')) {
        d3.select(this).classed('d-none', true);
        d3.select('.unfold').classed('d-none', false);
        d3.select('.config-section').classed('d-none', true);
    } else {
        d3.select(this).classed('d-none', true);
        d3.select('.fold').classed('d-none', false);
        d3.select('.config-section').classed('d-none', false);
    }
}

export { ensembleDR, changeMode, controlConfigView };
