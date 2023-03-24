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

    initialize(fsmResult, labelInfo, textureScale, eventHandlers) {
        this.fsmResult = fsmResult;
        this.labelSet = labelInfo.labelSet;
        this.labels = labelInfo.labels;
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
        this.k = d3.select('#kRange').property('value');
        this.minSupport = d3.select('#msRange').property('value');

        this.labelColorScale = d3.scaleOrdinal([], d3.schemeTableau10);

        this.fsmResult.forEach((d) => {
            if (d.k == this.k && d.ms == this.minSupport) {
                this.subgraphs = d.subgs;
            }
        });

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
            .style('fill', (d) => {
                if (d.id < this.labelLength) {
                    return this.labelColorScale(d.id);
                } else if (
                    d.id < this.labelLength + this.textureScale.length() &&
                    d.id < nodes.length - 1
                ) {
                    return this.textureScale.getTexture(
                        d.id - this.labelLength
                    );
                } else if (d.id < nodes.length - 1) {
                    return this.textureScale.getTexture(-1);
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
            .on('mouseover', (_, d) => {
                d.id >= this.labelLength
                    ? this.eventHandlers.linkViews(
                          'fsHover',
                          d.id - this.labelLength
                      )
                    : this.eventHandlers.linkViews('classHover', d.id);
            })
            .on('mouseout', () => {
                this.eventHandlers.linkViews('mouseOut');
                this.link.style('stroke-opacity', 0.1);
            });

        this.drawLegend();
    }

    makeGraph() {
        this.graph = {
            nodes: [],
            links: [],
        };

        this.graph.nodes = [...this.labelSet];
        let outliers = [...new Array(this.labels.length)].map((_, i) => i);

        // Subgraphs nodes
        this.subgraphs.forEach((fs, i) => {
            this.graph.nodes.push('FS' + i);
            outliers = outliers.filter((o) => !fs.includes(o));

            let target = [
                ...new Set(this.subgraphs[i].map((j) => this.labels[j])),
            ];

            target.forEach((t) => {
                this.graph.links.push({
                    source: this.graph.nodes.indexOf('FS' + i),
                    target: this.graph.nodes.indexOf(t),
                    value: this.subgraphs[i]
                        .map((j) => this.labels[j])
                        .filter((c) => c == t).length,
                });
            });
        });

        // Outliers node
        this.graph.nodes.push('Outliers');
        let target = [...new Set(outliers.map((i) => this.labels[i]))];
        target.forEach((t) => {
            this.graph.links.push({
                source: this.graph.nodes.indexOf('Outliers'),
                target: this.graph.nodes.indexOf(t),
                value: outliers.map((i) => this.labels[i]).filter((c) => c == t)
                    .length,
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

    highlightFS(target) {
        this.link.style('stroke-opacity', (l) => {
            return l.source.id === target + this.labelLength ||
                l.target.id === target + this.labelLength
                ? 0.4
                : 0.1;
        });
    }

    highlightClass(target) {
        this.link.style('stroke-opacity', (l) => {
            return l.source.id === target || l.target.id === target ? 0.4 : 0.1;
        });
    }

    mouseOut() {
        this.link.style('stroke-opacity', 0.1);
    }
}
