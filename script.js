const baseEndPoint = `https://corona-api.com/countries`;

const countriesContainer = document.querySelector('.countries');
const countriesArr = [];
let covidArr = [];
let obj = {};
let ctx;
let filtered;

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

//initializer
draw('Asia');

function setCountriesToDOM(countriesArr) {
	countriesContainer.innerHTML = '';
	countriesArr.forEach(async (country) => {
		const countryName = document.createElement('span');
		countryName.textContent = country.name.common;
		countryName.classList.add('span-space');
		countriesContainer.appendChild(countryName);
	});
	setSpanListener();
}

async function getData(regionFromListener) {
	let covids = await getCovidByCountry();
	let countries = await getAllCountries();

	let countriesArr = [];
	let countriesByCode = [];

	//get all countries of selected region
	countries.forEach(async (country) => {
		if (country.region === regionFromListener) {
			countriesArr.push(country);
			countriesByCode.push(country.cca2);
		}
	});

	//filter countries
	filtered = covids.data.filter((cov) => countriesByCode.includes(cov.code));

	//set countries text to DOM
	setCountriesToDOM(countriesArr, filtered);

	//if world selected get all countries
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
	return obj;
}
// ----------------set listeners to buttons----------------
// selecting a region button
const regionContainer = document.querySelectorAll('.container-regions button');
// this forEach will attach event listeners to all child-nodes buttons NodeList
regionContainer.forEach((el) => {
	el.addEventListener('click', ButtonRegionSelected);
});

function ButtonRegionSelected(e) {
	let regionSelected = e.target.textContent;
	UpdateChartData(myChart, regionSelected, e);
}
// ---
const casesContainer = document.querySelectorAll('.container-cases button');
casesContainer.forEach((el) => {
	el.addEventListener('click', ButtonCasesSelected);
});

function ButtonCasesSelected(e) {
	let caseSelected = e.target.textContent;
	UpdateChartData(myChart, caseSelected, e);
}

// --- selecting a country name text
function setSpanListener() {
	const countriesContainerSpan = document.querySelectorAll('.countries span');
	countriesContainerSpan.forEach((el) => {
		el.addEventListener('click', ShowCountryCovidStats);
	});
}
function ShowCountryCovidStats(e) {
	ctx.style.display = 'none';

	//find selected country from countries
	let countryName = e.target.textContent;
	let found = filtered.find((data) => {
		return data.name === countryName;
	});
	//set found country necessary details into an arr of objects
	let arr = [
		{ 'Total cases': found.latest_data.confirmed },
		{ 'New cases': found.today.confirmed },
		{ 'Total deaths': found.latest_data.deaths },
		{ 'New deaths': found.today.deaths },
		{ 'Total recovered': found.latest_data.recovered },
		{ Critical: found.latest_data.critical },
	];

	//create elements on the DOM and set details
	let canvasContainer = document.querySelector('.canvas-container');
	canvasContainer.innerHTML = '';
	for (let i = 0; i < 6; i++) {
		const title = document.createElement('h2');
		const value = document.createElement('h3');
		const card = document.createElement('div');

		title.textContent = Object.keys(arr[i])[0];
		value.textContent = Object.values(arr[i])[0];

		card.appendChild(title);
		card.appendChild(value);
		card.classList.add('space');
		card.classList.add('card');
		canvasContainer.appendChild(card);
	}
}
// ----------------graph----------------
colors = [
	'rgba(255, 99, 132, 1)',
	'rgba(54, 162, 235, 1)',
	'rgba(255, 206, 86, 1)',
	'rgba(75, 192, 192, 1)',
	'rgba(153, 102, 255, 1)',
	'rgba(255, 159, 64, 1)',
];
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
	ctx = document.querySelector('#myChart');
	myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: xLabels,
			datasets: [
				{
					label: `Covid 19 confirmed`,
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

					pointBorderColor: (() => {
						let bgcolors = [];
						for (let i = 0; i < 1000; ++i)
							bgcolors.push(colors[i % colors.length]);
						return bgcolors;
					})(),
				},
			],
		},
		options: {
			// maintainAspectRatio: false,
			legend: {
				labels: {
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
	ctx.style.display = 'block';
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
		chart.data.datasets[0].label = `Covid 19 confirmed`;
		chart.data.datasets[0].data = yLabels;
		chart.data.labels = xLabels;
		chart.update();
	} else {
		//update only the y-axis for cases
		let cases = selected.toLowerCase();
		const yLabels = Object.entries(data).map((elY) => {
			return elY[1][cases];
		});
		chart.data.datasets[0].label = `Covid 19 ${cases}`;
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
