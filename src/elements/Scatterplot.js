import * as d3 from 'd3';

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
        textureScale,
        eventHandlers
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
        this.method = method.substr(0, 4) === 'tsne' ? '<i>t </i>-SNE' : 'UMAP';
        this.mode = 'dualMode';
        this.hyperparameters = hyperparameters;
        this.brushedSet = brushedSet;
        this.textureScale = textureScale;
        this.eventHandlers = eventHandlers;
        this.handlers = {};
    }

    initialize(embedding, storage) {
        this.embedding = embedding;
        this.storage = storage;

        this.fsmResult = storage.fsmResult;
        this.labelSet = storage.labelSet;
        this.labels = storage.labels;

        this.div.attr(
            'class',
            'scatterplot bg-white p-1 my-1 me-2 rounded-3 justify-content-center border border-priamry'
        );

        this.header = this.div
            .append('div')
            .attr('class', 'd-flex mt-1 mx-2 justify-content-between');

        this.header
            .append('div')
            .attr('class', 'fs-6 fw-bold ms-1')
            .html(`${this.method} ${this.id + 1}`);

        this.header
            .append('span')
            .attr('class', 'badge rounded-pill text-bg-primary me-1')
            .text(`random`);

        this.svg = this.div.append('svg');
        this.container = this.svg.append('g');

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.container.attr(
            'transform',
            `translate(${this.margin.left}, ${this.margin.top})`
        );

        this.pointGroup = this.container.append('g');
        this.contourGroup = this.container.append('g');

        this.createScales();

        return this;
    }

    createScales() {
        let [pMin, pMax] = d3.extent([
            ...this.embedding.map((d) => Number(d.x)),
            ...this.embedding.map((d) => Number(d.y)),
        ]);

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
            .domain(this.labelSet)
            .range(d3.schemeTableau10);

        this.textureScale.callTextures((t) => {
            this.svg.call(t);
        });

        return this;
    }

    embedGroupedData() {
        this.circleGroup = this.pointGroup
            .selectAll('g')
            .data(this.storage.groupedData)
            .join('g');

        this.circles = this.circleGroup
            .selectAll('circle')
            .data((d) => d.points)
            .join('circle')
            .attr(
                'transform',
                (d) =>
                    `translate(${this.xScale(
                        this.embedding[d].x
                    )}, ${this.yScale(this.embedding[d].y)})`
            );

        this.circles
            .attr('fill', (d) => this.labelColorScale(this.embedding[d].l))
            .attr('opacity', 0.7)
            .attr('r', 1);

        return this;
    }

    drawContour() {
        this.contourCoords =
            this.storage.contourData[this.id].length >
            this.textureScale.length()
                ? this.storage.contourData[this.id].slice(
                      0,
                      this.textureScale.length()
                  )
                : this.storage.contourData[this.id];

        const line = d3
            .line()
            .x((d) => this.xScale(d[0]))
            .y((d) => this.yScale(d[1]));

        this.contours = this.contourGroup
            .selectAll('path')
            .data(this.contourCoords.slice(0, 15))
            .join('path');

        this.contours
            .attr('d', (d) => line(d))
            .attr('class', 'contour')
            .attr('fill', (_, i) =>
                i < this.textureScale.length()
                    ? this.textureScale.getTexture(i).url()
                    : 'rgb(240,240,240)'
            )
            .attr('id', (_, i) => `FS${i}`)
            .attr('fill-opacity', 0.4)
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.8)
            .on('click', (d) => {
                let fsID = +d3.select(d.target).attr('id').slice(2);
                this.eventHandlers.linkViews('FS', fsID);
            });
    }

    updateView() {
        this.embedGroupedData();
        this.drawContour();
        return this;
    }

    changeMode(mode) {
        this.mode = mode ? mode : this.mode;
        if (this.mode == 'dualMode') {
            this.drawContour();
            this.circles.attr('fill', (d) =>
                this.labelColorScale(this.embedding[d].l)
            );
        } else if (this.mode == 'fsMode') {
            this.drawContour();
            this.circles.attr('fill', d3.schemeTableau10[9]);
        } else {
            this.contourGroup.selectAll('path').remove();
            this.circles.attr('fill', (d) =>
                this.labelColorScale(this.embedding[d].l)
            );
        }
    }

    updateToggle(onSet) {
        this.circleGroup
            .filter((d) => d.change === 'off')
            .selectAll('circle')
            .attr('opacity', 0.1);

        this.circleGroup
            .filter((d) => d.change === 'on')
            .selectAll('circle')
            .attr('opacity', 0.7);

        this.circleGroup
            .filter((d) => d.change === 'default')
            .selectAll('circle')
            .attr('opacity', 0.7);

        !onSet.size
            ? this.contours
                  .attr('fill-opacity', 0.4)
                  .attr('stroke-opacity', 0.8)
            : this.contours
                  .attr('fill-opacity', (_, i) => (onSet.has(i) ? 0.5 : 0))
                  .attr('stroke-opacity', (_, i) => (onSet.has(i) ? 1 : 0));
    }
}
