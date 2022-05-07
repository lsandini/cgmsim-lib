import logger from './utils';

//const logger = pino();

import perlinRun from './perlin';
import computeBolusIRun from './computeBolusIOB.js';
import computeBasalIOBRun from './computeBasalIOB.js';
import detemirRun from './detemir.js';
import glargineRun from './glargine.js';
import degludecRun from './degludec.js';
import toujeoRun from './toujeo.js';
import allMealsRun from './all_meals.js';
import carbsRun from './carbs.js';
import arrowsRun from './arrows.js';
import liverRun from './liver.js';
import sgvStartRun from './sgv_start.js';
import { MainParams } from './Types';

logger.info('Run Init');
const perls = perlinRun();

const main = ({
	env,
	entries,
	treatments,
	profiles,
	pumpBasals
}: MainParams) => {
	const weight = parseInt(env.WEIGHT);
	const dia = parseInt(env.DIA);
	const tp = parseInt(env.TP);
	const carbsAbs = parseInt(env.CARBS_ABS_TIME);
	const isf = parseInt(env.ISF);
	const cr = parseInt(env.CR);
	// if (!perls || perls.length === 0) {
	//     perls = perlinRun();
	// }

	const { resultAct } = computeBolusIRun(treatments, dia, tp);
	const { lastDET, lastGLA, lastTOU, lastDEG } = computeBasalIOBRun(treatments);
	const lastMeals = allMealsRun(treatments);

	//activity calc insulin
	const det = detemirRun(weight, lastDET);
	const gla = glargineRun(weight, lastGLA);
	const degludec = degludecRun(lastDEG);
	const tou = toujeoRun(weight, lastTOU);

	//activity calc carb
	const carbs = carbsRun(carbsAbs, lastMeals);
	const liver = liverRun(isf, cr);

	const cgmsim = sgvStartRun(entries, { det, gla, degludec, tou, liver, carbs, resultAct }, perls, isf);

	logger.info('this is the new sgv: %o', cgmsim);
	const arrows = arrowsRun([cgmsim, ...entries]);

	return { ...cgmsim, direction: arrows[0].direction };
};

export default main;