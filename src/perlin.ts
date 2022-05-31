import { Perlin } from "./Types";
import logger from './utils';


const perlinNoise = require('@nickxbs/perlinnoise2');
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

	const perlinResult: Perlin[] = [];
	for (let i = 0; i < noise.length; i++) {
		perlinResult.push({
			noise: noise[i] / 10 - 0.05,
			order: (i),
			time: today.getTime() + (i) * 1000 * 60 * 5
		});
	}
	logger.info('Perlin noise object result: %o', perlinResult);
	return perlinResult;
}