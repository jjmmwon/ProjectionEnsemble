import * as d3 from 'd3';
import { thresholdFreedmanDiaconis } from 'd3';

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

        this.method !== 'UMAP'
            ? this.header
                  .append('span')
                  .attr('class', 'badge rounded-pill text-bg-primary me-1')
                  .text(`${this.hyperparameters['init']}`)
            : null;

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
        let pMax = Number(this.embedding[0]['x']),
            pMin = Number(this.embedding[0]['x']);

        this.embedding.forEach((d) => {
            pMax = pMax < Number(d.x) ? Number(d.x) : pMax;
            pMin = pMin > Number(d.x) ? Number(d.x) : pMin;
            pMax = pMax < Number(d.y) ? Number(d.y) : pMax;
            pMin = pMin > Number(d.y) ? Number(d.y) : pMin;
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
            .attr('opacity', 0.8)
            .attr('r', 1.5);

        return this;
    }

    drawContour() {
        this.contourCoords = this.storage.contourData[this.id];
        const line = d3
            .line()
            .x((d) => this.xScale(d[0]))
            .y((d) => this.yScale(d[1]));

        this.contours = this.contourGroup
            .selectAll('path')
            .data(this.contourCoords.slice(0, 10))
            .join('path');

        this.contours
            .attr('d', (d) => line(d))
            .attr('fill', (_, i) =>
                i < this.textureScale.length()
                    ? this.textureScale.getTexture(i).url()
                    : 'rgb(240,240,240)'
            )
            .attr('id', (_, i) => `FS${i}`)
            .attr('fill-opacity', 0.4)
            .attr('stroke', 'black')
            .attr('stroke-opacity', 0.8)
            .on('mouseover', (d) => {
                let fsID = +d3.select(d.target).attr('id').slice(2);
                this.eventHandlers.linkViews('fsHover', fsID);
            })
            .on('mouseout', (d) => {
                let fsID = +d3.select(d.target).attr('id').slice(2);
                this.eventHandlers.linkViews('fsMouseOut', fsID);
            })
            .on('click', (d) => {
                let fsID = +d3.select(d.target).attr('id').slice(2);
                this.eventHandlers.linkViews('fsClick', fsID);
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

    highlightFS(target) {
        if (target > 9) return;
        this.contours
            .attr('stroke-opacity', (_, i) => (i === target ? 1 : 0.1))
            .attr('fill-opacity', (_, i) => (i === target ? 0.5 : 0.1));

        this.circleGroup
            .filter((d) => d.FS === target)
            .selectAll('circle')
            .attr('r', 4);

        this.circleGroup
            .filter((d) => d.FS !== target)
            .selectAll('circle')
            .attr('opacity', 0.05);
    }
    highlightClass(target) {
        this.circleGroup
            .filter((d) => d.label !== this.labelSet[target])
            .selectAll('circle')
            .attr('opacity', 0.05);

        let containingContour = this.storage.groupedData
            .filter((d) => d.label === this.labelSet[target])
            .map((d) => d.FS);

        this.contours.each(function (_, i) {
            containingContour.includes(i)
                ? d3
                      .select(this)
                      .attr('stroke-opacity', 1)
                      .attr('fill-opacity', 0.5)
                : d3
                      .select(this)
                      .attr('stroke-opacity', 0.1)
                      .attr('fill-opacity', 0.1);
        });
    }

    mouseOut(eventType, target) {
        if (target > 9) return;
        this.contours.attr('stroke-opacity', 0.8).attr('fill-opacity', 0.4);
        if (eventType == 'fsMouseOut') {
            this.circleGroup
                .filter((d) => d.FS !== target)
                .selectAll('circle')
                .attr('opacity', 0.8);

            this.circleGroup
                .filter((d) => d.FS === target)
                .selectAll('circle')
                .attr('r', 1.5);
        } else {
            this.circleGroup
                .filter((d) => d.label !== this.labelSet[target])
                .selectAll('circle')
                .attr('opacity', 0.8);
        }
    }
}
