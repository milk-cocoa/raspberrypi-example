(function(global){ 
    global.createChart = createChart;

    function createChart() {
	    this.datas = [];
    }

    createChart.prototype.setSvg = function(wrapper_id) {
    	this.wrapper_id =  wrapper_id || 'svg-chart';
    }

    createChart.prototype.setDatas = function(datas) {
    	this.datas = datas;
    }

    createChart.prototype.setDatastore = function(datastore) {
    	function checkKey(elem) {
    		var values = elem.value;
    		for(var k in values) {
    			if(typeof values[k] == "number") {
    				return k;
    			}
    		}
    		return null;
    	}
    	var key = checkKey(datastore[0]);
    	var datas = datastore.map(function(e) {
    		var values = e.value;
    		return { timestamp : e.timestamp, value : values[key]};
    	});
    	this.setDatas(datas);
    }

    createChart.prototype.height = function(v) {
    	if(v) {
    		var svgElement = document.getElementById(this.elem_id);
    		svgElement.setAttribute("height", v);
    	}else{
    		var svgElement = document.getElementById(this.elem_id);
    		var h = svgElement.getAttribute("height");
    		return h.substr(0, h.length - 2);
    	}
    }
    createChart.prototype.draw = function() {
		var margin = {top: 20, right: 20, bottom: 30, left: 50},
		    width = 840 - margin.left - margin.right,
		    height = 320 - margin.top - margin.bottom;

		var parseDate = d3.time.format("%y-%m-%d-%H");

		var xScale = d3.time.scale()
		    .range([0, width]);

		var y = d3.scale.linear()
		    .range([height, 0]);

	    this.xScale = xScale;
	    this.y = y;

		var xAxis = d3.svg.axis()
		    .scale(xScale)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

	    this.xAxis = xAxis;
	    this.yAxis = yAxis;

		var line = d3.svg.line()
		    .x(function(d) {
		    	return xScale(d.date);
		    })
		    .y(function(d) {
		    	return y(d.value);
		    });

		this.line = line;

		var svg = d3.select("#" + this.wrapper_id).append("svg")
		    .attr("class", "chart")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		this.svg = svg;

		function get_data(data) {
		  var data2 = data.map(function(d) {
		  	return {
		  		date : new Date(d.timestamp),
		  		value : d.value
		  	};
		  });

		  xScale.domain(d3.extent(data2, function(d) { return d.date; }));
		  y.domain(d3.extent(data2, function(d) { return d.value; }));

		  svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Value");

		  svg.append("path")
		      .datum(data2)
		      .attr("class", "line")
		      .attr("d", line);
		}

    	get_data(this.datas);
    }

    createChart.prototype.update = function() {
		var data2 = this.datas.map(function(d) {
			return {
				date : new Date(d.timestamp),
				value : d.value
			};
		});

		this.xScale.domain(d3.extent(data2, function(d) { return d.date; }));
		this.y.domain(d3.extent(data2, function(d) { return d.value; }));

		// Select the section we want to apply our changes to
		this.svg = d3.select("#" + this.wrapper_id).transition();

		// Make the changes
		this.svg.select(".line")   // change the line
		    .duration(750)
		    .attr("d", this.line(data2));
		this.svg.select(".x.axis") // change the x axis
		    .duration(750)
		    .call(this.xAxis);
		this.svg.select(".y.axis") // change the y axis
		    .duration(750)
		    .call(this.yAxis);

    }

  
  
}(window))
