export default (weight, glargines) => {
	const jsongla = JSON.stringify(glargines);
	const glargine_data = JSON.parse(jsongla);
	// console.log(glargine_data);

	// activities be expressed as U/min !!!
	let timeSinceGlargineAct = glargine_data.map(entry => {

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
	console.log('the is the accumulated glargine activity:', timeSinceGlargineAct);

	// compute the aggregated activity of last glargines in 27 hours

	let lastGlargines = timeSinceGlargineAct.filter(function (e) {
		return e.time <= 30;
	});
	console.log('these are the last glargines and activities:', lastGlargines);

	let resultGlaAct = lastGlargines.reduce(function (tot, arr) {
		return tot + arr.glargineActivity;
	}, 0);

	console.log(resultGlaAct);


	// const GlaAct = JSON.stringify(resultGlaAct, null, 4);
	// fs.writeFile('./files/last_glargine_aggrACT.json', GlaAct, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('aggregated GLA activity is now is saved as JSON.');
	// });
	return resultGlaAct;
};