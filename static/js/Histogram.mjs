export {Histogram};

class Histogram{
    margin={
        top:20, right:20, bottom: 10, left:20
    }
    constructor(svg, width=360, height=600){
        this.svg = svg;
        this.width=width - this.margin.left - this.margin.right;
        this.height=height - this.margin.top - this.margin.bottom;
    }

    initialize(){
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        
        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleBand();

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    update(data){
        const categories = [...new Array(data.length)].map((_,i)=>i+1);
        console.log(categories);

        console.log(data[0].length);

        this.xScale
            .domain([0,data[0].length])
            .range([0,this.width]);

        this.yScale
            .domain(categories)
            .range([0, this.height])
            .padding(0.3);

        this.container.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", this.xScale(0))
            .attr("y", (_,i)=>this.yScale(i+1))
            .attr("width", d => this.xScale(d.length))
            .attr("height", this.yScale.bandwidth())
            .attr("fill", "steelblue");
            
        this.xAxis
            .attr("transform",`translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisTop(this.xScale));
            
        this.yAxis
            .attr("transform",`translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale));
    }
}