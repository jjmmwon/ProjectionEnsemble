class ResultTable {
  constructor(id) {
    this.id = id;
    this.columns = [
      " ",
      "pca",
      "randMean",
      "rand0",
      "rand1",
      "rand2",
      "rand3",
      "rand4",
      "rand5",
      "rand6",
      "rand7",
      "rand8",
      "rand9",
    ];
  }

  update(title, perp, iter, lr, columns) {
    let data, selectedData;
    let [randLoss, randS, randC] = [0, 0, 0];

    // Load selected result data from result json file
    d3.json(
      `https://raw.githubusercontent.com/jjmmwon/FSTSNE/main/result/${title}/${title}_result.json`
    ).then((jsonData) => {
      jsonData.forEach((d) => {
        let hyperparameter = d["Hyperparameter"];
        if (
          perp === String(hyperparameter["perplexity"]) &&
          iter === String(hyperparameter["max_iter"]) &&
          lr === String(hyperparameter["learning_rate"])
        ) {
          selectedData = d;
        }
      });

      data = [
        { " ": { val: "Loss", best: false } },
        { " ": { val: "Steadiness", best: false } },
        { " ": { val: "Cohesiveness", best: false } },
      ];

      let loss = [];
      let steadiness = [];
      let cohesiveness = [];

      [loss[0], steadiness[0], cohesiveness[0]] = [
        +selectedData["pca"][0]["Loss"].toFixed(4),
        +selectedData["pca"][0]["Steadiness"].toFixed(4),
        +selectedData["pca"][0]["Cohesiveness"].toFixed(4),
      ];

      selectedData["random"].forEach((d) => {
        loss.push(+d["Loss"].toFixed(4));
        steadiness.push(+d["Steadiness"].toFixed(4));
        cohesiveness.push(+d["Cohesiveness"].toFixed(4));

        randLoss += +d["Loss"].toFixed(4);
        randS += +d["Steadiness"].toFixed(4);
        randC += +d["Cohesiveness"].toFixed(4);
      });

      // push mean of the random data as second element
      loss.splice(1, 0, +(randLoss / 10).toFixed(4));
      steadiness.splice(1, 0, +(randS / 10).toFixed(4));
      cohesiveness.splice(1, 0, +(randC / 10).toFixed(4));

      let min_loss = Math.min(...loss);
      let max_st = Math.max(...steadiness);
      let max_co = Math.max(...cohesiveness);

      min_loss = loss.indexOf(min_loss);
      max_st = steadiness.indexOf(max_st);
      max_co = cohesiveness.indexOf(max_co);

      for (let i = 0; i < loss.length; i++) {
        data[0][this.columns[i + 1]] = { val: loss[i], best: min_loss === i };
        data[1][this.columns[i + 1]] = {
          val: steadiness[i],
          best: max_st === i,
        };
        data[2][this.columns[i + 1]] = {
          val: cohesiveness[i],
          best: max_co === i,
        };
      }
      // Update table
      // table을 만들기 위해 data를 재가공 했는데 d3에서 제공하는 다른 방법이 있을까요?

      let table = d3.select(this.id);

      let rows = table.selectAll("tr").data(data).join("tr");

      rows
        .selectAll("td")
        .classed("best", false)
        .data((d) => this.columns.map((c) => d[c]))
        .join("td")
        .text((d) => d["val"])
        .classed("best", (d) => d["best"]);
    });
  }
}

export { ResultTable };
