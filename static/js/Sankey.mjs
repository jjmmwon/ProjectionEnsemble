export {Sankey};

class Sankey{
    constructor(div, width, height){
        this.div = d3.select(div).append(div);
        this.width = width;
        this.height = height;
        this.margin = {top:10, right:10, bottom:10, left:10};
        
    }



}