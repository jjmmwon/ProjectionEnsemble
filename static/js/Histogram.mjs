export { Histogram };

class Histogram {
  constructor(div, width = 360, height = 600) {
    this.div = div;
    this.width = width;
    this.height = height;
    this.margin = {
      top: 20,
      right: 10,
      bottom: 10,
      left: 20,
    };
  }

  initialize() {
    this.div = d3.select(this.div).append("div");
    this.svg = this.div.append("svg");
    this.container = this.svg.append("g");
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    this.xScale = d3.scaleLinear();
    this.yScale = d3.scaleBand();

    this.svg.attr("width", this.width).attr("height", this.height);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );

    return this;
  }

  update(data) {
    const categories = [...new Array(data.length)].map((_, i) => i + 1);

    this.xScale
      .domain([0, data[0].length])
      .range([0, this.width - this.margin.left - this.margin.right]);

    this.yScale
      .domain(categories)
      .range([0, this.height - this.margin.top - this.margin.bottom])
      .padding(0.3);

    this.colorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      .range(d3.schemeCategory10);

    this.container
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", this.xScale(0))
      .attr("y", (_, i) => this.yScale(i + 1))
      .attr("width", (d) => this.xScale(d.length))
      .attr("height", this.yScale.bandwidth())
      .attr("fill", (_, i) => (i < 9 ? this.colorScale(i + 1) : "steelblue"));

    this.xAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisTop(this.xScale));

    this.yAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));

    return this;
  }
}
