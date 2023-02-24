export{scatterplots}

let scatterplots= {
    scatterplot : [],

    append(sc){
        sc.initialize();
        sc.on("brush", (brushedIndex) => {
            scatterplots.forEach(sc2 =>{
              sc2.updateBrushSet(brushedIndex);
            });
        });
        this.scatterplot.push(sc);

        sc.delBtn.on("click", ()=>{
            sc.div.remove()
            this.scatterplot.forEach(
                (d,i)=> d == sc ? this.scatterplot.splice(i,1):null
            );
        })
    },

    update(sc, data){
        sc.update(data);
    },

    length(){
        return this.scatterplot.length;
    }
}