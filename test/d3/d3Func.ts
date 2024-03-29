import { D3Node } from './d3Node';
type ValueDataSource = {
	key: number;
	value: number;
	name?: string;
};
export type SingleLineDataSource = {
	type: 'single';
	values: ValueDataSource[];
};

export type MultiLineDataSource = {
	type: 'multiple';
	values: Array<ValueDataSource>[];
};

export const output = async (dest, d3n: D3Node): Promise<any> => {
	const d3 = d3n.d3;

	function eachGeoQuantize(d) {
		const coords = d3.select(this).attr('d') || '';
		const rounded = coords.replace(/[0-9]*\.[0-9]*/g, (x) => (+x).toFixed(4));
		d3.select(this).attr('d', rounded);
	}

	// reduce filesize of svg
	d3n.d3Element.selectAll('path').each(eachGeoQuantize);

	return await d3n.svgImage(dest);
};

export const line = ({
	data,
	selector: _selector = '#chart',
	container: _container = `
    <div id="container" style="display:flex;flex-direction:column">
      <h2>Line Chart</h2>
      <div id="chart">

	  </div>

    </div>`,
	style: _style = '',
	width: _width = 960,
	height: _height = 500,
	margin: _margin = { top: 20, right: 20, bottom: 60, left: 60 },
	lineWidth: _lineWidth = 1,
	lineColor: _lineColor = 'steelblue',
	lineColors: _lineColors = [
		'deepskyblue',
		'gold',
		'purple',
		'darkgreen',
		'red',
		'orange',
		'grey',
		'blue',
		'pink',
	],
	isCurve: _isCurve = true,
	tickSize: _tickSize = 5,
	tickPadding: _tickPadding = 5,
	scaleY = false,
}: {
	data: MultiLineDataSource | SingleLineDataSource;
	selector: string;
	container: string;
	style: string;
	width: number;
	height: number;
	margin: { top: number; right: number; bottom: number; left: number };
	lineWidth: number;
	lineColor: string;
	lineColors: string[];
	isCurve: boolean;
	tickSize: number;
	tickPadding: number;
	scaleY: boolean | number;
}) => {
	const d3n = new D3Node({
		selector: _selector,
		svgStyles: _style,
		container: _container,
	});

	const d3 = d3n.d3;

	const width = _width - _margin.left - _margin.right;
	const height = _height - _margin.top - _margin.bottom;

	const svg = d3n
		.createSVG(_width, _height)
		.append('g')
		.attr('transform', `translate(${_margin.left}, ${_margin.top})`);

	const g = svg.append('g');

	const _scale = (dim: 'x' | 'y') => {
		if (dim === 'y' && !scaleY) {
			return [0, 400];
		}
		if (dim === 'y' && typeof scaleY === 'number' && data.type === 'single') {
			const max = d3.max(data.values, (d) => d.value);
			return [0, max > scaleY ? max : scaleY];
		}
		if (dim === 'y' && typeof scaleY === 'number' && data.type === 'multiple') {
			const max = d3.max(data.values, (d) => d3.max(d, (v) => v.value));
			return [0, max > scaleY ? max : scaleY];
		}

		if (dim === 'y') {
			return data.type === 'multiple'
				? [0, d3.max(data.values, (d) => d3.max(d, (v) => v.value))]
				: [0, d3.max(data.values, (d) => d.value)];
		} else {
			if (data.type === 'multiple') {
				const firstRo: ValueDataSource[] =
					data.values.length > 0
						? data.values[0]
						: [{ key: 0, value: 0, name: '' }];
				return d3.extent(firstRo, (d) => d.key);
			}
			return d3.extent(data.values, (d) => d.key);
		}
	};
	const xScale = d3.scaleLinear().domain(_scale('x')).rangeRound([0, width]);

	const yScale = d3.scaleLinear().domain(_scale('y')).rangeRound([height, 0]);

	const xAxis = d3
		.axisBottom(xScale)
		.tickSize(_tickSize)
		.tickPadding(_tickPadding)
		.tickFormat((dom, index) => {
			return dom.toString();
		});

	const yAxis = d3
		.axisLeft(yScale)
		.tickSize(_tickSize)
		.tickPadding(_tickPadding)
		.tickFormat((dom, index) => {
			return dom.toString();
		});

	const lineChart = d3
		.line<ValueDataSource>()
		.x((d) => xScale(d.key))
		.y((d) => yScale(d.value));

	if (_isCurve) {
		lineChart.curve(d3.curveBasis);
	}

	g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis)
		.attr('font-size', `10`)
		.attr('opacity', `1`)
		.attr('color', 'steelblue')
		.attr('font-family', `times new roman`);

	g.append('g')
		.call(yAxis)
		.attr('font-size', `10`)
		.attr('opacity', `1`)
		.attr('color', 'steelblue')
		.attr('font-family', `times new roman`);

	g.append('g')
		.attr('fill', 'none')
		.attr('font-family', 'sans-serif')
		.attr('stroke-width', _lineWidth)
		.selectAll('path')
		.data(data.type === 'multiple' ? data.values : [data.values])
		.enter()
		.append('path')
		.attr('stroke', (d, i) =>
			i < _lineColors.length ? _lineColors[i] : _lineColor,
		)
		.attr('d', lineChart);
	if (data.type === 'multiple') {
		// const legend = d3n.getLegend('#my_dataviz');
		const legend = svg;

		data.values.forEach((val, index) => {
			legend
				.append('circle')
				.attr('cx', 100)
				.attr('cy', 10 + 30 * index)
				.attr('r', 6)
				.style('fill', _lineColors[index]);
			legend
				.append('text')
				.attr('x', 120)
				.attr('y', 14 + 30 * index)
				.text(val[0]?.name ? val[0].name : 'data_' + index)
				.style('font-size', '15px')
				.style('fill', _lineColors[index])
				.attr('alignment-baseline', 'middle');
		});
	}

	return d3n;
};
