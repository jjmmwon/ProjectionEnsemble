import { embeddingView, fsView, heatmapView } from './store.mjs';

let title,
    method,
    data,
    drResult,
    fsmResult,
    id = 0;

async function ensembleDR() {
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

            drResult.forEach((e) => {
                embeddingView.add(
                    id++,
                    method,
                    e.hyper_parameters,
                    e.embedding,
                    fsmResult
                );
            });
            fsView.add(data);
            heatmapView.add(fsmResult);
        });
}

function reset() {
    embeddingView.scatterplots.forEach((sc) => {
        sc.div.remove();
    });
    embeddingView.scatterplots = [];
    fsView.reset();
    id = 0;
    heatmapView.reset();
}

export { ensembleDR };
