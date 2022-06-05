import { Perlin, PerlinParams } from "./Types";
import logger from './utils';


const perlinNoise = require('@nickxbs/perlinnoise2');
export default function (params?: PerlinParams): Perlin[] {
	const todayString = new Date().toISOString().substring(0, 10);
	const today = new Date(todayString)
	if (!params) {
		const result = [];
		for (let i = 0; i < 288; i++) {
			result.push({
				noise: 0,
				order: i,
				time: today.getTime() + (i) * 1000 * 60 * 5
			})
		}
		return result;
	}

	const noise = perlinNoise.generatePerlinNoise(288, 1, { ...params });

	const maxAbsValue = params?.maxAbsValue ? params.maxAbsValue : 0.05;
	const ratioMaxAbsoluteValue = (1/ maxAbsValue)/2;
	const perlinResult: Perlin[] = [];
	for (let i = 0; i < noise.length; i++) {
		perlinResult.push({
			noise: (noise[i] / ratioMaxAbsoluteValue - maxAbsValue),
			order: (i),
			time: today.getTime() + (i) * 1000 * 60 * 5
		});
	}
	logger.info('Perlin noise object result: %o', perlinResult);
	return perlinResult;
}