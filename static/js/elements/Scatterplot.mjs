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
        this.method = method.substr(0, 4) === 'tsne' ? 't-SNE' : 'UMAP';
        this.mode = 'dualMode';
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
    embedData(embedding, labelInfo, fsmResult, textureScale) {
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
            .attr('fill', (d) => 'gray')
            .attr('opacity', 0.8)
            .attr('r', 1.5);

        // this.container.call(this.brush);

        return this;
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
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

    highlightBrushed() {
        this.circles
            .classed('brushed', (d) => this.brushedSet.has(d.id))
            .attr('opacity', 0.8);
    }

    highlightFS(target) {
        this.contours
            .transition()
            .attr('stroke-opacity', (d, i) => (i === target ? 1 : 0.1))
            .attr('fill-opacity', (d, i) => (i === target ? 0.5 : 0.1));
    }
    highlightClass(target) {
        this.circles.attr('r', (d) =>
            d.label === this.labelInfo.labelSet[target] ? 3 : 1.5
        );
    }

    mouseOut() {
        this.contours.attr('stroke-opacity', 0.8).attr('fill-opacity', 0.5);

        this.circles.attr('r', 1.5);
    }

    drawContour() {
        const line = d3
            .line()
            .x((d) => this.xScale(d[0]))
            .y((d) => this.yScale(d[1]));

        this.textureScale.callTextures((t) => {
            this.svg.call(t);
        });

        this.contours = this.contourG
            .selectAll('path')
            .data(this.contourData.slice(0, 10))
            .join('path');

        this.contours
            .attr('d', (d) => line(d))
            .attr('fill', (_, i) =>
                i < this.textureScale.length()
                    ? this.textureScale.getTexture(i).url()
                    : 'none'
            )
            .attr('id', (_, i) => `FS${i}`)
            .attr('fill-opacity', 0.5)
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.8)
            .on('mouseover', (d) => {
                let fsID = +d3.select(d.target).attr('id').slice(2);
                this.hoverEvent('fsHover', fsID);
            })
            .on('mouseout', (d) => {
                let fsID = +d3.select(d.target).attr('id').slice(2);
                this.hoverEvent('mouseOut', fsID);
            });
    }

    removeContour() {
        this.contourG.remove();
        this.contourG = this.container.append('g');
    }

    updateView(mode) {
        this.mode = mode ? mode : this.mode;

        this.updateHyperparams();

        if (this.mode === 'dualMode') {
            this.circles.attr('fill', (d) => this.labelColorScale(d.label));
            this.drawContour();
        } else if (this.mode === 'fsMode') {
            this.removeContour();
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
        this.k = d3.select('#kSelector').property('value');
        this.minSupport = d3.select('#msSelector').property('value');

        this.fsmResult.forEach((fs) => {
            if (fs.min_support == this.minSupport && fs.k == this.k) {
                this.contourData = fs.contour_coords[this.id];
                this.subgraphs = fs.subgraphs;
            }
        });
    }
}
