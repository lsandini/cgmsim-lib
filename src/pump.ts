import logger, { getDeltaMinutes, getBiexpTreatmentActivity } from './utils';
import * as moment from 'moment';
import { NSProfile, NSTreatment } from './Types';
import { TypeDateISO } from './TypeDateISO';

function getProfileSwitch(treatments: NSTreatment[], duration: number) {
	const computedProfilesSwitch: {
		start: moment.Moment;
		end: moment.Moment;
		insulin: number;
	}[] = [];
	const now = moment().utc();
	treatments
		.filter(
			(e) =>
				e.created_at &&
				now.diff(moment(e.created_at), 'minutes') <= duration && // temps basals set in the last 3 hours
				e.eventType === 'Profile Switch' &&
				e.duration != 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((tr) => {
			if (
				tr.eventType === 'Profile Switch' &&
				tr.profileJson &&
				tr.percentage
			) {
				const start = moment(tr.created_at).utc();
				const end = moment(tr.created_at).add(tr.duration, 'minutes').utc();
				const profile = JSON.parse(tr.profileJson);
				if (Array.isArray(profile.basal)) {
					const basals = profile.basal.map((pb) => ({
						time: pb.time,
						value: pb.value * (tr.percentage / 100),
					}));
					const value = activeBasalByTime(basals, start);

					computedProfilesSwitch.push({
						start,
						insulin: value,
						end,
					});
				} else {
					computedProfilesSwitch.push({
						start,
						insulin: profile.basal * (tr.percentage / 100),
						end,
					});
				}
			} else {
				const currentIndex = computedProfilesSwitch.length - 1;
				if (currentIndex >= 0) {
					computedProfilesSwitch[currentIndex].end = moment(tr.created_at);
				}
			}
		});
	return computedProfilesSwitch;
}

function getTemporaryOverride(
	treatments: NSTreatment[],
	duration: number,
	orderedProfiles: NSProfile[],
) {
	const computedTemporaryOverride: {
		start: moment.Moment;
		end: moment.Moment;
		insulin: number;
	}[] = [];
	const now = moment().utc();
	treatments
		.filter(
			(e) =>
				e.created_at &&
				now.diff(moment(e.created_at), 'minutes') <= duration && // temps basals set in the last 3 hours
				e.eventType === 'Temporary Override' &&
				e.duration != 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((tr) => {
			if (tr.eventType === 'Temporary Override' && tr.insulinNeedsScaleFactor) {
				const start = moment(tr.created_at).utc();
				const end = moment(tr.created_at).add(tr.duration, 'minutes').utc();
				const insulin = getBasalFromProfiles(orderedProfiles, start);
				const value = insulin * tr.insulinNeedsScaleFactor;

				computedTemporaryOverride.push({
					start,
					insulin: value,
					end,
				});
			} else {
				const currentIndex = computedTemporaryOverride.length - 1;
				if (currentIndex >= 0) {
					computedTemporaryOverride[currentIndex].end = moment(tr.created_at);
				}
			}
		});
	return computedTemporaryOverride;
}

function getTempBasal(treatments: NSTreatment[], duration: number) {
	const computedTempBasal: {
		start: moment.Moment;
		end: moment.Moment;
		insulin: number;
	}[] = [];
	const now = moment().utc();
	treatments
		.filter(
			(e) =>
				e.created_at &&
				now.diff(moment(e.created_at), 'milliseconds') <=
					duration * (60 * 1000) && // temps basals set in the last 3 hours
				e.eventType === 'Temp Basal' &&
				e.duration !== 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((b) => {
			if (b.eventType === 'Temp Basal' && b.rate !== undefined) {
				const start = moment(b.created_at).utc();
				const tmpEnd = moment(b.created_at)
					.add(b.durationInMilliseconds, 'milliseconds')
					.utc();
				const end = tmpEnd.diff(now) < 0 ? tmpEnd : now;
				computedTempBasal.push({
					start,
					insulin: b.rate,
					end,
				});
			} else {
				const currentIndex = computedTempBasal.length - 1;
				if (currentIndex >= 0) {
					computedTempBasal[currentIndex].end = moment(b.created_at);
				}
			}
		});
	return computedTempBasal;
}

function getBasalFromProfiles(
	orderedProfiles: NSProfile[],
	currentAction: moment.Moment,
) {
	//last basal before the end
	const activeProfiles = orderedProfiles.filter(
		(p) => moment(p.startDate).diff(currentAction) <= 0,
	);
	if (activeProfiles && activeProfiles.length > 0) {
		const activeProfile = activeProfiles[0];
		const activeProfileName = activeProfile.defaultProfile;
		const activeProfileBasals = activeProfile.store[activeProfileName].basal;
		return activeBasalByTime(activeProfileBasals, currentAction);
	}
	return 0;
}

function activeBasalByTime(
	activeProfileBasals:
		| { value: number; time: string; timeAsSecond?: number }[]
		| number,
	currentAction: moment.Moment,
) {
	if (Array.isArray(activeProfileBasals)) {
		const compatiblesBasalProfiles = activeProfileBasals.filter((b) => {
			return b.time.localeCompare(currentAction.format('HH:mm')) <= 0;
		});
		const index = compatiblesBasalProfiles.length - 1;
		const currentBasal = compatiblesBasalProfiles[index];
		return currentBasal.value;
	} else {
		return activeProfileBasals;
	}
}

export default function (
	treatments: NSTreatment[],
	profiles: NSProfile[],
	dia: number,
	peak: number,
) {
	const minutesStep = 5;
	const steps = 60 / minutesStep;
	const basalAsBoluses: { minutesAgo: number; insulin: number }[] = [];
	const endDiaAction = moment().utc();
	const startDiaAction = moment()
		.add(-dia, 'hour')
		.set({ minute: 0, second: 0, millisecond: 0 })
		.utc();
	const duration = dia * 60;

	const orderedProfiles = profiles
		.filter((profile) => {
			const profileName = profile.defaultProfile;
			return profile.store[profileName];
		})
		.sort((first, second) =>
			moment(second.startDate).diff(moment(first.startDate)),
		);

	const computedTempBasal = getTempBasal(treatments, duration);
	const computedProfileSwitch = getProfileSwitch(treatments, duration);
	const computedTemporaryOverride = getTemporaryOverride(
		treatments,
		duration,
		orderedProfiles,
	);

	// const basalsToUpdate = [];
	for (
		let currentAction = startDiaAction;
		currentAction.diff(endDiaAction) <= 0;
		currentAction.add(minutesStep, 'minutes')
	) {
		const tempBasalActives = computedTempBasal.filter(
			(t) => t.start.diff(currentAction) <= 0 && t.end.diff(currentAction) > 0,
		);
		const profilesStichActives = computedProfileSwitch.filter(
			(t) => t.start.diff(currentAction) <= 0 && t.end.diff(currentAction) > 0,
		);
		const temporaryOverrideActives = computedTemporaryOverride.filter(
			(t) => t.start.diff(currentAction) <= 0 && t.end.diff(currentAction) > 0,
		);
		let basalToUpdate: { minutesAgo: number; insulin: number };
		//if there is a temp basal actives
		if (tempBasalActives.length > 0) {
			const insulin = tempBasalActives[0].insulin / steps;
			basalToUpdate = {
				minutesAgo: getDeltaMinutes(currentAction.toISOString() as TypeDateISO),
				insulin,
			};
		} else if (profilesStichActives.length > 0) {
			const insulin = profilesStichActives[0].insulin / steps;
			basalToUpdate = {
				minutesAgo: getDeltaMinutes(currentAction.toISOString() as TypeDateISO),
				insulin,
			};
		} else if (temporaryOverrideActives.length > 0) {
			const insulin = temporaryOverrideActives[0].insulin / steps;
			basalToUpdate = {
				minutesAgo: getDeltaMinutes(currentAction.toISOString() as TypeDateISO),
				insulin,
			};
		} else {
			const insulin =
				getBasalFromProfiles(orderedProfiles, currentAction) / steps;
			basalToUpdate = {
				minutesAgo: getDeltaMinutes(currentAction.toISOString() as TypeDateISO),
				insulin,
			};
		}
		basalAsBoluses.push(basalToUpdate);
	}

	const pumpBasalAct = basalAsBoluses.reduce(
		(tot, entry) =>
			tot +
			getBiexpTreatmentActivity({
				peak,
				duration,
				minutesAgo: entry.minutesAgo,
				units: entry.insulin,
			}),
		0,
	);
	logger.debug("the pump's basal activity is: %o", pumpBasalAct);
	return pumpBasalAct;
}
