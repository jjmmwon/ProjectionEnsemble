export { Heatmap };

class Heatmap {
    constructor(id, width = 300, height = 300) {
        this.id = id;
        this.margin = {
            top: 20,
            right: 20,
            bottom: 50,
            left: 40,
        };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
        this.k = [5, 7, 8, 9, 10];
        this.minSupport = [6, 7, 8, 9, 10];
        this.handlers = {};
    }

    initialize() {
        this.div = d3.select(this.id).append('div');
        this.svg = this.div.append('svg');
        this.container = this.svg.append('g');
        this.xAxis = this.svg.append('g');
        this.yAxis = this.svg.append('g');
        this.xAxisLabel = this.svg.append('text');
        this.yAxisLabel = this.svg.append('text');
        this.cells = this.container.append('g');
        this.cellsText = this.container.append('g');

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.container.attr(
            'transform',
            `translate(${this.margin.left}, ${this.margin.top})`
        );

        this.xScale = d3
            .scaleBand()
            .domain(this.minSupport)
            .range([0, this.width])
            .padding(0.01);

        this.yScale = d3
            .scaleBand()
            .domain(this.k)
            .range([0, this.height])
            .padding(0.01);

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
                `translate(${this.width / 2 + this.margin.left}, ${
                    this.height + this.margin.top + 25
                })`
            )
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text('min_support')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold');

        this.yAxisLabel
            .attr(
                'transform',
                `translate(15, ${
                    this.height / 2 + this.margin.top
                }) rotate(-90)`
            )
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .text('k')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold');

        this.kBand = this.k.map((d) => this.yScale(d));
        this.msBand = this.minSupport.map((d) => this.xScale(d));

        return this;
    }

    update(fsmResult) {
        this.maxSubgraphsLength = d3.max(fsmResult, (d) => d.subgraphs.length);
        this.colorScale.domain([1, Math.ceil(this.maxSubgraphsLength * 1.5)]);

        this.cells
            .selectAll('rect')
            .data(fsmResult)
            .join('rect')
            .attr('class', 'heatmap-cell')
            .attr('x', (d) => this.xScale(d['min_support']))
            .attr('y', (d) => this.yScale(d['k']))
            .attr('width', this.xScale.bandwidth())
            .attr('height', this.yScale.bandwidth())
            .style('fill', (d) =>
                d3.interpolateYlGn(this.colorScale(d.subgraphs.length))
            )
            .on('click', (event) => this.clickCell(event));

        this.cellsText
            .selectAll('text')
            .data(fsmResult)
            .join('text')
            .attr(
                'x',
                (d) =>
                    this.xScale(d['min_support']) + this.xScale.bandwidth() / 2
            )
            .attr('y', (d) => this.yScale(d['k']) + this.yScale.bandwidth() / 2)
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('font-size', '10px')
            .style('fill', 'black')
            .text((d) => d.subgraphs.length);

        return this;
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }

    clickCell(event) {
        let [x, y] = d3.pointer(event);

        if (this.handlers?.click) {
            this.handlers.click(this.invertX(x), this.invertY(y));
        }
    }

    invertX(x) {
        let xVal = this.minSupport[this.minSupport.length - 1];
        this.msBand.forEach((d, i) => {
            if (xVal == this.minSupport[this.minSupport.length - 1])
                xVal = x < d ? this.minSupport[i - 1] : xVal;
        });
        return xVal;
    }
    invertY(y) {
        let yVal = this.k[this.k.length - 1];
        this.kBand.forEach((d, i) => {
            if (yVal == this.k[this.k.length - 1])
                yVal = y < d ? this.k[i - 1] : yVal;
        });
        return yVal;
    }
}
