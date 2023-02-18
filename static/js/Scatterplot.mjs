export { Scatterplot };
class Scatterplot {
  constructor(svg, width = 370, height = 370) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.margin = {
      top: 30,
      right: 20,
      bottom: 20,
      left: 30,
    };
    this.brushedSet = new Set();
    this.handlers = {};
    this.isClassed = false;
  }

  // initialize by making title, brush and groups of scatterplot
  initialize() {
    let svgTitle = this.svg.substr(1);

    this.svg = d3.select(this.svg);
    this.legendDiv = d3.select("#legend");
    this.container = this.svg.append("g");
    this.title = this.svg.append("text");
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    this.xScale = d3.scaleLinear();
    this.yScale = d3.scaleLinear();

    this.svg.attr("width", this.width).attr("height", this.height);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );

    // this.title
    //   .text(svgTitle)
    //   .attr(
    //     "transform",
    //     `translate(${
    //       this.width / 2
    //     },${35})`
    //   )
    //   .attr("text-anchor", "middle")
    //   .attr("font-size", "1rem")

    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [
          this.width - this.margin.left - this.margin.right,
          this.height - this.margin.top - this.margin.bottom,
        ],
      ])
      .on("end", (event) => {
        this.brushCircles(event);
      });

    this.container.call(this.brush);
  }

  //update event
  update(data, pMax, pMin) {
    this.data = data;
    this.isClassed = "class" in this.data[0] ? true : false;

    this.xScale
      .domain([pMin * 1.1, pMax * 1.1])
      .range([0, this.width - this.margin.left - this.margin.top]);

    this.yScale
      .domain([pMin * 1.1, pMax * 1.1])
      .range([this.height - this.margin.top - this.margin.bottom, 0]);

    if (this.isClassed) {
      this.classColorScale = d3
        .scaleOrdinal()
        .domain([...new Set(this.data.map((d) => d["class"]))])
        .range(d3.schemeCategory10);
    }

    this.frqSubgColorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      .range(d3.schemeCategory10);

    this.circles = this.container
      .selectAll("circle")
      .data(this.data)
      .join("circle");

    this.circles
      .attr("transform", (d) => {
        return (
          "translate(" + this.xScale(d["0"]) + "," + this.yScale(d["1"]) + ")"
        );
      })
      .attr("fill", "Steelblue")
      .attr("opacity", 0.4)
      .attr("r", 2);

    this.xAxis
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.height - this.margin.bottom})`
      )
      .transition()
      .call(d3.axisBottom(this.xScale));

    this.yAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .transition()
      .call(d3.axisLeft(this.yScale));
  }

  updateBrushSet(brushedIndex) {
    brushedIndex.forEach((val) => {
      this.brushedSet.add(val);
    });

    this.circles.classed("brushed", (d) => this.brushedSet.has(d["idx"]));
  }

  resetBrush() {
    this.brushedSet = new Set();
    this.circles.classed("brushed", false);
  }

  isBrushed(d, selection) {
    if (!selection) return;
    let [[x0, y0], [x1, y1]] = selection;
    let x = this.xScale(d["0"]);
    let y = this.yScale(d["1"]);

    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  brushCircles(event) {
    let selection = event.selection,
      brushedIndex = new Set(
        this.data
          .filter((d) => this.isBrushed(d, selection))
          .map((d) => d["idx"])
      );
    if (this.handlers.brush) this.handlers.brush(brushedIndex);
  }

  on(eventType, handler) {
    this.handlers[eventType] = handler;
  }

  updateFrqSubG(frqSubG) {
    let color;
    this.circles.transition().attr("fill", "steelblue");
    frqSubG.forEach((fs, i) => {
      if (i < 9) {
        color = this.frqSubgColorScale(i + 1);
        this.circles
          .filter((d) => fs.includes(Number(d["idx"])))
          .transition()
          .attr("fill", color);
      }
    });
  }

  changeMode(mode) {
    if (mode == "class") {
      this.circles.attr("fill", (d) => this.classColorScale(d["class"]));
    } else {
      this.circles.attr("fill", "Steelblue");
      this.frqSubG.forEach((fs, i) => {
        if (i < 9) {
          let color = this.frqSubgColorScale(i + 1);
          this.circles
            .filter((d) => fs.includes(Number(d["idx"])))
            .transition()
            .attr("fill", color);
        }
      });
    }
  }
}
