import { ensembleDR, changeMode, foldConfigView } from './eventHandlers.mjs';

function main() {
    d3.select('#runBtn').on('click', ensembleDR);

    d3.selectAll('#modeBtns').each(function () {
        d3.select(this).on('click', changeMode);
    });

    d3.selectAll('#configBtn').each(function () {
        d3.select(this).on('click', () => {
            d3.select(this).classed('fold')
                ? foldConfigView(true)
                : foldConfigView(false);
        });
    });

    d3.selectAll('#hpramSelector').each(function () {
        d3.select(this).on('change', function () {
            console.log(this);
        });
    });
}

main();
