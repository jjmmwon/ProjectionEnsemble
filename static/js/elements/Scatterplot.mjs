export { Scatterplot };
class Scatterplot {
  constructor(id, div, width, height, method, params, brushedSet) {
    this.id = id
    this.div = d3.select(div).append("div");
    this.margin = {
      top: 15,
      right: 20,
      bottom: 30,
      left: 30,
    };
    this.width = width - this.margin.left - this.margin.right;
    this.height = height -this.margin.top - this.margin.bottom;
    this.method = method;
    this.params = params;
    this.brushedSet = brushedSet;
    this.handlers = {};
  }

  initialize() {
    this.div
      .attr("class", "scatterplot p-1 m-1 justify-content-center")
      .style("position", "relative");

    this.header = this.div
      .append("div")
      .attr("class", "d-flex justify-content-between");

    this.hpramDiv = this.div
      .append("div")
      .attr("class", "d-flex justify-content-evenly");

    this.drawHeader();

    // this.div
    //   .append("div")
    //   .style("position", "absolute")
    //   .style("width","100%")
    //   .style("height","90%")
    //   .attr("class","loading-section d-flex justify-content-center align-items-center")
    //   .append("div")
    //   .attr("class", "spinner-border")
    //   .attr("role", "status")
    //   .append("span")
    //   .attr("class", "visually-hidden");


    this.svg = this.div.append("svg");
    this.container = this.svg.append("g");

    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );

    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [ this.width, this.height],
      ])
      .on("end", (event) => {
        if(!event.sourceEvent) return;        
        this.brushCircles(event);
      });
    return this;
  }

  drawHeader(){
    this.header
      .append("div")
      .attr("class", "fs-6 fw-bold ms-2 mb-1")
      .text(`${this.method}${this.id}`)
    
    this.delBtn = this.header
      .append("i")
      .attr("class", "bi bi-x-circle me-2 deleteBtn");

    this.delBtn
      .on("mouseover",()=>{
        this.delBtn
          .classed("bi-x-circle", false)
          .classed("bi-x-circle-fill", true);
      })
      .on("mouseout", ()=>{
        this.delBtn
          .classed("bi-x-circle-fill", false)
          .classed("bi-x-circle", true);
      });

    for(const key in this.params){
      this.hpramDiv
        .append("span")
        .attr("class", "badge rounded-pill bg-warning text-dark")
        .text(`${key}: ${this.params[key]}`);
    }

    return this;
  }

  //update event
  update(data) {
    // d3.select(".loading-section")
    //   .remove();

    this.data = data;

    let pMax = this.data[0]["0"],
        pMin = this.data[0]["0"];

    this.data.forEach((d) => {
      pMax = pMax < d["0"] ? d["0"] : pMax;
      pMin = pMin > d["0"] ? d["0"] : pMin;
      pMax = pMax < d["1"] ? d["1"] : pMax;
      pMin = pMin > d["1"] ? d["1"] : pMin;
    });

    // set scales
    this.xScale = d3.scaleLinear()
      .domain([pMin * 1.1, pMax * 1.1])
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .domain([pMin * 1.1, pMax * 1.1])
      .range([this.height, 0]);

    this.classColorScale = d3
      .scaleOrdinal()
      .domain([...new Set(this.data.map((d) => d["class"]))])
      .range(d3.schemeCategory10);

    this.frqSubgColorScale = d3
      .scaleOrdinal()
      .domain([...new Array(10)].map((_,i)=>i))
      .range(d3.schemeCategory10);

    // append points
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
      .attr("fill", (d)=> this.classColorScale(d["class"]))
      .attr("opacity", 0.4)
      .attr("r", 2.3);
    
    this.container.call(this.brush);

    // add axes
    this.xAxis
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.height + this.margin.top})`
      )
      .transition()
      .call(d3.axisBottom(this.xScale));

    this.yAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .transition()
      .call(d3.axisLeft(this.yScale));
    
    
    return this;
  }

  isBrushed(d, selection) {
    if (!selection) return;
    let [[x0, y0], [x1, y1]] = selection;
    let x = this.xScale(d["0"]);
    let y = this.yScale(d["1"]);

    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  hideBrush() {
    this.container.call(this.brush.clear);
  }

  brushCircles(event) {
    let selection = event.selection,
      brushedSet = selection ? new Set(
        this.data
          .filter((d) => this.isBrushed(d, selection))
          .map((d) => d.idx)
      ) : new Set();
    
    if (this.handlers.brush){
      this.handlers.brush(brushedSet);
    } 
  }

  on(eventType, handler) {
    this.handlers[eventType] = handler;
    return this;
  }
  
  highlightBrushed() {
    this.circles
      .classed("brushed", (d) => this.brushedSet.has(d["idx"]))
      .attr("opacity", 0.8);
  }

  drawFS(data){
    data.FSM.forEach((d) => {
      if(d.k==5 && d.min_support == 8){
        this.FS = d.FS;
      }
    });

    Object.keys(this.FS).forEach((key,i) => {
      if(key == "outliers") return false;
      if(i>10) return false;
      this.circles
          .filter((d) => this.FS[key].includes(Number(d["idx"])))
          .attr("fill", (_)=>this.frqSubgColorScale(i))
          .attr("r", 2.3)
          .attr("opacity", 0.7);

    })
    

  }
}
