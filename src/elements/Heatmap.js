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
        this.kRange = [5, 7, 9, 11, 13, 15];
        this.minSupportRange = [10, 9, 8, 7, 6];
    }

    initialize(eventHandlers, fsmResult) {
        this.fsmResult = fsmResult;
        this.div = d3
            .select(this.id)
            .append('div')
            .attr('class', 'd-flex justify-content-center me-2');
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

        this.kRange = [...new Set(this.fsmResult.map((d) => d.k))];
        this.k = this.kRange[4];
        this.ms = 7;

        this.xScale = d3
            .scaleBand()
            .domain(this.kRange)
            .range([0, this.width])
            .padding(0.03);

        this.yScale = d3
            .scaleBand()
            .domain(this.minSupportRange)
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
            .text('minsup')
            .attr('font-size', '13px')
            .attr('font-weight', 'bold');

        this.kBand = this.kRange.map((d) => this.xScale(d));
        this.msBand = this.minSupportRange.map((d) => this.yScale(d));

        return this;
    }

    update(dataRow) {
        this.subgLength = this.fsmResult.map(
            (d) => d.subgs.filter((s) => s.length >= dataRow / 500).length
        );
        this.maxSubgraphsLength = d3.max(this.subgLength);
        this.colorScale.domain([1, Math.ceil(this.maxSubgraphsLength * 1.5)]);

        this.cells
            .selectAll('rect')
            .data(this.fsmResult)
            .join('rect')
            .attr('class', (d) => `heatmap-cell k${d.k}ms${d.ms}`)
            .attr('x', (d) => this.xScale(d.k))
            .attr('y', (d) => this.yScale(d.ms))
            .attr('width', this.xScale.bandwidth())
            .attr('height', this.yScale.bandwidth())
            .style('fill', (_, i) =>
                d3.interpolateYlGn(this.colorScale(this.subgLength[i]))
            )
            .on('click', (event) => this.clickCell(event));

        this.cellsText
            .selectAll('text')
            .data(this.fsmResult)
            .join('text')
            .attr('class', 'heatmap-cell')
            .attr('x', (d) => this.xScale(d.k) + this.xScale.bandwidth() / 2)
            .attr('y', (d) => this.yScale(d.ms) + this.yScale.bandwidth() / 2)
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', 'black')
            .text((_, i) => this.subgLength[i])
            .on('click', (event) => this.clickCell(event));

        return this;
    }

    clickCell(event) {
        let [x, y] = d3.pointer(event);

        this.k = this.invertX(x);
        this.ms = this.invertY(y);

        this.eventHandlers.clickCell({
            k: this.invertX(x),
            ms: this.invertY(y),
        });
    }

    highlightCell() {
        d3.select('.highlight-cell').classed('highlight-cell', false);
        d3.select('.k' + this.k + 'ms' + this.ms).classed(
            'highlight-cell',
            true
        );

        return this;
    }

    invertX(x) {
        let xVal = this.kRange[this.kRange.length - 1];
        this.kBand.forEach((d, i) => {
            if (xVal == this.kRange[this.kRange.length - 1])
                xVal = x < d ? this.kRange[i - 1] : xVal;
        });
        return xVal;
    }
    invertY(y) {
        let yVal = this.minSupportRange[this.minSupportRange.length - 1];
        this.msBand.forEach((d, i) => {
            if (yVal == this.minSupportRange[this.minSupportRange.length - 1])
                yVal = y < d ? this.minSupportRange[i - 1] : yVal;
        });
        return yVal;
    }
}
