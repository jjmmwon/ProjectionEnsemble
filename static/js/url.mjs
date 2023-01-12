let url = {
  urlList: [],
  indexList: [
    "PCA",
    "Random0",
    "Random1",
    "Random2",
    "Random3",
    "Random4",
    "Random5",
    "Random6",
    "Random7",
    "Random8",
    "Random9",
  ],

  // Update urlList
  update(title, perp, iter, lr, minSup) {
    this.urlList = [];

    this.urlList.push(this.makeURL(title, perp, iter, lr, "pca"));
    for (let i = 0; i < 10; i++) {
      this.urlList.push(this.makeURL(title, perp, iter, lr, "random", i));
    }
    this.urlList.push(
      `https://raw.githubusercontent.com/jjmmwon/FSTSNE/main/result/${title}/${title}_result.json`
    );
    this.urlList.push(
      //`http://127.0.0.1:5500/mw_dir/FS_TSNE/result/${title}/perplexity_${perp}_max_iter_${iter}_learning_rate_${lr}_/${title}_FSM.json`
      `https://raw.githubusercontent.com/jjmmwon/FSTSNE/main/result/${title}/perplexity_${perp}_max_iter_${iter}_learning_rate_${lr}_/${title}_min_sup_${minSup}_FSM.json`
    );
  },

  // make csv url using base url
  makeURL(title, perp, iter, lr, init, num = 0) {
    return `https://raw.githubusercontent.com/jjmmwon/FSTSNE/main/result/${title}/perplexity_${perp}_max_iter_${iter}_learning_rate_${lr}_/${title}_${init}_embedded${
      !num ? "" : num
    }.csv`;
  },
};

export { url };
