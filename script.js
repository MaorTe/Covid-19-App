const baseEndPoint = `https://corona-api.com/countries`;

const countriesContainer = document.querySelector('.countries');
const countriesArr = [];
let covidArr = [];
let obj = {};

async function fetchURL(url) {
	const response = await fetch(url);
	return response.json();
}
function getAllCountries() {
	const url = `https://api.codetabs.com/v1/proxy/?quest=https://restcountries.herokuapp.com/api/v1`;
	return fetchURL(url);
}
function getCovidByCountry() {
	const url = `https://corona-api.com/countries`;
	return fetchURL(url);
}
const displayDataCountry = () => {
	console.log(countriesArr);
};
const displayDataCovid = () => {
	console.log(covidArr);
};

//initializer
draw('Asia');

function ButtonRegionSelected(e) {
	let regionSelected = e.target.textContent;
	UpdateChartData(myChart, regionSelected, e);
}
function ButtonCasesSelected(e) {
	let caseSelected = e.target.textContent;
	UpdateChartData(myChart, caseSelected, e);
}

function setCountriesToDOM(countriesArr) {
	countriesContainer.innerHTML = '';
	countriesArr.forEach(async (country) => {
		const countryName = document.createElement('span');
		countryName.textContent += country.name.common;
		countryName.classList.add('space');
		countriesContainer.appendChild(countryName);
	});
}

async function getData(regionFromListener) {
	let covids = await getCovidByCountry();
	let countries = await getAllCountries();

	let countriesArr = [];
	let countriesByCode = [];
	// if (regionFromListener === 'World') {
	// 	regionFromListener = '/';
	// }
	//get all countries of selected region
	countries.forEach(async (country) => {
		if (country.region === regionFromListener) {
			countriesArr.push(country);
			countriesByCode.push(country.cca2);
		}
	});
	console.log(countriesArr);

	//set countries text to DOM
	setCountriesToDOM(countriesArr);

	//filter countries
	let filtered = covids.data.filter((cov) =>
		countriesByCode.includes(cov.code)
	);
	console.log(filtered);

	//if all countries
	if (regionFromListener === 'World') {
		filtered = covids.data;
		setCountriesToDOM(countries);
	}

	obj = {};
	filtered.forEach((country) => {
		obj[country.code] = {
			name: country.name,
			deaths: country.latest_data.deaths,
			confirmed: country.latest_data.confirmed,
			recovered: country.latest_data.recovered,
			critical: country.latest_data.critical,
		};
	});
	console.log(obj);
	return obj;
}
// ----------------set listeners to buttons----------------
// selecting a region button
const regionContainer = document.querySelectorAll('.container-regions button');
// this forEach will attach event listeners to all child-nodes buttons NodeList
regionContainer.forEach((el) => {
	el.addEventListener('click', ButtonRegionSelected);
});

// selecting a case button
const casesContainer = document.querySelectorAll('.container-cases button');
// this forEach will attach event listeners to all child-nodes buttons NodeList
casesContainer.forEach((el) => {
	el.addEventListener('click', ButtonCasesSelected);
});

// ----------------graph----------------
let myChart;
async function draw(region) {
	const data = await getData(region).catch((err) => {
		console.log('there was an error fetching user');
		console.error(err);
	});
	const yLabels = Object.entries(data).map((currentItem) => {
		return currentItem[1].confirmed;
	});
	const xLabels = Object.entries(data).map((currentItem) => {
		return currentItem[1].name;
	});
	let ctx = document.querySelector('#myChart');
	myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: xLabels,
			datasets: [
				{
					label: `Covid 19 confirmed`,
					// backgroundColor: '#1d2d506e',
					// borderColor: '#133b5c',
					borderWidth: '1',
					data: yLabels,
					backgroundColor: [
						'rgba(255, 99, 132, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)',
						'rgba(75, 192, 192, 0.2)',
						'rgba(153, 102, 255, 0.2)',
						'rgba(255, 159, 64, 0.2)',
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(255, 159, 64, 1)',
					],
					borderWidth: 1,
				},
			],
		},
		options: {
			legend: {
				labels: {
					// This more specific font property overrides the global property
					fontColor: '#fff',
				},
			},
			title: {
				display: true,
				text: 'Covid 19 Stats',
				fontSize: 20,
				fontColor: '#fff',
			},
			scales: {
				xAxes: [
					{
						ticks: {
							fontColor: '#fff',
							beginAtZero: true,
						},
					},
				],
				yAxes: [
					{
						ticks: {
							fontColor: '#fff',
							beginAtZero: true,
						},
					},
				],
			},
		},
	});
}

// ----------------updating graph----------------
async function UpdateChartData(chart, selected, e) {
	// get the data by region
	let data = obj;
	if (e.target.classList.contains('btn-regions')) {
		data = await getData(selected).catch((err) => {
			console.log('there was an error fetching data');
			console.error(err);
		});
		// get the x-axis and y-axis data
		const yLabels = Object.entries(data).map((elY) => {
			return elY[1].confirmed;
		});
		const xLabels = Object.entries(data).map((elX) => {
			return elX[1].name;
		});

		// insert x and y axis data into graph
		removeData(chart);
		chart.data.datasets[0].label = `Covid 19 in confirmed`;
		chart.data.datasets[0].data = yLabels;
		chart.data.labels = xLabels;
		chart.update();
	} else {
		//update only the y-axis for cases
		let cases = selected.toLowerCase();
		const yLabels = Object.entries(data).map((elY) => {
			return elY[1][cases];
		});
		chart.data.datasets[0].label = `Covid 19 in ${cases}`;
		chart.data.datasets[0].data = yLabels;
		chart.update();
	}
}

async function removeData(chart) {
	chart.data.labels.pop();
	chart.data.datasets.forEach((dataset) => {
		dataset.data.pop();
	});
}
