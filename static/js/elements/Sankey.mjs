export { Sankey };

class Sankey {
    constructor(div, width, height) {
        this.div = div;
        this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;
    }

    initialize() {
        this.div = d3.select(this.div).append('div');
        this.drawHeader();

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

        return this;
    }

    drawHeader() {
        this.header = this.div
            .append('div')
            .attr('class', 'd-flex justify-content-center');
        this.kSpan = this.header
            .append('span')
            .attr('class', 'badge rounded-pill bg-warning text-dark mx-2');
        this.msSpan = this.header
            .append('span')
            .attr('class', 'badge rounded-pill bg-warning text-dark mx-2');
    }

    update(data, k = 5, ms = 6) {
        this.k = k;
        this.ms = ms;

        this.data = data;
        this.data.FSM.forEach((d) => {
            if (d.k == this.k && d.min_support == this.ms) {
                this.FS = d.FS;
            }
        });

        this.makeGraph();
        this.classColorScale = d3.scaleOrdinal([], d3.schemeCategory10);
        this.fsColorScale = d3.scaleOrdinal([], d3.schemeTableau10);

        let nodes = this.graph.nodes,
            links = this.graph.links;
        const N = d3.map(nodes, (d) => d.id);

        d3
            .sankey()
            .nodeId((_, i) => N[i])
            .nodeAlign(d3.sankeyJustify)
            // .nodeSort(null)
            .nodeWidth(15)
            .nodePadding(25)
            .extent([
                [0, 0],
                [this.width, this.height],
            ])({
            nodes,
            links,
        });

        this.node = this.container
            .append('g')
            .selectAll('rect')
            .data(nodes)
            .join('rect')
            .style('fill', (d) => {
                return d.id < this.classLength
                    ? this.classColorScale(d.id)
                    : 'gray';
            })
            .attr('x', (d) => d.x0)
            .attr('y', (d) => d.y0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('width', (d) => d.x1 - d.x0);

        this.link = this.container
            .append('g')
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
        // const chart = sankeyChart({links: this.graph.links});
        // this.div.append(()=>chart);
    }

    makeGraph() {
        this.graph = {
            nodes: [],
            links: [],
        };

        this.graph.nodes = [...new Set(this.data.class)];
        this.classLength = this.graph.nodes.length;
        this.graph.nodes =
            this.graph.nodes.length !== 1
                ? this.graph.nodes.sort((a, b) => {
                      return (
                          this.data.class.filter((c) => c == b).length -
                          this.data.class.filter((c) => c == a).length
                      );
                  })
                : this.graph.nodes;

        Object.keys(this.FS).forEach((fs) => {
            this.graph.nodes.push(fs);

            let target = [
                ...new Set(this.FS[fs].map((i) => this.data.class[i])),
            ];

            target.forEach((t) => {
                this.graph.links.push({
                    source: this.graph.nodes.indexOf(fs),
                    target: this.graph.nodes.indexOf(t),
                    value: this.FS[fs]
                        .map((i) => this.data.class[i])
                        .filter((c) => c == t).length,
                });
            });
        });

        this.graph.nodes.forEach((d, i) => {
            this.graph.nodes[i] = {
                id: i,
            };
        });
    }

    intern(value) {
        return value !== null && typeof value === 'object'
            ? value.valueOf()
            : value;
    }
}
