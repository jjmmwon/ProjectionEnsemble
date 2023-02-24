export { Scatterplot };
class Scatterplot {
  constructor(div, width, height, method, hyperparameters) {
    this.div = d3.select(div).append("div");
    this.width = width;
    this.height = height;
    this.method = method;
    this.hyperparameters = hyperparameters;
    this.margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 30,
    };
    this.brushedSet = new Set();
    this.handlers = {};
  }

  initialize() {
    this.div
      .classed("scatterplot p-1 m-1 rounded-3 border border-dark justify-content-center", true)
      .style("position", "relative");

    this.header = this.div
      .append("div")
      .classed("d-flex justify-content-between", true);

    this.hpramDiv = this.div
      .append("div");

    this.drawHeader();

    this.div
      .append("div")
      .style("position", "absolute")
      .style("width","100%")
      .style("height","90%")
      .classed("d-flex justify-content-center align-items-center", true)
      .append("div")
      .classed("spinner-border", true)
      .attr("role", "status")
      .append("span")
      .classed("visually-hidden", true);


    this.svg = this.div.append("svg");
    this.container = this.svg.append("g");

    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    this.svg.attr("width", this.width).attr("height", this.height);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );

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

  drawHeader(){
    this.header
      .append("div")
      .classed("fs-6 fw-bold ms-2", true)
      .text(`${this.method}`);
    
    this.delBtn = this.header
      .append("i")
      .classed("bi bi-x-circle me-2 deleteBtn", true);

    this.delBtn
      .on("mouseover",()=>{
        console.log();
        this.delBtn
          .classed("bi-x-circle", false)
          .classed("bi-x-circle-fill", true);
      })
      .on("mouseout", ()=>{
        this.delBtn
          .classed("bi-x-circle-fill", false)
          .classed("bi-x-circle", true);
      });

    this.hpramDiv
      .append("div")
      .classed("hyperparameters", true)
      .text( this.method == "t-SNE" ? 
          `init: ${this.hyperparameters.init}, ` +
          `perp: ${this.hyperparameters.perp}, ` +
          `iter: ${this.hyperparameters.iter}, ` +
          `  lr: ${this.hyperparameters.lr}`
          : `n_neighbors: ${this.hyperparameters.n_neighbors}, ` +
            `min_dist: ${this.hyperparameters.min_dist}`
      );
  }

  //update event
  update(data) {
    d3.select(".spinner-border")
      .remove();

    this.data = data;

    let pMax = data.embedding[0]["0"],
        pMin = data.embedding[0]["0"];

    data.embedding.forEach((d) => {
      pMax = pMax < d["0"] ? d["0"] : pMax;
      pMin = pMin > d["0"] ? d["0"] : pMin;
      pMax = pMax < d["1"] ? d["1"] : pMax;
      pMin = pMin > d["1"] ? d["1"] : pMin;
    });

    // set scales
    this.xScale = d3.scaleLinear()
      .domain([pMin * 1.1, pMax * 1.1])
      .range([0, this.width - this.margin.left - this.margin.top]);

    this.yScale = d3.scaleLinear()
      .domain([pMin * 1.1, pMax * 1.1])
      .range([this.height - this.margin.top - this.margin.bottom, 0]);

    this.classColorScale = d3
      .scaleOrdinal()
      .domain([...new Set(this.data.embedding.map((d) => d["class"]))])
      .range(d3.schemeCategory10);

    this.frqSubgColorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      .range(d3.schemeCategory10);

    // append points
    this.circles = this.container
      .selectAll("circle")
      .data(this.data.embedding)
      .join("circle");

    this.circles
      .attr("transform", (d) => {
        return (
          "translate(" + this.xScale(d["0"]) + "," + this.yScale(d["1"]) + ")"
        );
      })
      .attr("fill",(d)=> this.classColorScale(d["class"]))
      .attr("opacity", 0.6)
      .attr("r", 2);
    
    // add axes
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
  
  updateBrushSet(brushedIndex) {
    brushedIndex.forEach((val) => {
      this.brushedSet.add(val);
    });

    this.circles.classed("brushed", (d) => this.brushedSet.has(d["idx"]));
  }

  resetBrushSet() {
    this.brushedSet = new Set();
    this.circles.classed("brushed", false);
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
}
