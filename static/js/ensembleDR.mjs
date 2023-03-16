import {
    embeddingView,
    fsView,
    hyperparameterView,
    labelInfo,
} from './store.mjs';

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
                    fsmResult
                );
            });
            fsView.add(fsmResult, labelInfo);
            hyperparameterView.add(fsmResult);
        });
    loading(false);
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

export { ensembleDR };
