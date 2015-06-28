(function(global){

  global.createBarChart = createBarChart;

  var parseDate = d3.time.format("%b-%d-%Y").parse;

  function createBarChart() {
     this.datas = [];
   }

  // datastoreのデータを、描画用のデータに変換する
  function get_graph_data(data){
    return data.map(function(d) {
      return {
        // StringをDateに変換
        date : parseDate(d.date),
        value : d.value
      };
    });
  }

  // グラフを描画するdivのidを指定する
  createBarChart.prototype.setSvg = function(wrapper_id) {
    this.wrapper_id =  wrapper_id || 'svg-chart';
  }

  // 描画するデータをセット／更新
  createBarChart.prototype.setDatas = function(datas) {
    this.datas = datas;
  }

  // 初期化
  createBarChart.prototype.init = function() {

    var dataset = get_graph_data(this.datas);

    // 描画範囲に関する変数
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 1040 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    // x軸のスケール（時間）。レンジ(出力範囲)の指定
    var xScale = d3.time.scale()
                  .range([width/dataset.length/2, width-width/dataset.length/2]);

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



    // もろもろをメンバ変数に
    this.height = height;
    this.margin = margin;
    this.width = width;
    this.xScale = xScale;
    this.yScale = yScale;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.svg = svg;
  }


  // 描画
  createBarChart.prototype.draw = function() {

    var that = this;

    var dataset = get_graph_data(this.datas);

    // ドメイン（入力値の範囲）の設定、extentメソッドでdatasetの最小と最大を返す
    this.xScale.domain(d3.extent(dataset, function(d) { return d.date; }));
    this.yScale.domain([0, d3.max(dataset, function(d) { return d.value; })]);

    var bars = this.svg.selectAll(".bar")
        .data(dataset);

    bars.exit().remove();

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

    // 棒の描画
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("width", that.width / dataset.length)
        .attr("x", function(d) { return that.xScale(d.date) - (that.width/dataset.length)/2; })
        .attr("y", that.height)
        .attr("height", 0)
        .transition().duration(1000)
        .attr("y", function(d) { return that.yScale(d.value); })
        .attr("height", function(d) { return that.height - that.yScale(d.value);});

  }


}(window))
