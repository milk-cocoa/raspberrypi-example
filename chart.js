(function(global){

  global.createChart = createChart;

  function createChart() {
     this.datas = [];
   }

  // datastoreのデータを、描画用のデータに変換する
  function get_graph_data(data){
    return data.map(function(d) {
      return {
        date : new Date(d.timestamp),
        value : d.value
      };
    });
  }

  // グラフを描画するdivのidを指定する
  createChart.prototype.setSvg = function(wrapper_id) {
    this.wrapper_id =  wrapper_id || 'svg-chart';
  }

  // 描画するデータをセット／更新
  createChart.prototype.setDatas = function(datas) {
    this.datas = datas;
  }

  // 初期化
  createChart.prototype.init = function() {

    // 描画範囲に関する変数
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 1040 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    // x軸のスケール（時間）。レンジ(出力範囲)の指定
    var xScale = d3.time.scale()
                  .range([0, width]);

    // y軸のスケール（センサーデータの値）。レンジ(出力範囲)の指定
    var yScale = d3.scale.linear()
                  .range([height, 0]);

    // スケールを元にx軸の設定（入力値の範囲はまだ指定していない。データを受け取ってから指定する）
    var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

    // スケールを元にy軸の設定
    var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left");

    // SVG要素の作成（attrとかはテンプレ）
    var svg = d3.select("#" + this.wrapper_id).append("svg")
              .attr("class", "chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 折れ線グラフの設定。xに時間、yにセンサーデータの値を設定。
    var line = d3.svg.line()
                .x(function(d) {
                  // xスケールでマップされた時間を返す
                  return xScale(d.date);
                })
                .y(function(d) {
                  // yスケールでマップされたセンサーデータの値を返す
                  return yScale(d.value);
                });


    // もろもろをメンバ変数に
    this.height = height;
    this.margin = margin;
    this.width = width;
    this.xScale = xScale;
    this.yScale = yScale;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.svg = svg;
    this.line = line;
  }


  // 最初の描画
  createChart.prototype.initialDraw = function() {

    var dataset = get_graph_data(this.datas);

    // ドメイン（入力値の範囲）の設定、extentメソッドでdatasetの最小と最大を返す
    this.xScale.domain(d3.extent(dataset, function(d) { return d.date; }));
    this.yScale.domain(d3.extent(dataset, function(d) { return d.value; }));

    // x軸の描画
    this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);

    // y軸の描画
    this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Value");

    // 折れ線の描画
    this.svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("d", this.line);
  }


  // 更新した際の描画
  createChart.prototype.updateDraw = function() {

    var dataset = get_graph_data(this.datas);

    // ドメイン（入力値の範囲）の更新
    this.xScale.domain(d3.extent(dataset, function(d) { return d.date; }));
    this.yScale.domain(d3.extent(dataset, function(d) { return d.value; }));

    // アニメーションしますよ、という宣言
    this.svg = d3.select("#" + this.wrapper_id).transition();

    this.svg.select(".line")   // 折れ線を
        .duration(750) // 750msで
        .attr("d", this.line(dataset)); // （新しい）datasetに変化させる描画をアニメーション

    this.svg.select(".x.axis") // x軸を
        .duration(750) // 750msで
        .call(this.xAxis); // （domainの変更によって変化した）xAxisに変化させる描画をアニメーション

    this.svg.select(".y.axis") // y軸を
        .duration(750) // 750msで
        .call(this.yAxis); // （domainの変更によって変化した）yAxisに変化させる描画をアニメーション
  }

}(window))
