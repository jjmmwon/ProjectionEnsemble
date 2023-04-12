import * as d3 from 'd3';
import { sankey, sankeyJustify, sankeyLinkHorizontal } from 'd3-sankey';

export { Sankey };

class Sankey {
    constructor(id, width, height) {
        this.id = id;
        this.margin = { top: 20, right: 10, bottom: 10, left: 10 };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
    }

    initialize(storage, textureScale, eventHandlers) {
        this.fsmResult = storage.fsmResult;
        this.labelSet = storage.labelSet;
        this.labels = storage.labels;
        this.storage = storage;
        this.labelLength = this.labelSet.length;
        this.textureScale = textureScale;
        this.eventHandlers = eventHandlers;

        this.div = d3.select(this.id).append('div');

        this.svg = this.div
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.fsLabel = this.svg
            .append('text')
            .attr('transform', `translate(${this.margin.left + 8}, 15)`)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('FS');

        this.classLabel = this.svg
            .append('text')
            .attr(
                'transform',
                `translate(${this.margin.left + this.width - 9}, 15)`
            )
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('Class');

        this.container = this.svg
            .append('g')
            .attr(
                'transform',
                `translate(${this.margin.left},${this.margin.top})`
            );

        this.textureScale.callTextures((t) => {
            this.svg.call(t);
        });

        return this;
    }

    update() {
        this.labelColorScale = d3.scaleOrdinal([], d3.schemeTableau10);

        this.makeGraph();

        let nodes = this.graph.nodes,
            links = this.graph.links;

        const N = d3.map(nodes, (d) => d.id);

        sankey()
            .nodeId((_, i) => N[i])
            .nodeAlign(sankeyJustify)
            .nodeSort(null)
            .nodeWidth(15)
            .nodePadding(5)
            .extent([
                [0, 0],
                [this.width, this.height - 50],
            ])({
            nodes,
            links,
        });

        this.container.selectAll('g').remove();
        this.nodeG = this.container.append('g');
        this.linkG = this.container.append('g');

        this.classLegend = this.container.append('g');
        this.legendRect = this.classLegend.append('g');
        this.legendText = this.classLegend.append('g');

        this.link = this.linkG
            .selectAll('.link')
            .data(links)
            .join('g')
            .append('path')
            .attr('d', sankeyLinkHorizontal())
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.1)
            .attr('stroke', '#000')
            .attr('stroke-width', ({ width }) => Math.max(2, width))
            .sort((a, b) => b.dy - a.dy);

        this.node = this.nodeG
            .selectAll('rect')
            .data(nodes)
            .join('rect')
            .attr('class', 'node')
            .style('fill', (d) => {
                if (d.id < this.labelLength) {
                    return this.labelColorScale(d.id);
                } else if (
                    d.id < this.labelLength + this.textureScale.length() &&
                    d.id < nodes.length - 1
                ) {
                    return this.textureScale
                        .getTexture(d.id - this.labelLength)
                        .url();
                } else if (d.id < nodes.length - 1) {
                    return 'rgb(240,240,240)';
                } else {
                    return 'gray';
                }
            })
            .attr('stroke', (d) => {
                return d.id < this.labelLength ? 'none' : 'black';
            })
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('width', (d) => d.x1 - d.x0)
            .on('click', (_, d) => {
                d.id < this.labelLength
                    ? this.eventHandlers.linkViews(
                          'class',
                          this.nodesMask[d.id]
                      )
                    : this.eventHandlers.linkViews('FS', this.nodesMask[d.id]);
            });

        this.drawLegend();
    }

    makeGraph() {
        let fsNodes,
            remainders = {};
        this.graph = {
            nodes: [],
            links: [],
        };

        fsNodes = [...new Set(this.storage.groupedData.map((d) => d.FS))];

        fsNodes.length <= 11
            ? (this.graph.nodes = [...this.labelSet, ...fsNodes])
            : (this.graph.nodes = [
                  ...this.labelSet,
                  ...fsNodes.slice(0, 10),
                  'remainders',
                  'outliers',
              ]);

        this.nodesMask = [...this.graph.nodes];

        this.storage.groupedData
            .filter((d) => d.FS !== 'outliers' && d.FS > 10)
            .forEach((d) => {
                remainders[d.label]
                    ? (remainders[d.label] += d.points.length)
                    : (remainders[d.label] = d.points.length);
            });

        this.storage.groupedData.forEach((d) => {
            this.graph.nodes.indexOf(d.FS) < 0
                ? null
                : this.graph.links.push({
                      source: this.graph.nodes.indexOf(d.FS),
                      target: this.graph.nodes.indexOf(d.label),
                      value: d.points.length,
                  });
        });

        Object.keys(remainders)
            .sort()
            .forEach((d) => {
                this.graph.links.push({
                    source: this.graph.nodes.indexOf('remainders'),
                    target: this.graph.nodes.indexOf(d),
                    value: remainders[d],
                });
            });

        this.graph.nodes.forEach((_, i) => {
            this.graph.nodes[i] = {
                id: i,
            };
        });
    }

    drawLegend() {
        this.classLegend
            .attr('transform', `translate(0,${this.height - 35})`)
            .attr('font-size', '13px');

        this.legendRect
            .selectAll('rect')
            .data(this.labelSet)
            .join('rect')
            .attr('x', (_, i) => (i % 5) * Math.floor(this.width / 5))
            .attr('y', (_, i) => Math.floor(i / 5) * 20)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', (_, i) => this.labelColorScale(i));

        this.legendText
            .selectAll('text')
            .data(this.labelSet)
            .join('text')
            .attr('x', (_, i) => (i % 5) * Math.floor(this.width / 5) + 15)
            .attr('y', (_, i) => Math.floor(i / 5) * 20 + 10)
            .text((d) => d);
    }

    updateToggle(onSet) {
        this.link
            .filter((l) => onSet.has(this.nodesMask[l.source.id]))
            .data()
            .forEach((d) => {
                console.log(this.nodesMask[d.target.id], d.value);
            });

        this.link.attr('stroke-opacity', (l) =>
            onSet.has(this.nodesMask[l.source.id]) ||
            onSet.has(this.nodesMask[l.target.id])
                ? 0.4
                : 0.1
        );
    }
}
