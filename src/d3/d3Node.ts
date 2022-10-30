import { JSDOM } from 'jsdom';
import * as d3 from 'd3';
import * as sharp from 'sharp';
import * as fse from 'fs-extra';

function fixXmlCase(text: string) {
	// Fix a jsdom issue where all SVG tagNames are lowercased:
	// https://github.com/tmpvar/jsdom/issues/620
	var tagNames = ['linearGradient', 'radialGradient', 'clipPath', 'textPath']
	for (var i = 0, l = tagNames.length; i < l; i++) {
		var tagName = tagNames[i]
		text = text.replace(
			new RegExp('(<|</)' + tagName.toLowerCase() + '\\b', 'g'),
			function (all, start) {
				return start + tagName
			})
	}
	return text
}

export class D3Node {
	d3: typeof d3;
	d3Element: d3.Selection<any, unknown, null, undefined>;

	document: Document;

	options: { d3Module: typeof d3; selector: string; container: string; styles: string; canvasModule: string; };
	jsDom: JSDOM;
	window: Window & typeof globalThis;
	constructor({ d3Module = d3, selector = '', container = '', styles = '', svgStyles = '', canvasModule = '' }) {
		// deprecates props
		if (svgStyles && !styles) { // deprecated svgStyles option
			console.warn('WARNING: svgStyles is deprecated, please use styles instead !!')
			styles = svgStyles
		}

		// // auto-new instance, so we always have 'this'
		// if (!(this instanceof D3Node)) {
		// 	return new D3Node({ d3Module, selector, container, styles })
		// }

		// setup DOM
		let jsDom = new JSDOM()
		if (container) {
			jsDom = new JSDOM(container)
		}
		const document = jsDom.window.document

		// setup d3 selection
		let d3Element = d3Module.select(document.body)
		if (selector) {
			d3Element = d3Element.select(selector)
		}

		this.options = { d3Module, selector, container, styles, canvasModule }
		this.jsDom = new JSDOM()
		this.document = document
		this.window = document.defaultView
		this.d3Element = d3Element
		this.d3 = d3Module
	}

	createSVG(width: number, height: number, attrs?: any) {
		const svg = this.d3Element.append('svg')
			.attr('xmlns', 'http://www.w3.org/2000/svg')

		if (width && height) {
			svg.attr('width', width)
				.attr('height', height)
		}

		if (attrs) {
			Object.keys(attrs).forEach(function (key) {
				svg.attr(key, attrs[key])
			})
		}

		if (this.options.styles) {
			svg.append('defs')
				.append('style')
				.attr('type', 'text/css')
				.text(`<![CDATA[ ${this.options.styles} ]]>`)
		}
		return svg


	}


	svgString() {
		if (this.d3Element.select('svg').node()) {
			// temp until: https://github.com/tmpvar/jsdom/issues/1368
			return fixXmlCase((this.d3Element.select('svg').node() as Element).outerHTML)
		}
		return ''
	}
	async svgImage(dest: string) {

		const svgString = this.svgString();
		var buf = Buffer.from(svgString, 'utf8');
		return sharp(buf)
			.png()
			.toBuffer()

		// .toBuffer()		
	}

	html() {
		return this.jsDom.serialize()
	}

	chartHTML() {
		return this.document.querySelector(this.options.selector).outerHTML
	}
}