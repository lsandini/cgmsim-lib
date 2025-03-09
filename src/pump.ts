import logger, { getDeltaMinutes, getExpTreatmentActivity, getExpTreatmentIOB } from './utils';
import * as moment from 'moment';
import { NSProfile, NSTreatment } from './Types';
import { TypeDateISO } from './TypeDateISO';

/**
 * Gets profile switches from treatments within specified duration
 * @param treatments - Array of treatments
 * @param duration - Duration in minutes to look back
 * @returns Array of computed profile switches with insulin rates
 */
function getProfileSwitch(treatments: NSTreatment[], duration: number) {
	const computedProfileSwitches: {
		start: moment.Moment;
		end: moment.Moment;
		insulin: number;
	}[] = [];
	const now = moment().utc();

	treatments
		.filter(
			(e) =>
				e.created_at &&
				now.diff(moment(e.created_at), 'minutes') <= duration && // Profile switches in last duration minutes
				e.eventType === 'Profile Switch' &&
				e.duration != 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((tr) => {
			if (tr.eventType === 'Profile Switch' && tr.profileJson && tr.percentage) {
				const startTime = moment(tr.created_at).utc();
				const endTime = moment(tr.created_at).add(tr.duration, 'minutes').utc();
				const profile = JSON.parse(tr.profileJson);

				// Handle array or single value basal profiles
				if (Array.isArray(profile.basal)) {
					const adjustedBasals = profile.basal.map((pb) => ({
						time: pb.time,
						value: pb.value * (tr.percentage / 100),
					}));
					const currentBasal = activeBasalByTime(adjustedBasals, startTime);

					computedProfileSwitches.push({
						start: startTime,
						insulin: currentBasal,
						end: endTime,
					});
				} else {
					computedProfileSwitches.push({
						start: startTime,
						insulin: profile.basal * (tr.percentage / 100),
						end: endTime,
					});
				}
			} else {
				// Handle profile switch cancellation
				const lastProfileIndex = computedProfileSwitches.length - 1;
				if (lastProfileIndex >= 0) {
					computedProfileSwitches[lastProfileIndex].end = moment(tr.created_at);
				}
			}
		});
	return computedProfileSwitches;
}

/**
 * Gets temporary override settings from treatments
 * @param treatments - Array of treatments
 * @param duration - Duration in minutes to look back
 * @param orderedProfiles - Array of profiles ordered by date
 * @returns Array of computed temporary overrides
 */
function getTemporaryOverride(treatments: NSTreatment[], duration: number, orderedProfiles: NSProfile[]) {
	const temporaryOverrides: {
		start: moment.Moment;
		end: moment.Moment;
		insulin: number;
	}[] = [];
	const now = moment().utc();

	treatments
		.filter(
			(e) =>
				e.created_at &&
				now.diff(moment(e.created_at), 'minutes') <= duration && // Overrides in last duration minutes
				e.eventType === 'Temporary Override' &&
				e.duration != 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((tr) => {
			if (tr.eventType === 'Temporary Override' && tr.insulinNeedsScaleFactor) {
				const startTime = moment(tr.created_at).utc();
				const endTime = moment(tr.created_at).add(tr.duration, 'minutes').utc();
				const baseInsulin = getBasalFromProfiles(orderedProfiles, startTime);
				const adjustedInsulin = baseInsulin * tr.insulinNeedsScaleFactor;

				temporaryOverrides.push({
					start: startTime,
					insulin: adjustedInsulin,
					end: endTime,
				});
			} else {
				// Handle override cancellation
				const lastOverrideIndex = temporaryOverrides.length - 1;
				if (lastOverrideIndex >= 0) {
					temporaryOverrides[lastOverrideIndex].end = moment(tr.created_at);
				}
			}
		});
	return temporaryOverrides;
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
				now.diff(moment(e.created_at), 'milliseconds') <= duration * (60 * 1000) && // temps basals set in the last 3 hours
				e.eventType === 'Temp Basal' &&
				e.duration !== 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((b) => {
			if (b.eventType === 'Temp Basal' && b.rate !== undefined) {
				const start = moment(b.created_at).utc();
				const tmpEnd = moment(b.created_at).add(b.durationInMilliseconds, 'milliseconds').utc();
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

function getBasalFromProfiles(orderedProfiles: NSProfile[], currentAction: moment.Moment) {
	//last basal before the end
	const activeProfiles = orderedProfiles.filter((p) => moment(p.startDate).diff(currentAction) <= 0);
	if (activeProfiles && activeProfiles.length > 0) {
		const activeProfile = activeProfiles[0];
		const activeProfileName = activeProfile.defaultProfile;
		const activeProfileBasals = activeProfile.store[activeProfileName].basal;
		return activeBasalByTime(activeProfileBasals, currentAction);
	}
	return 0;
}

function activeBasalByTime(
	activeProfileBasals: { value: number; time: string; timeAsSecond?: number }[] | number,
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

function calculateBasalAsBoluses(treatments: NSTreatment[], profiles: NSProfile[], dia: number, minutesStep: number) {
	const steps = 60 / minutesStep;
	const basalAsBoluses: { minutesAgo: number; insulin: number }[] = [];
	const endDiaAction = moment().utc();
	const startDiaAction = moment().add(-dia, 'hour').set({ minute: 0, second: 0, millisecond: 0 }).utc();
	const duration = dia * 60;

	const orderedProfiles = profiles
		.filter((profile) => profile.store[profile.defaultProfile])
		.sort((first, second) => moment(second.startDate).diff(moment(first.startDate)));

	const computedTempBasal = getTempBasal(treatments, duration);
	const computedProfileSwitch = getProfileSwitch(treatments, duration);
	const computedTemporaryOverride = getTemporaryOverride(treatments, duration, orderedProfiles);

	for (
		let currentAction = startDiaAction;
		currentAction.diff(endDiaAction) <= 0;
		currentAction.add(minutesStep, 'minutes')
	) {
		const activeBasal = [...computedTempBasal, ...computedProfileSwitch, ...computedTemporaryOverride].find(
			(t) => t.start.diff(currentAction) <= 0 && t.end.diff(currentAction) > 0,
		);

		const insulin = (activeBasal ? activeBasal.insulin : getBasalFromProfiles(orderedProfiles, currentAction)) / steps;
		basalAsBoluses.push({
			minutesAgo: getDeltaMinutes(currentAction.toISOString() as TypeDateISO),
			insulin,
		});
	}

	return basalAsBoluses;
}

export default function (treatments: NSTreatment[], profiles: NSProfile[], dia: number, peak: number) {
	const minutesStep = 5;
	const basalAsBoluses = calculateBasalAsBoluses(treatments, profiles, dia, minutesStep);

	const pumpBasalAct = basalAsBoluses.reduce(
		(tot, entry) =>
			tot +
			getExpTreatmentActivity({
				peak,
				duration: dia * 60,
				minutesAgo: entry.minutesAgo,
				units: entry.insulin,
			}),
		0,
	);
	logger.debug("[pump] the pump's basal activity is: %o", pumpBasalAct);
	return pumpBasalAct;
}

export function calculatePumpIOB(treatments: NSTreatment[], profiles: NSProfile[], dia: number, peak: number): number {
	const minutesStep = 5;
	const basalAsBoluses = calculateBasalAsBoluses(treatments, profiles, dia, minutesStep);

	const pumpBasalIOB = basalAsBoluses.reduce(
		(tot, entry) =>
			tot +
			getExpTreatmentIOB({
				peak,
				duration: dia * 60,
				minutesAgo: entry.minutesAgo,
				units: entry.insulin,
			}),
		0,
	);

	logger.debug("[pump] the pump's basal IOB is: %o", pumpBasalIOB);
	return pumpBasalIOB;
}
