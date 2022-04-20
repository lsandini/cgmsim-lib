const logger = require('pino')();
module.exports = function (weight, detemirs) {
	logger.info(detemirs);

	// activities be expressed as U/min !!!
	const timeSinceDetemirAct = detemirs.map(entry => {
		const time = entry.time;
		const insulin = entry.insulin;
		const duration = (14 + (24 * insulin / weight));
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
			detemirActivity: (insulin * (S / Math.pow(tau, 2)) * time * (1 - time / td) * Math.exp(-time / tau)) / 60
		};
	});
	logger.info('these are the detemir activities:', timeSinceDetemirAct);

	// compute the aggregated activity of last detemirs in 30 hours

	const lastDetemirs = timeSinceDetemirAct.filter(function (e) {
		return e.time <= 30;
	});
	logger.info('these are the last detemirs and activities:', lastDetemirs);

	const resultDetAct = lastDetemirs.reduce(function (tot, arr) {
		return tot + arr.detemirActivity;
	}, 0);

	logger.info(resultDetAct);
	return resultDetAct;
};