import { Perlin } from "./Types";

const perlinNoise = require('perlin-noise');
export default function (seed): Perlin[] {
	const todayString = new Date().toISOString().substring(0, 10);
	const today = new Date(todayString)
	const noise = perlinNoise.generatePerlinNoise(288, 1, {
		amplitude: 0.3,
		octaveCount: 3,
		persistence: 0.3,
		seed,
		mode:'daily'
	});

	const myObject: Perlin[] = [];
	for (let i = 0; i < noise.length; i++) {
		myObject.push({
			noise: noise[i] / 10 - 0.05,
			order: (i),
			time: today.getTime() + (i) * 1000 * 60 * 5
		});
	}

	return myObject;
}