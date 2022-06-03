import logger from './utils';

//const logger = pino();

import perlinRun from './perlin';
import bolus from './bolus';
import basal from './basal';

import carbs from './carbs';
import arrowsRun from './arrows';
import liverRun from './liver';
import sgv from './sgv';
import { MainParams } from './Types';
import moment = require('moment');

logger.debug('Run Init');

const simulator = ({
	env,
	entries,
	treatments,
	profiles,
	pumpBasals
}: MainParams) => {
	const isf = parseInt(env.ISF);
	if (isf < 9) {
		throw new Error("Isf must be greater then or equal to 9");
	}
	const weight = parseInt(env.WEIGHT);
	const dia = parseInt(env.DIA);
	const tp = parseInt(env.TP);
	const carbsAbs = parseInt(env.CARBS_ABS_TIME);
	const cr = parseInt(env.CR);
	const perls = perlinRun(env.SEED || 'cgmsim');



	const bolusActivity = bolus(treatments, dia, tp);
	const basalActivity = basal(treatments, weight);
	const carbsActivity = carbs(treatments, carbsAbs, isf, cr);


	// //activity calc insulin
	// const det = detemirRun(weight, lastDET);
	// const gla = glargineRun(weight, lastGLA);
	// const degludec = degludecRun(lastDEG);
	// const tou = toujeoRun(weight, lastTOU);

	//activity calc carb
	const liverActivity = liverRun(isf, cr);
	const now = moment();
	const orderedEntries = entries.filter(e => e.mills <= now.toDate().getTime()).sort((a, b) => b.mills - a.mills)

	const newSgvValue = sgv(orderedEntries, { basalActivity, liverActivity, carbsActivity, bolusActivity }, perls, isf);

	logger.debug('this is the new sgv: %o', newSgvValue);
	const arrows = arrowsRun([newSgvValue, ...entries]);

	return { ...newSgvValue, direction: arrows[0].direction };
};

export default simulator;