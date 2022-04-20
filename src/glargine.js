const logger = require('pino')();
// const fs = require('fs');
module.exports = (weight, glargines) => {
	// const jsongla = JSON.stringify(glargines);
	// const glargines = JSON.parseWithDate(jsongla);
	logger.info(glargines);

	// activities be expressed as U/min !!!
	const timeSinceGlargineAct = glargines.map(entry => {

		const time = entry.time;
		const insulin = entry.insulin;
		const duration = (22 + (12 * insulin / weight));
		const peak = (duration / 2.5);
		const tp = peak;
		const td = duration;

		const tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
		const a = 2 * tau / td;
		const S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

		return {
			...entry,
			time: time,
			glargineActivity: (insulin * (S / Math.pow(tau, 2)) * time * (1 - time / td) * Math.exp(-time / tau)) / 60
		};
	});
	logger.info('the is the accumulated glargine activity:', timeSinceGlargineAct);

	// compute the aggregated activity of last glargines in 27 hours

	const lastGlargines = timeSinceGlargineAct.filter(function (e) {
		return e.time <= 30;
	});
	logger.info('these are the last glargines and activities:', lastGlargines);

	const resultGlaAct = lastGlargines.reduce(function (tot, arr) {
		return tot + arr.glargineActivity;
	}, 0);

	logger.info(resultGlaAct);

	return resultGlaAct;
};