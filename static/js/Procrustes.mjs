export { Procrustes };

class Procrustes {
  constructor(data) {
    this.data = data;
  }

  // 좌표들의 평균을 원점으로 위치
  #translation(datum) {
    let [x, y] = [0, 0];
    datum.forEach((d) => {
      x += d["0"];
      y += d["1"];
    });
    x /= datum.length;
    y /= datum.length;

    datum.forEach((d) => {
      d["0"] -= x;
      d["1"] -= y;
    });

    return datum;
  }

  #uniformScaling(datum) {
    let s = 0;
    datum.forEach((d) => {
      s += d["0"] * d["0"];
      s += d["1"] * d["1"];
    });
    s /= datum.length;
    s = Math.sqrt(s);

    datum.forEach((d) => {
      d["0"] /= s;
      d["1"] /= s;
    });

    return datum;
  }

  // https://en.wikipedia.org/wiki/Procrustes_analysis의 rotation 파트에서 theta를 구하는 식을 통해 theta값 return
  #findTheta(base, datum) {
    let [numerator, denominator] = [0, 0];
    let x, y, z, w, theta;

    for (let i = 0; i < datum.length; i++) {
      [x, y, z, w] = [base[i]["0"], base[i]["1"], datum[i]["0"], datum[i]["1"]];
      numerator += w * y - z * x;
      denominator += w * x + z * y;
    }
    theta = Math.atan(numerator / denominator);

    return theta;
  }

  // 찾은 theta를 통해 모든 좌표 theta만큼 회전
  #rotation(datum, theta) {
    let cos, sin, u, v;
    cos = Math.cos(theta);
    sin = Math.sin(theta);

    datum.forEach((d) => {
      u = cos * d["0"] - sin * d["1"];
      v = sin * d["0"] + cos * d["1"];
      d["0"] = u;
      d["1"] = v;
    });

    return datum;
  }

  #shapeComparison(base, datum) {
    // base 데이터와 입력받은 datum의 dissimilarity 측정(using Euclidean distance)
    let diff = 0;
    for (let i = 0; i < base.length; i++) {
      diff +=
        (base[i]["0"] - datum[i]["0"]) * (base[i]["0"] - datum[i]["0"]) +
        (base[i]["1"] - datum[i]["1"]) * (base[i]["1"] - datum[i]["1"]);
    }

    return Math.sqrt(diff);
  }

  #rotation6(datum) {
    // 6도 회전
    let degree = Math.PI / 30;
    this.#rotation(datum, degree);
  }

  #findBestCase(base, datum) {
    // 6도씩 60번 회전해 최고의 케이스를 찾고 그만큼 회전
    let comparisonResult = [];

    for (let i = 0; i < 60; i++) {
      this.#rotation6(datum);
      comparisonResult.push(this.#shapeComparison(base, datum));
    }

    let min = Math.min(...comparisonResult);
    let minIdx = comparisonResult.indexOf(min);

    this.#rotation(datum, (Math.PI / 30) * minIdx);
  }

  run() {
    /*
      random1을 base로 두고 나머지 data를 random1과 가장 가까운 모습으로 회전

      각 데이터 translation and uniform scaling
      -> 각 데이터 별 theta를 구하고 그 각도만큼 회전시킨다.
    */
    let base;

    this.data.forEach((d) => {
      this.#uniformScaling(this.#translation(d));
    });

    base = this.data[1];

    for (let i = 0; i < this.data.length; i++) {
      if (i == 1) continue;
      // this.#rotation(this.data[i], this.#findTheta(base, this.data[i]));
      this.#findBestCase(base, this.data[i]);
    }
  }
}
