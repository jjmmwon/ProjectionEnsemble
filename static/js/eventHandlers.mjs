import {
    ensembleDR as _ensembleDR,
    updateView as updateView,
} from './elements/store.mjs';

let title, method;

async function ensembleDR() {
    loading(true);
    title = d3.select('#dataTitle').property('value');
    method = d3.select('#method').property('value');
    await _ensembleDR(title, method);
    loading(false);
    foldConfigView(true);
}

function changeMode() {
    let mode = d3.select(this).property('value');

    d3.selectAll('#modeBtns').each(function () {
        d3.select(this).property('value') == mode
            ? d3
                  .select(this)
                  .classed('btn-outline-primary', false)
                  .classed('btn-primary', true)
            : d3
                  .select(this)
                  .classed('btn-outline-primary', true)
                  .classed('btn-primary', false);
    });

    updateView(mode);
}

function changeHyperparams() {
    updateView();
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

function foldConfigView(fold) {
    if (fold) {
        d3.select('.fold').classed('d-none', true);
        d3.select('.unfold').classed('d-none', false);
        d3.select('.config-section').classed('d-none', true);
    } else {
        d3.select('.unfold').classed('d-none', true);
        d3.select('.fold').classed('d-none', false);
        d3.select('.config-section').classed('d-none', false);
    }
}

export { ensembleDR, changeMode, foldConfigView, changeHyperparams };
