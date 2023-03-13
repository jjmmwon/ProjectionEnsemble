import { ensembleDR } from './ensembleDR.mjs';

function main() {
    d3.select('#runBtn').on('click', ensembleDR);
}

main();
