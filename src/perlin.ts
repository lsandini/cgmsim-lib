import { Perlin, PerlinParams } from "./Types";
import logger from './utils';


const perlinNoise = require('@nickxbs/perlinnoise2');
export default function (params?: PerlinParams): Perlin[] {
	const todayString = new Date().toISOString().substring(0, 10);
	const today = new Date(todayString)
	const defaultParams = {
		amplitude: 0.3,
		octaveCount: 3,
		persistence: 0.3,
		maxAbsValue: 0.05,
		seed: 'cgmsim',
		mode: 'daily'
	}
	const noise = perlinNoise.generatePerlinNoise(288, 1, { ...defaultParams, ...params });

	const maxAbsoluteValue = params?.maxAbsValue ? params.maxAbsValue : defaultParams.maxAbsValue;
	const ratioMaxAbsoluteValue = 0.05 / maxAbsoluteValue;
	const perlinResult: Perlin[] = [];
	for (let i = 0; i < noise.length; i++) {
		perlinResult.push({
			noise: (noise[i] / 10 - 0.05) / ratioMaxAbsoluteValue,
			order: (i),
			time: today.getTime() + (i) * 1000 * 60 * 5
		});
	}
	logger.info('Perlin noise object result: %o', perlinResult);
	return perlinResult;
}