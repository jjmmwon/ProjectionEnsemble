import { ensembleDR as _ensembleDR, eventHandlers } from './elements/store.js';
import * as d3 from 'd3';

let title, method;

async function ensembleDR() {
    loading(true);
    title = d3.select('#dataTitle').property('value');
    method = d3.select('#method').property('value');
    await _ensembleDR(title, method);
    loading(false);
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

    eventHandlers.updateViews(mode);
}

function changeHyperparams() {
    d3.select(`#${d3.select(this).property('id')}Value`).text(
        d3.select(this).property('value')
    );

    eventHandlers.updateViews();
}

function loading(isLoading) {
    d3.select('#generateBtn').selectAll('span').remove();

    isLoading
        ? d3
              .select('#generateBtn')
              .append('span')
              .attr('class', 'spinner-border spinner-border-sm')
              .attr('role', 'status')
              .attr('aria-hidden', 'true')
        : d3.select('#generateBtn').append('span').text('RUN');
}

export { ensembleDR, changeMode, changeHyperparams };
