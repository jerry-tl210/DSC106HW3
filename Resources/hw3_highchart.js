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
  myBarChart: Highcharts.chart('container-1', {
	chart: {type: 'column'},
	title: {text: "Units of Dingus Sold vs Units of Widget Sold (per Order)"},
	xAxis: {categories: [1, 2],
			title: {
				text: "Order ID"
			}},
	yAxis: {min: 0, 
			title: {
				text: "Units Sold"
			},
			stackLabels: {
				enabled: true,
				style: {
					fontWeight: 'bold',
					color: ( // theme
						Highcharts.defaultOptions.title.style &&
						Highcharts.defaultOptions.title.style.color
					) || 'gray'
				}
			}},
	legend: {align: 'right'},
	plotOptions: {
		column: {
			stacking: 'normal',
			dataLabels: {
				enabled: true
			}
		}
	},
	series: [{
		name: "Dingus",
		data: [1, 2]
	}, {
		name: "Widget",
		data: [1, 2]
	}]
}),
  myPieChart: Highcharts.chart('container-2', {
	chart: {
		plotBackgroundColor: null,
		plotBorderWidth: null,
		plotShadow: false,
		type: 'pie'
	},
	title: {
		text: 'Percentage of Dingus Sold vs Percentage of Widget Sold'
	},
	tooltip: {
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	},
	plotOptions: {
		pie: {
			allowPointSelect: true,
			cursor: 'pointer',
			dataLabels: {
				enabled: true,
				format: '<b>{point.name}</b>:<br>{point.percentage:.1f} %<br>'
			},
			showInLegend: true
		}
	},
	series: [{
		name: ['Percentage Sold'],
		colorByPoint: true,
		data: [{
			name: 'Dingus',
			y: 50
		}, {
			name: 'Widget',
			y: 50
		}]
	}]
})
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
	if (store.currentID <= 7) {
		var newCategories = []
		for (var i = 1; i < store.currentID + 1; i++) {
			newCategories.push(i)
		}

		store.myBarChart.xAxis[0].setCategories(newCategories)

		var newDingusData = []
		var newWidgetData = []
		for (var i = 0; i < store.orderHistory.length; i++) {
			newDingusData.push(Number(store.orderHistory[i][2]))
			newWidgetData.push(Number(store.orderHistory[i][3]))
		}

		store.myBarChart.series[0].setData(newDingusData)
		store.myBarChart.series[1].setData(newWidgetData)

		store.myPieChart.update({
			series: [{
				name: ['Percentage Sold'],
				colorByPoint: true,
				data: [{
					name: 'Dingus',
					y: Number((store.totalDingusQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1))
				}, {
					name: 'Widget',
					y: Number((store.totalWidgetQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1))
				}]
			}]
		})
	}
	else {
		var newCategories = []
		for (var i = store.currentID - 7 + 1; i <= store.currentID; i++) {
			newCategories.push(i)
		}
		store.myBarChart.xAxis[0].setCategories(newCategories)

		var newDingusData = []
		var newWidgetData = []
		for (var i = store.currentID - 7 + 1; i <= store.currentID; i++) {
			console.log(store.orderHistory[i-1][2])
			console.log(store.orderHistory[i-1][3])
			
			newDingusData.push(Number(store.orderHistory[i-1][2]))
			newWidgetData.push(Number(store.orderHistory[i-1][3]))
		}

		console.log(newDingusData)
		console.log(newWidgetData)

		store.myBarChart.series[0].setData(newDingusData)
		store.myBarChart.series[1].setData(newWidgetData)
	

		store.myPieChart.update({
			series: [{
				name: ['Percentage Sold'],
				colorByPoint: true,
				data: [{
					name: 'Dingus',
					y: Number((store.totalDingusQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1))
				}, {
					name: 'Widget',
					y: Number((store.totalWidgetQuantity / (store.totalDingusQuantity + store.totalWidgetQuantity) * 100).toFixed(1))
				}]
			}]
		})
	}
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
	updateChart();
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
