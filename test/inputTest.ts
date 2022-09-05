import moment = require("moment")
import { physicalIsf } from "src/physical"
import { Activity } from "src/Types"

export const treatments = [{
	"_id": "62764c27a3dc0ad6768cce46",
	"enteredBy": "TheBoss",
	"eventType": "Carb Correction",
	"carbs": 12,
	"created_at": "2022-05-07T10:20:00.000Z",
	"utcOffset": 0,
	"insulin": null
}, {
	"_id": "62754944a3dc0ad67616d2a2",
	"enteredBy": "TheBoss",
	"eventType": "Meal Bolus",
	"insulin": 2,
	"preBolus": 15,
	"utcOffset": 0,
	"protein": "",
	"fat": "",
	"duration": 0,
	"profile": "",
	"created_at": "2022-05-06T16:00:00.000Z",
	"carbs": null
}, {
	"_id": "627548f4a3dc0ad67616ac95",
	"eventType": "Announcement",
	"notes": "gla 10",
	"utcOffset": 0,
	"isAnnouncement": true,
	"protein": "",
	"fat": "",
	"duration": 0,
	"profile": "",
	"enteredBy": "Boss",
	"created_at": "2022-05-06T15:00:00.000Z",
	"carbs": null,
	"insulin": null
}, {
	"_id": "6272bd41a3dc0ad676e0cefe",
	"created_at": "2022-05-04T16:50:00.000Z",
	"eventType": "Meal Bolus",
	"carbs": 30,
	"insulin": null
}
]

export const toujeoTreatments = [{
	"_id": "62764c27a3dc0ad6768cce46",
	"enteredBy": "TheBoss",
	"eventType": "Carb Correction",
	"carbs": 12,
	"created_at": "2022-05-07T10:20:00.000Z",
	"utcOffset": 0,
	"insulin": null
}, {
	"_id": "62754944a3dc0ad67616d2a2",
	"enteredBy": "TheBoss",
	"eventType": "Meal Bolus",
	"insulin": 2,
	"preBolus": 15,
	"utcOffset": 0,
	"protein": "",
	"fat": "",
	"duration": 0,
	"profile": "",
	"created_at": "2022-05-06T16:00:00.000Z",
	"carbs": null
}, {
	"_id": "627548f4a3dc0ad67616ac95",
	"eventType": "Announcement",
	"notes": "tou 14",
	"utcOffset": 0,
	"isAnnouncement": true,
	"protein": "",
	"fat": "",
	"duration": 0,
	"profile": "",
	"enteredBy": "Boss",
	"created_at": "2022-05-06T15:00:00.000Z",
	"carbs": null,
	"insulin": null
}, {
	"_id": "6272bd41a3dc0ad676e0cefe",
	"created_at": "2022-05-04T16:50:00.000Z",
	"eventType": "Meal Bolus",
	"carbs": 30,
	"insulin": null
}
]

export const glargineTreatments = [{
	"_id": "62764c27a3dc0ad6768cce46",
	"enteredBy": "TheBoss",
	"eventType": "Carb Correction",
	"carbs": 12,
	"created_at": "2022-05-07T10:20:00.000Z",
	"utcOffset": 0,
	"insulin": null
}, {
	"_id": "62754944a3dc0ad67616d2a2",
	"enteredBy": "TheBoss",
	"eventType": "Meal Bolus",
	"insulin": 2,
	"preBolus": 15,
	"utcOffset": 0,
	"protein": "",
	"fat": "",
	"duration": 0,
	"profile": "",
	"created_at": "2022-05-06T16:00:00.000Z",
	"carbs": null
}, {
	"_id": "627548f4a3dc0ad67616ac95",
	"eventType": "Announcement",
	"notes": "gla 14",
	"utcOffset": 0,
	"isAnnouncement": true,
	"protein": "",
	"fat": "",
	"duration": 0,
	"profile": "",
	"enteredBy": "Boss",
	"created_at": "2022-05-06T15:00:00.000Z",
	"carbs": null,
	"insulin": null
}, {
	"_id": "6272bd41a3dc0ad676e0cefe",
	"created_at": "2022-05-04T16:50:00.000Z",
	"eventType": "Meal Bolus",
	"carbs": 30,
	"insulin": null
}
]

export const bolusTreatments = [{
	"_id": "62764c27a3dc0ad6768cce46",
	"enteredBy": "TheBoss",
	"eventType": "Carb Correction",
	"carbs": 12,
	"created_at": "2022-05-07T10:20:00.000Z",
	"utcOffset": 0,
	"insulin": null
}, {
	"_id": "62754944a3dc0ad67616d2a2",
	"enteredBy": "TheBoss",
	"eventType": "Meal Bolus",
	"insulin": 20,
	"preBolus": 0,
	"utcOffset": 0,
	"protein": "",
	"fat": "",
	"duration": 0,
	"profile": "",
	"created_at": "2022-05-06T16:00:00.000Z",
	"carbs": null
}
]

export const getFlatHeartRate = (hr: Activity, hoursDuration): Activity[] => {
	const result = [];
	const end = moment(hr.created_at).add(hoursDuration, 'h');
	let newTime = moment(hr.created_at);
	while (newTime.toISOString() < end.toISOString()) {
		result.push({ created_at: newTime.toISOString(), heartRate: hr.heartRate })
		newTime = newTime.add(5, 'm');
	}



	return result;
}
