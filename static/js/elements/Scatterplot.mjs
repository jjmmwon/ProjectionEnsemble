export { Scatterplot };
class Scatterplot {
    constructor(id, div, width, height, method, hyperparams, brushedSet) {
        this.id = id;
        this.div = d3.select(div).append('div');
        this.margin = {
            top: 15,
            right: 20,
            bottom: 30,
            left: 30,
        };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
        this.method = method.substr(0, 4) == 'tsne' ? 't-SNE' : 'UMAP';
        this.hyperparams = hyperparams;
        this.brushedSet = brushedSet;
        this.handlers = {};
    }

    initialize() {
        this.div.attr('class', 'scatterplot p-1 m-1 justify-content-center');

        this.header = this.div
            .append('div')
            .attr('class', 'd-flex justify-content-between');

        this.hpramDiv = this.div
            .append('div')
            .attr('class', 'd-flex justify-content-evenly');

        this.header
            .append('div')
            .attr('class', 'fs-6 fw-bold ms-2 mb-1')
            .text(`${this.method}${this.id}`);

        this.badgeColor = [
            'primary',
            'success',
            'danger',
            'secondary',
            'warning',
            'info',
            'dark',
            'light',
        ];

        this.hpramDiv
            .selectAll('span')
            .data(d3.keys(this.hyperparams))
            .join('span')
            .attr(
                'class',
                (_, i) =>
                    `badge rounded-pill bg-${this.badgeColor[i]} text-light`
            )
            .text((d) => `${d}: ${this.hyperparams[d]}`);

        this.svg = this.div.append('svg');
        this.container = this.svg.append('g');

        this.xAxis = this.svg.append('g');
        this.yAxis = this.svg.append('g');

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.container.attr(
            'transform',
            `translate(${this.margin.left}, ${this.margin.top})`
        );

        this.brush = d3
            .brush()
            .extent([
                [0, 0],
                [this.width, this.height],
            ])
            .on('end', (event) => {
                if (!event.sourceEvent) return;
                this.brushCircles(event);
            });
        return this;
    }

    //update event
    update(data) {
        this.data = data;

        let pMax = this.data[0]['x'],
            pMin = this.data[0]['x'];

        this.data.forEach((d) => {
            pMax = pMax < d.x ? d.x : pMax;
            pMin = pMin > d.x ? d.x : pMin;
            pMax = pMax < d.y ? d.y : pMax;
            pMin = pMin > d.y ? d.y : pMin;
        });

        // set scales
        this.xScale = d3
            .scaleLinear()
            .domain([pMin * 1.2, pMax * 1.2])
            .range([0, this.width]);

        this.yScale = d3
            .scaleLinear()
            .domain([pMin * 1.2, pMax * 1.2])
            .range([this.height, 0]);

        this.classColorScale = d3
            .scaleOrdinal()
            .domain([...new Set(this.data.map((d) => d.label))])
            .range(d3.schemeCategory10);

        this.frqSubgColorScale = d3
            .scaleOrdinal()
            .domain([...new Array(10)].map((_, i) => i))
            .range(d3.schemeCategory10);

        // append points
        this.circles = this.container
            .selectAll('circle')
            .data(this.data)
            .join('circle');

        this.circles
            .attr('transform', (d) => {
                return (
                    'translate(' +
                    this.xScale(d.x) +
                    ',' +
                    this.yScale(d.y) +
                    ')'
                );
            })
            .attr('fill', (d) => this.classColorScale(d.label))
            .attr('opacity', 0.4)
            .attr('r', 2.3);

        this.container.call(this.brush);

        // add axes
        this.xAxis
            .attr(
                'transform',
                `translate(${this.margin.left}, ${
                    this.height + this.margin.top
                })`
            )
            .transition()
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr(
                'transform',
                `translate(${this.margin.left}, ${this.margin.top})`
            )
            .transition()
            .call(d3.axisLeft(this.yScale));

        return this;
    }

    isBrushed(d, selection) {
        if (!selection) return;
        let [[x0, y0], [x1, y1]] = selection;
        let x = this.xScale(d.x);
        let y = this.yScale(d.y);

        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }

    hideBrush() {
        this.container.call(this.brush.clear);
    }

    brushCircles(event) {
        let selection = event.selection,
            brushedSet = selection
                ? new Set(
                      this.data
                          .filter((d) => this.isBrushed(d, selection))
                          .map((d) => d.id)
                  )
                : new Set();

        if (this.handlers.brush) {
            this.handlers.brush(brushedSet);
        }
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
        return this;
    }

    highlightBrushed() {
        this.circles
            .classed('brushed', (d) => this.brushedSet.has(d.id))
            .attr('opacity', 0.8);
    }

    drawContour(data) {
        data.FSM.forEach((d) => {
            if (d.k == 5 && d.min_support == 8) {
                this.FS = d.FS;
            }
        });

        Object.keys(this.FS).forEach((key, i) => {
            if (key == 'outliers') return false;
            if (i > 10) return false;
            this.circles
                .filter((d) => this.FS[key].includes(Number(d.id)))
                .attr('fill', (_) => this.frqSubgColorScale(i))
                .attr('r', 2.3)
                .attr('opacity', 0.7);
        });
    }
}
