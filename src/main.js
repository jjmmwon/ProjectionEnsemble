import './style.scss';
import { ensembleDR, changeMode, changeHyperparams } from './eventHandler.js';
import * as d3 from 'd3';

function main() {
    d3.select('#generateBtn').on('click', ensembleDR);
    d3.selectAll('#modeBtns').each(function () {
        d3.select(this).on('click', () => {
            changeMode(d3.select(this).property('value'));
        });
    });
    d3.selectAll('.hpramRange').each(function () {
        d3.select(this).on('change', changeHyperparams);
    });
    ensembleDR();
}

main();
