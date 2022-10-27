const D3Node = require('d3-node');
const puppeteer = require('puppeteer');

async function captureImage(html, { path, viewport }) {
	const screenShotOptions = { viewport };
	
	try {
		const browser = await puppeteer.launch({})
		const page = await browser.newPage()
		await page.setContent(html)
		if (viewport) {
			await page.setViewport(viewport);
		}
		const screen = await page.screenshot(screenShotOptions)
		await browser.close()		
		return screen;

	} catch (error) {
		console.log(error)
	}
}

export const output = async (dest, d3n): Promise<any> => {
	const d3 = d3n.d3;

	function eachGeoQuantize(d) {
		const coords = d3.select(this).attr('d') || ''
		const rounded = coords.replace(/[0-9]*\.[0-9]*/g, (x) => (+x).toFixed(4))
		d3.select(this).attr('d', rounded);
	}

	// reduce filesize of svg
	d3n.d3Element.selectAll('path').each(eachGeoQuantize);
	const svgString = d3n.svgString();

	// await fse.outputFile(`${dest}.svg`, svgString);

	const html = d3n.html()

	const width = 800;
	const height = 600;
	let viewport = null
	if (width && height) {
		viewport = { width, height }
	}

	const ext = 'png'
	const png = await captureImage(html, { path: `${dest}.${ext}`, viewport });
	return png

};

export const line = ({
	data,
	selector: _selector = '#chart',
	container: _container = `
    <div id="container">
      <h2>Line Chart</h2>
      <div id="chart"></div>
    </div>`,
	style: _style = '',
	width: _width = 960,
	height: _height = 500,
	margin: _margin = { top: 20, right: 20, bottom: 60, left: 30 },
	lineWidth: _lineWidth = 1.5,
	lineColor: _lineColor = 'steelblue',
	lineColors: _lineColors = ["deepskyblue", "lightskyblue", "lightblue", "#aaa", "#777", "#888"],
	isCurve: _isCurve = true,
	tickSize: _tickSize = 5,
	tickPadding: _tickPadding = 5,
	scaleY = false,
}) => {
	const d3n = new D3Node({
		selector: _selector,
		svgStyles: _style,
		container: _container,
	});

	const d3 = d3n.d3;

	const width = _width - _margin.left - _margin.right;
	const height = _height - _margin.top - _margin.bottom;

	const svg = d3n.createSVG(_width, _height)
		.append('g')
		.attr('transform', `translate(${_margin.left}, ${_margin.top})`);

	const g = svg.append('g');
	const _scale = () => {
		if (scaleY) {
			return allKeys ? [d3.min(data, d => d3.min(d, v => v.value)), d3.max(data, d => d3.max(d, v => v.value))] : d3.extent(data, d => d.value);
		} else {
			return [0, 400];
		}
	}
	const { allKeys } = data;
	const xScale = d3.scaleLinear()
		.domain(allKeys ? d3.extent(allKeys) : d3.extent(data, d => d.key))
		.rangeRound([0, width]);
	const yScale = d3.scaleLinear()
		.domain(_scale())
		.rangeRound([height, 0]);
	const xAxis = d3.axisBottom(xScale)
		.tickSize(_tickSize)
		.tickPadding(_tickPadding);
	const yAxis = d3.axisLeft(yScale)
		.tickSize(_tickSize)
		.tickPadding(_tickPadding);

	const lineChart = d3.line()
		.x(d => xScale(d.key))
		.y(d => yScale(d.value));

	if (_isCurve) lineChart.curve(d3.curveBasis);

	g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);

	g.append('g').call(yAxis);

	g.append('g')
		.attr('fill', 'none')
		.attr('stroke-width', _lineWidth)
		.selectAll('path')
		.data(allKeys ? data : [data])
		.enter().append("path")
		.attr('stroke', (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor)
		.attr('d', lineChart);

	return d3n;
}
