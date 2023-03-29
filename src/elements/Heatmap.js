import * as d3 from 'd3';

export { Heatmap };

class Heatmap {
    constructor(id, width = 300, height = 300) {
        this.id = id;
        this.margin = {
            top: 20,
            right: 10,
            bottom: 25,
            left: 30,
        };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
        this.k = [5, 6, 7, 8, 9, 10];
        this.minSupport = [10, 9, 8, 7, 6];
    }

    initialize(eventHandlers) {
        this.div = d3
            .select(this.id)
            .append('div')
            .attr('class', 'd-flex justify-content-center me-3');
        this.svg = this.div.append('svg');
        this.container = this.svg.append('g');
        this.xAxis = this.svg.append('g');
        this.yAxis = this.svg.append('g');
        this.xAxisLabel = this.svg.append('text');
        this.yAxisLabel = this.svg.append('text');
        this.cells = this.container.append('g');
        this.cellsText = this.container.append('g');
        this.eventHandlers = eventHandlers;

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.container.attr(
            'transform',
            `translate(${this.margin.left}, ${this.margin.top})`
        );

        this.xScale = d3
            .scaleBand()
            .domain(this.k)
            .range([0, this.width])
            .padding(0.03);

        this.yScale = d3
            .scaleBand()
            .domain(this.minSupport)
            .range([0, this.height])
            .padding(0.03);

        this.colorScale = d3.scaleLinear().range([0, 1]);

        this.xAxis
            .attr(
                'transform',
                `translate(${this.margin.left}, ${
                    this.height + this.margin.top
                })`
            )
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr(
                'transform',
                `translate(${this.margin.left}, ${this.margin.top})`
            )
            .call(d3.axisLeft(this.yScale));

        this.xAxisLabel
            .attr(
                'transform',
                `translate(${this.width + this.margin.left + 5}, ${
                    this.height + this.margin.top + 13
                })`
            )
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text('k')
            .attr('font-size', '13px')
            .attr('font-weight', 'bold');

        this.yAxisLabel
            .attr('transform', `translate(25, 10)`)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text('support')
            .attr('font-size', '13px')
            .attr('font-weight', 'bold');

        this.kBand = this.k.map((d) => this.xScale(d));
        this.msBand = this.minSupport.map((d) => this.yScale(d));

        return this;
    }

    update(fsmResult) {
        this.maxSubgraphsLength = d3.max(fsmResult, (d) => d.subgs.length);
        this.colorScale.domain([1, Math.ceil(this.maxSubgraphsLength * 1.5)]);

        this.cells
            .selectAll('rect')
            .data(fsmResult)
            .join('rect')
            .attr('class', (d) => `heatmap-cell k${d.k}ms${d.ms}`)
            .attr('x', (d) => this.xScale(d.k))
            .attr('y', (d) => this.yScale(d.ms))
            .attr('width', this.xScale.bandwidth())
            .attr('height', this.yScale.bandwidth())
            .style('fill', (d) =>
                d3.interpolateYlGn(this.colorScale(d.subgs.length))
            )
            .on('click', (event) => this.clickCell(event));

        this.cellsText
            .selectAll('text')
            .data(fsmResult)
            .join('text')
            .attr('class', 'heatmap-cell')
            .attr('x', (d) => this.xScale(d.k) + this.xScale.bandwidth() / 2)
            .attr('y', (d) => this.yScale(d.ms) + this.yScale.bandwidth() / 2)
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', 'black')
            .text((d) => d.subgs.length)
            .on('click', (event) => this.clickCell(event));

        return this;
    }

    clickCell(event) {
        let [x, y] = d3.pointer(event);

        this.eventHandlers.clickCell({
            k: this.invertX(x),
            ms: this.invertY(y),
        });
    }

    highlightCell() {
        d3.select('.highlight-cell').classed('highlight-cell', false);
        d3.select(
            '.k' +
                d3.select('#kRange').property('value') +
                'ms' +
                d3.select('#msRange').property('value')
        ).classed('highlight-cell', true);

        return this;
    }

    invertX(x) {
        let xVal = this.k[this.k.length - 1];
        this.kBand.forEach((d, i) => {
            if (xVal == this.k[this.k.length - 1])
                xVal = x < d ? this.k[i - 1] : xVal;
        });
        return xVal;
    }
    invertY(y) {
        let yVal = this.minSupport[this.minSupport.length - 1];
        this.msBand.forEach((d, i) => {
            if (yVal == this.minSupport[this.minSupport.length - 1])
                yVal = y < d ? this.minSupport[i - 1] : yVal;
        });
        return yVal;
    }
}
