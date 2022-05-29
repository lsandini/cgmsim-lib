const moment = require('moment');
export const oldComputeBasal = ({ entries }) => {

	// const entries = fs.readFileSync('./files/entries.json');
	const json = JSON.stringify(entries);
	const notes = JSON.parse(json);
	//console.log(notes);


	const basal = notes
		.filter(e => e.notes && e.drug !== 'hum')
		.map(e => {
			const lastIndexEmptySpace = e.notes.lastIndexOf(' ');
			// return {
			// 	...e,
			// 	minutesAgo: getDeltaMinutes(e.created_at),
			// 	drug: e.notes.slice(0, 3),
			// 	// insulin: parseInt(e.notes.slice(-2)) 
			// 	insulin: parseInt(e.notes.slice(lastIndexEmptySpace), 10)
			// }
			return {
				time: e.created_at,
				notes: e.notes,
				insulin: parseInt(e.notes.slice(lastIndexEmptySpace), 10),
				empty_space: e.notes.indexOf(' ')
			}
		});
	// console.log('this is the filtered treatments (basal):', basal);
	// console.log('length', basal.length); // returns the number of boluses or lenghth of the array


	const basals = basal.map(entry => ({
		...entry,
		time: moment(entry.time).valueOf()
	}));
	const timeSinceBasalMin = basals.map(entry => ({
		...entry,
		time: (Date.now() - moment(entry.time).valueOf()) / (1000 * 60 * 60),
		drug: entry.notes.slice(0, 3),
		//		insulin: parseInt(entry.notes.slice(entry.empty_space), 10)
	}));
	// console.log('this is the trimmed down insulin and time since injection data:', timeSinceBasalMin);

	const lastBasals = timeSinceBasalMin.filter(function (e) {
		return e.time <= 45; // keep only the basals from the last 45 hours
	});
	// console.log('these are the last basals: ', lastBasals);

	const lastGLA = lastBasals.filter(function (e) {
		return e.drug === 'gla' || e.drug === 'Gla' || e.drug === 'lan' || e.drug === 'Lan'; // keep only the glas from the last 45 hours
	});
	// console.log('these are the last glargines: ', lastGLA);

	const lastDET = lastBasals.filter(function (e) {
		return e.drug === 'det' || e.drug === 'Det' || e.drug === 'lev' || e.drug === 'Lev'; // keep only the dets from the last 45 hours
	});
	// console.log('these are the last detemirs: ', lastDET);

	const lastTOU = lastBasals.filter(function (e) {
		return e.drug === 'tou' || e.drug === 'Tou'; // keep only the tous from the last 45 hours
	});
	// console.log('these are the last toujeos: ', lastTOU);

	const lastDEG = lastBasals.filter(function (e) {
		return e.drug === 'deg' || e.drug === 'Deg' || e.drug === 'tre' || e.drug === 'Tre'; // keep only the degs from the last 45 hours
	});
	// console.log('these are the last degludecs: ', lastDEG);


	// const datadet = JSON.stringify(lastDET, null, 4);
	// const datagla = JSON.stringify(lastGLA, null, 4);
	// const datatou = JSON.stringify(lastTOU, null, 4);
	// const datadeg = JSON.stringify(lastDEG, null, 4);

	// fs.writeFile('./files/last_detemir.json', datadet, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	// console.log('JSON detemir data is saved.');
	// });
	// fs.writeFile('./files/last_glargine.json', datagla, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	// console.log('JSON glargine data is saved.');
	// });
	// fs.writeFile('./files/last_toujeo.json', datatou, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	// console.log('JSON toujeo data is saved.');
	// });
	// fs.writeFile('./files/last_degludec.json', datadeg, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	// console.log('JSON degludec data is saved.');
	// });
	return {
		lastDET,
		lastGLA,
		lastTOU,
		lastDEG,
	};
};