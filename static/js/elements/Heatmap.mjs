export { Heatmap };

class Heatmap {
    constructor(id, width = 300, height = 300) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.margin = {
            top: 40,
            right: 20,
            bottom: 20,
            left: 20,
        };
        this.k = [3, 4, 5, 7, 10];
        this.minSupport = [6, 7, 8, 9, 10];
        this.handlers = {};
    }

    initialize() {
        this.div = d3.select(this.id).append('div');
        this.svg = this.div.append('svg');
        this.container = this.svg.append('g');
        this.xAxis = this.svg.append('g');
        this.yAxis = this.svg.append('g');

        this.svg.attr('width', this.width).attr('height', this.height);

        this.container.attr(
            'transform',
            `translate(${this.margin.left}, ${this.margin.top})`
        );

        this.xScale = d3
            .scaleBand()
            .domain(this.minSupport)
            .range([0, this.width - this.margin.left - this.margin.right])
            .padding(0.01);

        this.yScale = d3
            .scaleBand()
            .domain(this.k)
            .range([0, this.height - this.margin.top - this.margin.bottom])
            .padding(0.01);

        this.colorScale = d3.scaleLinear().domain([1, 100]).range([0, 1]);

        this.xAxis
            .attr(
                'transform',
                `translate(${this.margin.left}, ${this.margin.top})`
            )
            .call(d3.axisTop(this.xScale));

        this.yAxis
            .attr(
                'transform',
                `translate(${this.margin.left}, ${this.margin.top})`
            )
            .call(d3.axisLeft(this.yScale));

        this.kBand = this.k.map((d) => this.yScale(d));
        this.msBand = this.minSupport.map((d) => this.xScale(d));

        return this;
    }

    update(fsmResult) {
        this.container
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

        this.container
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
