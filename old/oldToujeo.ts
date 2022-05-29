export default function(weight, tou) {
    
	const jsontou = JSON.stringify(tou);
    const toujeo_data = JSON.parse(jsontou);
    // console.log(toujeo_data);

    // activities be expressed as U/min !!!
    const timeSinceToujeoAct = toujeo_data.map(entry => {

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
    // console.log('the is the accumulated toujeo activity:', timeSinceToujeoAct);

    // compute the aggregated activity of last toujeos in 27 hours

    const lastToujeos = timeSinceToujeoAct.filter(function(e) {
        return e.time <= 30;
    });
    // console.log('these are the last toujeos and activities:', lastToujeos);

    const resultTouAct = lastToujeos.reduce(function(tot, arr) {
        return tot + arr.toujeoActivity;
    }, 0);

    // console.log(resultTouAct);

    // const TouAct = JSON.stringify(resultTouAct, null, 4);
    // fs.writeFile('./files/last_toujeo_aggrACT.json', TouAct, (err) => {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log('aggregated TOU activity is now is saved as JSON.');
    // });
    return resultTouAct;
}