// const fs = s;
const logger = require('pino')();
module.exports = function (weight, tou) {

	logger.info(tou);

	// activities be expressed as U/min !!!
	const timeSinceToujeoAct = tou.map(entry => {

		const time = entry.time;
		const insulin = entry.insulin;
		const duration = (24 + (14 * insulin / weight));
		const peak = (duration / 2.5);
		const tp = peak;
		const td = duration;

		const tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
		const a = 2 * tau / td;
		const S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

		return {
			...entry,
			time: time,
			toujeoActivity: (insulin * (S / Math.pow(tau, 2)) * time * (1 - time / td) * Math.exp(-time / tau)) / 60
		};
	});
	logger.info('the is the accumulated toujeo activity:', timeSinceToujeoAct);

	// compute the aggregated activity of last toujeos in 27 hours

	const lastToujeos = timeSinceToujeoAct.filter(function (e) {
		return e.time <= 30;
	});
	logger.info('these are the last toujeos and activities:', lastToujeos);

	const resultTouAct = lastToujeos.reduce(function (tot, arr) {
		return tot + arr.toujeoActivity;
	}, 0);

	logger.info(resultTouAct);

	return resultTouAct;
};