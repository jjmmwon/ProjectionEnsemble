import { ensembleDR as _ensembleDR, eventHandlers } from './store.js';
import * as d3 from 'd3';

let title, method;

async function ensembleDR() {
    d3.select('#kRange').property('value', 9);
    d3.select('#msRange').property('value', 7);
    d3.select(`#kRangeValue`).text(9);
    d3.select(`#msRangeValue`).text(7);

    loading(true);
    title = d3.select('#dataTitle').property('value');
    method = d3.select('#method').property('value');
    await _ensembleDR(title, method);
    loading(false);
}

function changeMode(mode) {
    d3.selectAll('#modeBtns').each(function () {
        d3.select(this).classed('disabled', true);
        d3.select(this).property('value') === mode
            ? d3
                  .select(this)
                  .classed('btn-primary', true)
                  .classed('btn-outline-primary', false)
            : d3
                  .select(this)
                  .classed('btn-primary', false)
                  .classed('btn-outline-primary', true);
    });

    eventHandlers.changeMode(mode);

    d3.selectAll('#modeBtns').each(function () {
        d3.select(this).classed('disabled', false);
    });
}

function changeHyperparams() {
    d3.select(`#${d3.select(this).property('id')}Value`).text(
        d3.select(this).property('value')
    );

    eventHandlers.updateViews();
}

function loading(isLoading) {
    d3.select('#generateBtn')
        .classed('disabled', isLoading)
        .selectAll('span')
        .remove();

    isLoading
        ? d3
              .select('#generateBtn')
              .append('span')
              .attr('class', 'spinner-border spinner-border-sm')
              .attr('role', 'status')
              .attr('aria-hidden', 'true')
        : d3.select('#generateBtn').append('span').text('Generate');
}

export { ensembleDR, changeMode, changeHyperparams };
