import { TreatmentDelta, Treatment } from './Types'
import logger, { getDeltaMinutes, getInsulinActivity } from './utils';


export const computeBasalActivity = (treatments: (TreatmentDelta & { duration: number, peak: number })[]) => {
	// activities be expressed as U/min !!!
	const treatmentsActivity = treatments.map(e => {
		const minutesAgo = e.minutesAgo;
		const insulin = e.insulin;
		return getInsulinActivity(e.peak, e.duration, minutesAgo, insulin);		
	});
	logger.info('these are the last Slow INSULINS: %o', treatmentsActivity);
	const resultAct = treatmentsActivity.reduce((tot, activity) => {
		return tot + activity;
	}, 0);
	return resultAct
}

export default function (treatments: Treatment[], weight: number): number {
	//Find basal boluses
	const basals = treatments && treatments.length ?
		treatments.filter(e => e.notes)
			.map(e => {
				const lastIndexEmptySpace = e.notes.lastIndexOf(' ');
				return {
					...e,
					minutesAgo: getDeltaMinutes(e.created_at),
					drug: e.notes.slice(0, 3),
					// insulin: parseInt(e.notes.slice(-2)) 
					insulin: parseInt(e.notes.slice(lastIndexEmptySpace), 10)
				}
			}) : [];

	const lastBasals = basals.filter(function (e) {
		return e.minutesAgo <= 45 * 60; // keep only the basals from the last 45 hours
	});

	const lastGLA = lastBasals
		.filter((e) => {
			return e.drug === 'gla' || e.drug === 'Gla' || e.drug === 'lan' || e.drug === 'Lan'; // keep only the glas from the last 45 hours
		}).map(e => {
			const duration = (22 + (12 * e.insulin / weight)) * 60;
			const peak = (duration / 2.5);
			return {
				...e,
				duration,
				peak,
			}
		});
	logger.debug('these are the last GLA: %o', lastGLA);
	const activityGLA = computeBasalActivity(lastGLA)
	logger.info('these is the total GLA activity: %o', activityGLA);

	const lastDET = lastBasals.filter(function (e) {
		return e.drug === 'det' || e.drug === 'Det' || e.drug === 'lev' || e.drug === 'Lev'; // keep only the dets from the last 45 hours
	}).map(e => {
		const duration = (14 + (24 * e.insulin / weight)) * 60;
		const peak = (duration / 3);
		return {
			...e,
			duration,
			peak,
		}
	});
	logger.debug('these are the last DET: %o', lastDET);
	const activityDET = computeBasalActivity(lastDET)
	logger.info('these is the total DET activity: %o', activityDET);

	const lastTOU = lastBasals.filter(function (e) {
		return e.drug === 'tou' || e.drug === 'Tou'; // keep only the tous from the last 45 hours
	})
	.map(e => {
		const duration = (24 + (14 * e.insulin / weight)) * 60;
		const peak = (duration / 2.5);
		return {
			...e,
			duration,
			peak,
		}
	});
	logger.debug('these are the last TOU: %o', lastTOU);
	const activityTOU = computeBasalActivity(lastTOU)
	logger.info('these is the total TOU activity: %o', activityTOU);

	const lastDEG = lastBasals.filter(function (e) {
		return e.drug === 'deg' || e.drug === 'Deg' || e.drug === 'tre' || e.drug === 'Tre'; // keep only the degs from the last 45 hours
	}).map(e => {
		const duration = 42 * 60;
		const peak = (duration / 3);
		return {
			...e,
			duration,
			peak,
		}
	});
	logger.debug('these are the last deg: %o', lastDEG);
	const activityDEG = computeBasalActivity(lastDEG);
	logger.info('these is the total deg activity: %o', activityDEG);

	const result = {
		lastDET,
		lastGLA,
		lastTOU,
		lastDEG,		
	};
	return activityDEG + activityDET + activityGLA + activityTOU;
}