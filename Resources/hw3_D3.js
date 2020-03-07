// Constants
const DINGUS_PRICE = 14.25;
const WIDGET_PRICE = 9.99;
const ZERO_FORMAT = '0.00';
const DEBUG = true; // Where might this flag be used? (It's not mandatory)

// Global store (What else would you need here?)
let store = {
  orderHistory: generateEntries(),
  currentID: generateEntries().length,
  totalDingusQuantity: 0,
  totalWidgetQuantity: 0,
  totalSales: 0,
  currentDingusQuantity: 0,
  currentWidgetQuantity: 0,
  currentSales: 0,
};

function generateEntries() {
	// Returns an orderHistory array
	// [ID#, Date, Dingus quantity, Widget quantity]
	return [
	  [1, '01/01/2020', 1, 1], 
	  [2, '01/02/2020', 2, 2]
	]
}

function insertEntries(array) {
	tbody = document.querySelector("tbody")
	for (var i = 0; i < array.length; i++) {
		var row = tbody.insertRow(-1);
		for (var j = 0; j < array[i].length; j++) {
			var cell = row.insertCell(j);
			let dingusSales = array[i][array[i].length - 2] * DINGUS_PRICE;
			let widgetSales = array[i][array[i].length - 1] * WIDGET_PRICE;
			cell.innerHTML = array[i][j]
			if (j == array[i].length - 1) {
				row.insertCell(array[i].length).innerHTML = '$' + (dingusSales + widgetSales).toFixed(2);
				store.totalSales += (dingusSales + widgetSales);
			}
		}
		store.totalDingusQuantity += Number(array[i][array[i].length - 2]);
		store.totalWidgetQuantity += Number(array[i][array[i].length - 1]);
	}
	insertScoreboard([store.totalDingusQuantity, store.totalWidgetQuantity, (store.totalSales).toFixed(2)]);
}

function insertScoreboard(array) {
	var dingus = document.getElementById('grid-number-1');
	dingus.innerHTML = array[0];
	var widget = document.getElementById('grid-number-2');
	widget.innerHTML = array[1];
	var total = document.getElementById('grid-number-3');
	total.innerHTML = '<span>$</span>' + array[2];
}

function dingusTotalPrice(quantity) {
	if (quantity < 0) {
		return;
	}
	var dField = document.getElementById('dingusField').value;
	var wField = document.getElementById('widgetField').value;
	if ((dField == 0 && wField == 0) || (dField < 0) || (typeof dField != "number")) {
		document.getElementsByClassName('button-success pure-button')[0].disabled = true;
	}
	if (quantity > 0) {
		document.getElementsByClassName('button-success pure-button')[0].disabled = false;
	}
	var field = document.getElementById('dingusTotalField');
	field.value = quantity * DINGUS_PRICE;
	updateTotal(Number(quantity * DINGUS_PRICE), Number(document.getElementById('widgetTotalField').value));
	store.currentDingusQuantity = quantity;
}

function widgetTotalPrice(quantity) {
	if (quantity < 0) {
		return 0;
	}
	var dField = document.getElementById('dingusField').value;
	var wField = document.getElementById('widgetField').value;
	if ((dField == 0 && wField == 0) || (wField < 0) || (typeof wField != "number")) {
		document.getElementsByClassName('button-success pure-button')[0].disabled = true;
	}
	if (quantity > 0) {
		document.getElementsByClassName('button-success pure-button')[0].disabled = false;
	}
	var field = document.getElementById('widgetTotalField');
	field.value = quantity * WIDGET_PRICE;	
	updateTotal(Number(document.getElementById('dingusTotalField').value), Number(quantity * WIDGET_PRICE));
	store.currentWidgetQuantity = quantity;
	
}

function updateTotal(quantity1, quantity2) {
	var field = document.getElementById('totalField');
	field.value = (quantity1 + quantity2).toFixed(2);
	store.currentSales = (quantity1 + quantity2).toFixed(2);
}

function appendRow() {
	store.currentID += 1;
	var d = new Date();
  	var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
	arr = [store.currentID, month+"/"+date+"/"+year, Number(store.currentDingusQuantity), 
		   Number(store.currentWidgetQuantity)];
	(store.orderHistory).push(arr);
	insertEntries([arr]);
	updateChart();
	clearForm();
	saveData();
}

function updateChart() {

	d3.selectAll("svg").remove();
	var width = 300;
	var height = 300;
	var margin = 40;

	var radius = Math.min(width, height) / 2 - margin
	var svg = d3.select('#d3-chart-2')
				.append("svg")
				.attr("width", '100%')
				.attr("height", '100%')
				.attr('viewBox','0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height))
				.attr('preserveAspectRatio', 'xMinYMin')
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	var data = {"Dingus": Number((store.totalDingusQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1)),
			    "Widget": Number((store.totalWidgetQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1))}

	var color = d3.scaleOrdinal()
				  .domain(data)
				  .range(["lightskyblue", "limegreen"])

	var pie = d3.pie()
				.value(function(d) {return d.value; })
		
	var data_ready = pie(d3.entries(data))

	var arcGenerator = d3.arc()
		.innerRadius(0)
		.outerRadius(radius)

	svg.selectAll('whatever')
	   .data(data_ready)
	   .enter()
	   .append('path')
	   .attr('d', arcGenerator)
		.attr('fill', function(d){ return(color(d.data.key)) })
		.attr("stroke", "black")
		.style("stroke-width", "2px")
		.style("opacity", 0.7)

	svg.selectAll('whatever')
	   .data(data_ready)
	   .enter()
	   .append('text')
	   .text(function(d){ return d.data.key + ": " + d.data.value + "% "})
	   .attr("transform", function(d) { 
		   return "translate(" + arcGenerator.centroid(d) + ")";  
		})
	   .style("text-anchor", "middle")
	   .style("font-size", 10)	
	  

	// Stacked bar chart

	d3.select("d3-chart-1").html("");
	
	var dataArray = []
			
	for (var i = 0; i < store.orderHistory.length; i++) {
		dataArray.push({"Order": i+1, "Dingus": Number(store.orderHistory[i][2]), "Widget": Number(store.orderHistory[i][3])})
	}

	var StackedBarChart = {
		draw: function(config) {
			me = this,
			domEle = config.element,
			stackKey = config.key,
			data = config.data,
			margin = {top: 20, right: 20, bottom: 30, left: 50},
			width = 550 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom,
			xScale = d3.scaleBand().range([0, width]).padding(0.1),
			yScale = d3.scaleLinear().range([height, 0]),
			color = d3.scaleOrdinal().range(["lightskyblue", "limegreen"]),
			xAxis = d3.axisBottom(xScale),
			yAxis =  d3.axisLeft(yScale),
			svg = d3.select("#"+domEle).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top+10 + margin.bottom+10)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
			var newCategories = []
			for (var i = 1; i < store.currentID + 1; i++) {
				newCategories.push(i)
			}
			
			var newDingusData = []
			var newWidgetData = []
			for (var i = 0; i < store.orderHistory.length; i++) {
				newDingusData.push(Number(store.orderHistory[i][2]))
				newWidgetData.push(Number(store.orderHistory[i][3]))
			}

			var stack = d3.stack()
				.keys(stackKey)
				.order(d3.stackOrderNone)
				.offset(d3.stackOffsetNone);
		
			var layers= stack(data);
				xScale.domain(data.map(function(d) { return d.Order; }));
				yScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[0] + d[1]; }) ]).nice();
	
			var layer = svg.selectAll(".layer")
				.data(layers)
				.enter().append("g")
				.attr("class", "layer")
				.style("fill", function(d, i) { return color(i); });
	
			  layer.selectAll("rect")
				  .data(function(d) { return d; })
				  .enter().append("rect")
				  .attr('class', 'bar')
				  .attr("x", function(d) { return xScale((d.data.Order)); })
				  .attr("y", function(d) { return yScale(d[1]); })
				  .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]) -1; })
				  .attr("width", xScale.bandwidth())
			.on('click', function(d, i) {
			  d3.selectAll('.bar').classed('selected', false);
			  d3.select(this).classed('selected', true);
			});
	
				svg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + (height+5) + ")")
				.call(xAxis);
	
				svg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate(0,0)")
				.call(yAxis);							
		}
	}
	
		var key = ["Dingus", "Widget"];
		StackedBarChart.draw({
			data: dataArray,
			key: key,
			element: 'd3-chart-1'
		});
}


function clearForm() {
	var dingusField = document.getElementById('dingusField');
	var widgetField = document.getElementById('widgetField');
	var dingusTotalField = document.getElementById('dingusTotalField');
	var widgetTotalField = document.getElementById('widgetTotalField');
	var totalField = document.getElementById('totalField');
	dingusField.value = 0;
	widgetField.value = 0;
	dingusTotalField.value = 0;
	widgetTotalField.value = 0;
	totalField.value = 0;
	document.getElementsByClassName('button-success pure-button')[0].disabled = true;
}

function loadData() {
	for (var i = 0; i < localStorage.length; i++) {
		var currentKey = localStorage.key(i).toString();
		var currentVal = JSON.parse(localStorage.getItem(currentKey));
		console.log(currentKey + ": " + currentVal);
		store[currentKey] = currentVal;		
	}
	insertEntries(store.orderHistory);
	var width = 300;
	var height = 300;
	var margin = 40;

	var radius = Math.min(width, height) / 2 - margin
	var svg = d3.select('#d3-chart-2')
				.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr('viewBox','0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height))
				.attr('preserveAspectRatio', 'xMinYMin')
				.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	var data = {"Dingus": Number((store.totalDingusQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1)),
			    "Widget": Number((store.totalWidgetQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1))}

	var color = d3.scaleOrdinal()
				  .domain(data)
				  .range(["lightskyblue", "limegreen"])

	var pie = d3.pie()
				.value(function(d) {return d.value; })
		
	var data_ready = pie(d3.entries(data))

	var arcGenerator = d3.arc()
		.innerRadius(0)
		.outerRadius(radius)

	svg.selectAll('whatever')
	   .data(data_ready)
	   .enter()
	   .append('path')
	   .attr('d', arcGenerator)
		.attr('fill', function(d){ return(color(d.data.key)) })
		.attr("stroke", "black")
		.style("stroke-width", "2px")
		.style("opacity", 0.7)

	svg.selectAll('whatever')
	   .data(data_ready)
	   .enter()
	   .append('text')
	   .text(function(d){ return d.data.key + ": " + d.data.value + "% "})
	   .attr("transform", function(d) { 
		   return "translate(" + arcGenerator.centroid(d) + ")";  
		})
	   .style("text-anchor", "middle")
	   .style("font-size", 10)	

	
	
	var StackedBarChart = {
		draw: function(config) {
			me = this,
			domEle = config.element,
			stackKey = config.key,
			data = config.data,
			margin = {top: 20, right: 20, bottom: 30, left: 50},
			width = 550 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom,
			xScale = d3.scaleBand().range([0, width]).padding(0.1),
			yScale = d3.scaleLinear().range([height, 0]),
			color = d3.scaleOrdinal().range(["lightskyblue", "limegreen"]),
			xAxis = d3.axisBottom(xScale),
			yAxis =  d3.axisLeft(yScale),
			svg = d3.select("#"+domEle).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top+10 + margin.bottom+10)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
			
			var stack = d3.stack()
				.keys(stackKey)
				.order(d3.stackOrderNone)
				.offset(d3.stackOffsetNone);
		
			var layers= stack(data);
				xScale.domain(data.map(function(d) { return d.Order; }));
				yScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[0] + d[1]; }) ]).nice();
	
			var layer = svg.selectAll(".layer")
				.data(layers)
				.enter().append("g")
				.attr("class", "layer")
				.style("fill", function(d, i) { return color(i); });
	
			  layer.selectAll("rect")
				  .data(function(d) { return d; })
				  .enter().append("rect")
				  .attr('class', 'bar')
				  .attr("x", function(d) { return xScale((d.data.Order)); })
				  .attr("y", function(d) { return yScale(d[1]); })
				  .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]) -1; })
				  .attr("width", xScale.bandwidth())
				  .on('click', function(d, i) {
			  d3.selectAll('.bar').classed('selected', false);
			  d3.select(this).classed('selected', true);
			});
	
				svg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + (height+5) + ")")
				.call(xAxis);
				
				svg.append("g")
				.attr("class", "axis axis--y")
				.attr("transform", "translate(0,0)")
				.call(yAxis);	

							
		}
	}

	var dataArray = [
		{"Order": 1, "Total": 2, "Dingus": 1, "Widget": 1},
		{"Order": 2, "total": 4, "Dingus": 2, "Widget": 2},
		];
		var key = ["Dingus", "Widget"];
		StackedBarChart.draw({
			data: dataArray,
			key: key,
			element: 'd3-chart-1'
		});

	updateChart()
}


function saveData() {
	if (typeof(Storage) !== "undefined") {
		// Store
		
		localStorage.setItem("orderHistory", JSON.stringify(store.orderHistory));
		localStorage.setItem("currentID", JSON.stringify(store.currentID));

	  } else {
		document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
	}
}


loadData();
