export { Sankey };

class Sankey {
    constructor(id, width, height) {
        this.id = id;
        this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
    }

    initialize(data) {
        this.data = data;
        this.div = d3.select(this.id).append('div');

        // Draw Header
        this.header = this.div
            .append('div')
            .attr('class', 'd-flex justify-content-center');
        this.kSpan = this.header
            .append('span')
            .attr('class', 'badge rounded-pill bg-warning text-dark mx-2');
        this.msSpan = this.header
            .append('span')
            .attr('class', 'badge rounded-pill bg-warning text-dark mx-2');

        this.svg = this.div
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);

        this.container = this.svg
            .append('g')
            .attr(
                'transform',
                `translate(${this.margin.left},${this.margin.top})`
            );

        this.labelColorScale = d3.scaleOrdinal([], d3.schemeCategory10);
        this.fsColorScale = d3.scaleOrdinal([], d3.schemeTableau10);

        return this;
    }

    update(k = 5, min_support = 8) {
        this.k = k;
        this.min_support = min_support;
        this.fsmResult = this.data.fsm_results;
        this.labelInfo = this.data.dr_results[0].embedding.map((d) => d.label);

        this.fsmResult.forEach((d) => {
            if (d.k == this.k && d.min_support == this.min_support) {
                this.subgraphs = d.subgraphs;
            }
        });

        this.makeGraph();

        let nodes = this.graph.nodes,
            links = this.graph.links;

        const N = d3.map(nodes, (d) => d.id);

        d3
            .sankey()
            .nodeId((_, i) => N[i])
            .nodeAlign(d3.sankeyJustify)
            .nodeSort(null)
            .nodeWidth(15)
            .nodePadding(5)
            .extent([
                [0, 0],
                [this.width, this.height],
            ])({
            nodes,
            links,
        });

        this.container.selectAll('g').remove();
        this.node = this.container.append('g');
        this.link = this.container.append('g');

        this.node
            .selectAll('rect')
            .data(nodes)
            .join('rect')
            .style('fill', (d) => {
                return d.id < this.labelLength
                    ? this.labelColorScale(d.id)
                    : 'gray';
            })
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('width', (d) => d.x1 - d.x0);

        this.link
            .selectAll('.link')
            .data(links)
            .join('g')
            .append('path')
            .attr('d', d3.sankeyLinkHorizontal())
            .attr('fill', 'none')
            .attr('stroke-opacity', 0.1)
            .attr('stroke', '#000')
            .attr('stroke-width', ({ width }) => Math.max(2, width))
            .sort((a, b) => b.dy - a.dy);
    }

    makeGraph() {
        this.graph = {
            nodes: [],
            links: [],
        };

        this.graph.nodes = [...new Set(this.labelInfo)];
        this.labelLength = this.graph.nodes.length;
        this.graph.nodes =
            this.graph.nodes.length !== 1
                ? this.graph.nodes.sort((a, b) => {
                      return (
                          this.labelInfo.filter((c) => c == b).length -
                          this.labelInfo.filter((c) => c == a).length
                      );
                  })
                : this.graph.nodes;

        let outliers = [...new Array(this.labelInfo.length)].map((_, i) => i);

        this.subgraphs.forEach((fs, i) => {
            this.graph.nodes.push('FS' + i);
            outliers = outliers.filter((o) => !fs.includes(o));

            let target = [
                ...new Set(this.subgraphs[i].map((j) => this.labelInfo[j])),
            ];

            target.forEach((t) => {
                this.graph.links.push({
                    source: this.graph.nodes.indexOf('FS' + i),
                    target: this.graph.nodes.indexOf(t),
                    value: this.subgraphs[i]
                        .map((j) => this.labelInfo[j])
                        .filter((c) => c == t).length,
                });
            });
        });

        this.graph.nodes.push('Outliers');
        let target = [...new Set(outliers.map((i) => this.labelInfo[i]))];
        target.forEach((t) => {
            this.graph.links.push({
                source: this.graph.nodes.indexOf('Outliers'),
                target: this.graph.nodes.indexOf(t),
                value: outliers
                    .map((i) => this.labelInfo[i])
                    .filter((c) => c == t).length,
            });
        });

        this.graph.nodes.forEach((_, i) => {
            this.graph.nodes[i] = {
                id: i,
            };
        });
    }
}
