export { Scatterplot };
class Scatterplot {
    constructor(
        id,
        div,
        width,
        height,
        method,
        hyperparameters,
        brushedSet,
        hoverEvent
    ) {
        this.id = id;
        this.div = d3.select(div).append('div');
        this.margin = {
            top: 15,
            right: 10,
            bottom: 10,
            left: 10,
        };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
        this.method = method.substr(0, 4) == 'tsne' ? 't-SNE' : 'UMAP';
        this.hyperparameters = hyperparameters;
        this.brushedSet = brushedSet;
        this.hoverEvent = hoverEvent;
        this.handlers = {};
    }

    initialize() {
        this.div.attr(
            'class',
            'scatterplot bg-white p-1 mb-2 mx-1 rounded-3 justify-content-center'
        );

        this.header = this.div
            .append('div')
            .attr('class', 'd-flex justify-content-between mt-1');

        this.hpramDiv = this.div
            .append('div')
            .attr('class', 'd-flex justify-content-evenly')
            .style('font-family', 'var(--bs-body-font-family)');

        this.header
            .append('div')
            .attr('class', 'fs-6 fw-bold ms-2 mb-1')
            .text(`${this.method}${this.id}`);

        this.badgeColor = ['primary', 'success', 'danger'];
        this.hparams = {
            perplexity: 'perp',
            initialization: 'init',
            learning_rate: 'lr',
            n_neighbors: 'n_neighbors',
            min_dist: 'min_dist',
        };

        this.hpramDiv
            .selectAll('span')
            .data(d3.keys(this.hyperparameters))
            .join('span')
            .attr(
                'class',
                (_, i) =>
                    `badge rounded-pill bg-${this.badgeColor[i]} text-light`
            )
            .text((d) => `${this.hparams[d]}: ${this.hyperparameters[d]}`);

        this.svg = this.div.append('svg');
        this.container = this.svg.append('g');

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.container.attr(
            'transform',
            `translate(${this.margin.left}, ${this.margin.top})`
        );

        this.contourG = this.container.append('g');
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
    update(embedding, labelInfo, fsmResult, textureScale) {
        this.embedding = embedding;
        this.labelInfo = labelInfo;
        this.fsmResult = fsmResult;
        this.textureScale = textureScale;

        let pMax = this.embedding[0]['x'],
            pMin = this.embedding[0]['x'];

        this.embedding.forEach((d) => {
            pMax = pMax < d.x ? d.x : pMax;
            pMin = pMin > d.x ? d.x : pMin;
            pMax = pMax < d.y ? d.y : pMax;
            pMin = pMin > d.y ? d.y : pMin;
        });

        // set scales
        this.xScale = d3
            .scaleLinear()
            .domain([pMin * 1.05, pMax * 1.05])
            .range([0, this.width]);

        this.yScale = d3
            .scaleLinear()
            .domain([pMin * 1.05, pMax * 1.05])
            .range([this.height, 0]);

        this.labelColorScale = d3
            .scaleOrdinal()
            .domain(this.labelInfo.labelSet)
            .range(d3.schemeCategory10);

        this.fsColorScale = [...d3.schemeCategory10];
        this.fsColorScale.splice(7, 1);
        this.fsColorScale = d3
            .scaleOrdinal()
            .domain(new Set([...new Array(9)].map((_, i) => i)))
            .range(this.fsColorScale);

        // append points
        this.circles = this.container
            .selectAll('circle')
            .data(this.embedding)
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
            .attr('fill', (d) => this.labelColorScale(d.label))
            .attr('opacity', 0.7)
            .attr('r', 2);

        // this.container.call(this.brush);

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
                      this.embedding
                          .filter((d) => this.isBrushed(d, selection))
                          .map((d) => d.id)
                  )
                : new Set();

        if (this.handlers.brush) {
            this.handlers.brush(brushedSet);
        }
    }

    mouseOver(circleIndices) {
        this.circles
            .filter((d) => circleIndices.includes(d.id))
            .attr('r', 4)
            .attr('opacity', 0.8);
    }
    mouseOut() {
        this.circles.attr('r', 2).attr('opacity', 0.7);
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

    getFSMdata(k, min_support) {
        this.fsmResult.forEach((fs) => {
            if (fs.min_support == min_support && fs.k == k) {
                this.contourData = fs.contour_coords[this.id];
                this.subgraphs = fs.subgraphs;
            }
        });
    }

    drawContour(k, min_support) {
        this.getFSMdata(k, min_support);

        const line = d3
            .line()
            .x((d) => this.xScale(d[0]))
            .y((d) => this.yScale(d[1]));

        this.textureScale.callTextures((t) => {
            this.svg.call(t);
        });

        this.contours = this.contourG
            .selectAll('path')
            .data(this.contourData)
            .join('path');

        this.contours
            .attr('d', (d) => line(d))
            .attr('fill', (_, i) =>
                this.textureScale
                    .getTexture(i % this.textureScale.length())
                    .url()
            )
            .attr('id', (_, i) => `FS${i}`)
            .attr('fill-opacity', 0.5)
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.8)
            .on('mouseover', (d) => {
                let id = +d3.select(d.target).attr('id').slice(2);
                this.hoverEvent('mouseOver', this.subgraphs[id]);
            })
            .on('mouseout', (_) => {
                this.hoverEvent('mouseOut');
            });
    }

    removeContour() {
        this.contourG.remove();
        this.contourG = this.container.append('g');
    }

    changeMode(mode) {
        let k = d3.select('#kSelector').property('value'),
            minSupport = d3.select('#msSelector').property('value');
        if (mode == 'dualMode') {
            this.circles.attr('fill', (d) => this.labelColorScale(d.label));
            this.drawContour(k, minSupport);
        } else if (mode == 'fsMode') {
            this.removeContour();
            this.getFSMdata(k, minSupport);
            this.circles.attr('fill', d3.schemeCategory10[7]);
            this.subgraphs.forEach((fs, i) => {
                if (i < 9)
                    this.circles
                        .filter((d) => fs.includes(d.id))
                        .attr('fill', this.fsColorScale(i));
            });
        } else {
            this.removeContour();
            this.circles.attr('fill', (d) => this.labelColorScale(d.label));
        }
    }

    updateHyperparams() {
        let mode = d3
            .select(
                d3
                    .selectAll('#modeBtns')
                    .nodes()
                    .filter((n) => d3.select(n).classed('btn-primary'))[0]
            )
            .property('value');
        this.changeMode(mode);
    }
}
