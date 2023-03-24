import './style.scss';
import { ensembleDR, changeMode, changeHyperparams } from './eventHandler.js';
import * as d3 from 'd3';

function main() {
    d3.select('#generateBtn').on('click', ensembleDR);
    d3.selectAll('input[name="modeSelector"]').each(function () {
        d3.select(this).on('change', changeMode);
    });
    d3.selectAll('.hpramRange').each(function () {
        d3.select(this).on('change', changeHyperparams);
    });
}

main();
