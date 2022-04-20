const logger = require('pino')();
module.exports = function (weight, degludecs) {
	logger.info(degludecs);

	// activities be expressed as U/min !!!
	const timeSinceDegludecAct = degludecs.map(entry => {
		const time = entry.time;
		const insulin = entry.insulin;
		const duration = 42;
		const peak = (duration / 3);
		const tp = peak;
		const td = duration;

		const tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
		const a = 2 * tau / td;
		const S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

		return {
			...entry,
			time: time,
			insulin: insulin,
			degludecActivity: (insulin * (S / Math.pow(tau, 2)) * time * (1 - time / td) * Math.exp(-time / tau)) / 60
		};
	});
	logger.info('these are the degludec activities:', timeSinceDegludecAct);

	// compute the aggregated activity of last degludecs in 45 hours

	const lastDegludecs = timeSinceDegludecAct.filter(function (e) {
		return e.time <= 45;
	});
	logger.info('these are the last degludecs and activities:', lastDegludecs);

	const resultDegAct = lastDegludecs.reduce(function (tot, arr) {
		return tot + arr.degludecActivity;
	}, 0);

	logger.info(resultDegAct);
	return resultDegAct;
};