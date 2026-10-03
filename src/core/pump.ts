import logger from './logger';
import { getDeltaMinutes, getExpTreatmentActivity, getExpTreatmentIOB } from './utils';
import { NSProfile, NSTreatment } from './types';
import { TypeDateISO } from './TypeDateISO';

function getUtcHourMinute(timeMs: number): string {
	return new Date(timeMs).toISOString().substring(11, 16);
}

function getProfileSwitch(treatments: NSTreatment[], duration: number) {
	const computedProfileSwitches: {
		start: number;
		end: number;
		insulin: number;
	}[] = [];
	const nowMs = Date.now();

	treatments
		.filter(
			(e) =>
				e.created_at &&
				(nowMs - new Date(e.created_at).getTime()) / 60000 <= duration &&
				e.eventType === 'Profile Switch' &&
				e.duration !== 0,
		)
		.sort((f, s) => new Date(f.created_at).getTime() - new Date(s.created_at).getTime())
		.forEach((tr) => {
			if (tr.eventType === 'Profile Switch' && tr.profileJson && tr.percentage) {
				const startTime = new Date(tr.created_at).getTime();
				const endTime = startTime + tr.duration * 60000;
				const profile = JSON.parse(tr.profileJson);

				if (Array.isArray(profile.basal)) {
					const adjustedBasals = profile.basal.map((pb: { time: string; value: number }) => ({
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
				const lastProfileIndex = computedProfileSwitches.length - 1;
				if (lastProfileIndex >= 0) {
					computedProfileSwitches[lastProfileIndex].end = new Date(tr.created_at).getTime();
				}
			}
		});
	return computedProfileSwitches;
}

function getTemporaryOverride(treatments: NSTreatment[], duration: number, orderedProfiles: NSProfile[]) {
	const temporaryOverrides: {
		start: number;
		end: number;
		insulin: number;
	}[] = [];
	const nowMs = Date.now();

	treatments
		.filter(
			(e) =>
				e.created_at &&
				(nowMs - new Date(e.created_at).getTime()) / 60000 <= duration &&
				e.eventType === 'Temporary Override' &&
				e.duration !== 0,
		)
		.sort((f, s) => new Date(f.created_at).getTime() - new Date(s.created_at).getTime())
		.forEach((tr) => {
			if (tr.eventType === 'Temporary Override' && tr.insulinNeedsScaleFactor) {
				const startTime = new Date(tr.created_at).getTime();
				const endTime = startTime + tr.duration * 60000;
				const baseInsulin = getBasalFromProfiles(orderedProfiles, startTime);
				const adjustedInsulin = baseInsulin * tr.insulinNeedsScaleFactor;

				temporaryOverrides.push({
					start: startTime,
					insulin: adjustedInsulin,
					end: endTime,
				});
			} else {
				const lastOverrideIndex = temporaryOverrides.length - 1;
				if (lastOverrideIndex >= 0) {
					temporaryOverrides[lastOverrideIndex].end = new Date(tr.created_at).getTime();
				}
			}
		});
	return temporaryOverrides;
}

function getTempBasal(treatments: NSTreatment[], duration: number) {
	const computedTempBasal: {
		start: number;
		end: number;
		insulin: number;
	}[] = [];
	const nowMs = Date.now();

	treatments
		.filter(
			(e) =>
				e.created_at &&
				nowMs - new Date(e.created_at).getTime() <= duration * 60000 &&
				e.eventType === 'Temp Basal' &&
				e.duration !== 0,
		)
		.sort((f, s) => new Date(f.created_at).getTime() - new Date(s.created_at).getTime())
		.forEach((b) => {
			if (b.eventType === 'Temp Basal' && b.rate !== undefined) {
				const start = new Date(b.created_at).getTime();
				const durationInMilliseconds = b.durationInMilliseconds ?? b.duration * 60000;
				const tmpEnd = start + durationInMilliseconds;
				const end = tmpEnd < nowMs ? tmpEnd : nowMs;
				computedTempBasal.push({
					start,
					insulin: b.rate,
					end,
				});
			} else {
				const currentIndex = computedTempBasal.length - 1;
				if (currentIndex >= 0) {
					computedTempBasal[currentIndex].end = new Date(b.created_at).getTime();
				}
			}
		});
	return computedTempBasal;
}

function getBasalFromProfiles(orderedProfiles: NSProfile[], currentActionMs: number) {
	const activeProfiles = orderedProfiles.filter((p) => new Date(p.startDate).getTime() <= currentActionMs);
	if (activeProfiles && activeProfiles.length > 0) {
		const activeProfile = activeProfiles[0];
		const activeProfileName = activeProfile.defaultProfile;
		const activeProfileBasals = activeProfile.store[activeProfileName].basal;
		return activeBasalByTime(activeProfileBasals, currentActionMs);
	}
	return 0;
}

function activeBasalByTime(
	activeProfileBasals: { value: number; time: string; timeAsSecond?: number }[] | number,
	currentActionMs: number,
) {
	if (Array.isArray(activeProfileBasals)) {
		const currentTimeStr = getUtcHourMinute(currentActionMs);
		const compatiblesBasalProfiles = activeProfileBasals.filter((b) => {
			return b.time.localeCompare(currentTimeStr) <= 0;
		});
		const index = compatiblesBasalProfiles.length - 1;
		const currentBasal = compatiblesBasalProfiles[index];
		return currentBasal ? currentBasal.value : activeProfileBasals[0].value;
	} else {
		return activeProfileBasals;
	}
}

export function calculateBasalAsBoluses(
	treatments: NSTreatment[],
	profiles: NSProfile[],
	dia: number,
	minutesStep: number,
) {
	const steps = 60 / minutesStep;
	const basalAsBoluses: { minutesAgo: number; insulin: number }[] = [];
	const nowMs = Date.now();
	const endDiaAction = nowMs;

	const startDiaDate = new Date(nowMs - dia * 3600000);
	startDiaDate.setUTCMinutes(0, 0, 0);
	const startDiaAction = startDiaDate.getTime();
	const duration = dia * 60;

	const orderedProfiles = profiles
		.filter((profile) => profile.store && profile.store[profile.defaultProfile])
		.sort((first, second) => new Date(second.startDate).getTime() - new Date(first.startDate).getTime());

	const computedTempBasal = getTempBasal(treatments, duration);
	const computedProfileSwitch = getProfileSwitch(treatments, duration);
	const computedTemporaryOverride = getTemporaryOverride(treatments, duration, orderedProfiles);

	for (let currentAction = startDiaAction; currentAction <= endDiaAction; currentAction += minutesStep * 60000) {
		const activeBasal = [...computedTempBasal, ...computedProfileSwitch, ...computedTemporaryOverride].find(
			(t) => t.start <= currentAction && t.end > currentAction,
		);

		const insulin = (activeBasal ? activeBasal.insulin : getBasalFromProfiles(orderedProfiles, currentAction)) / steps;
		basalAsBoluses.push({
			minutesAgo: getDeltaMinutes(new Date(currentAction).toISOString() as TypeDateISO),
			insulin,
		});
	}

	return basalAsBoluses;
}

export default function calculatePumpBasal(
	treatments: NSTreatment[],
	profiles: NSProfile[],
	dia: number,
	peak: number,
) {
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

export function calculateProfileIOB(profiles: NSProfile[], dia: number, peak: number): number {
	const minutesStep = 5;
	const basalAsBoluses = calculateBasalAsBoluses([], profiles, dia, minutesStep);

	const profileBasalIOB = basalAsBoluses.reduce(
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

	logger.debug("[pump] the profile's basal IOB is: %o", profileBasalIOB);
	return profileBasalIOB;
}
