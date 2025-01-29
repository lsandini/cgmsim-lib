import logger, { getDeltaMinutes, getExpTreatmentActivity } from './utils';
import * as moment from 'moment';
import { NSProfile, NSTreatment } from './Types';
import { TypeDateISO } from './TypeDateISO';

/**
 * Gets profile switches from treatments within specified duration
 * @param treatments - Array of treatments
 * @param duration - Duration in minutes to look back
 * @returns Array of computed profile switches with basal rates
 */
function getProfileSwitch(treatments: NSTreatment[], duration: number) {
	const computedProfileSwitches: {
		start: moment.Moment;
		end: moment.Moment;
		basal: { time: string; value: number }[] | number;
	}[] = [];
	const now = moment().utc();
	treatments
		.filter(
			(tr) =>
				tr.created_at &&
				now.diff(moment(tr.created_at), 'minutes') <= duration && // temps basals set in the last 3 hours
				tr.eventType === 'Profile Switch' &&
				tr.duration != 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((tr) => {
			if (tr.eventType === 'Profile Switch' && tr.profileJson && tr.percentage) {
				const start = moment(tr.created_at).utc();
				const end = moment(tr.created_at).add(tr.duration, 'minutes').utc();
				const profile = JSON.parse(tr.profileJson);
				if (Array.isArray(profile.basal)) {
					const basals = profile.basal.map((pb) => ({
						time: pb.time,
						value: pb.value * (tr.percentage / 100),
					}));
					computedProfileSwitches.push({
						start,
						basal: basals,
						end,
					});
				} else {
					computedProfileSwitches.push({
						start,
						basal: profile.basal * (tr.percentage / 100),
						end,
					});
				}
			} else {
				const currentIndex = computedProfileSwitches.length - 1;
				if (currentIndex >= 0) {
					computedProfileSwitches[currentIndex].end = moment(tr.created_at);
				}
			}
		});
	return computedProfileSwitches;
}

/**
 * Gets temporary basal rates from treatments within specified duration
 * @param treatments - Array of treatments
 * @param duration - Duration in minutes to look back
 * @returns Array of computed temporary basal rates
 */
function getTempBasal(treatments: NSTreatment[], duration: number) {
	const computedTempBasals: {
		start: moment.Moment;
		end: moment.Moment;
		insulin: number;
	}[] = [];
	const now = moment().utc();
	treatments
		.filter(
			(tr) =>
				tr.created_at &&
				now.diff(moment(tr.created_at), 'milliseconds') <= duration * (60 * 1000) && // temps basals set in the last 3 hours
				tr.eventType === 'Temp Basal' &&
				tr.duration !== 0,
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((tr) => {
			if (tr.eventType === 'Temp Basal' && tr.rate !== undefined) {
				const start = moment(tr.created_at).utc();
				const tmpEnd = moment(tr.created_at).add(tr.durationInMilliseconds, 'milliseconds').utc();
				const end = tmpEnd.diff(now) < 0 ? tmpEnd : now;
				computedTempBasals.push({
					start,
					insulin: tr.rate,
					end,
				});
			} else {
				const currentIndex = computedTempBasals.length - 1;
				if (currentIndex >= 0) {
					computedTempBasals[currentIndex].end = moment(tr.created_at);
				}
			}
		});
	return computedTempBasals;
}

/**
 * Gets basal rate from profiles at a specific time
 * @param orderedProfiles - Array of profiles ordered by date
 * @param currentTime - Moment object representing the time to check
 * @returns Basal rate value
 */
function getBasalFromProfiles(orderedProfiles: NSProfile[], currentTime: moment.Moment) {
	const activeProfiles = orderedProfiles.filter((p) => moment(p.startDate).diff(currentTime) <= 0);
	if (activeProfiles && activeProfiles.length > 0) {
		const activeProfile = activeProfiles[0];
		const activeProfileName = activeProfile.defaultProfile;
		const activeProfileBasals = activeProfile.store[activeProfileName].basal;
		return getActiveBasalByTime(activeProfileBasals, currentTime);
	}
	return 0;
}

/**
 * Gets active basal rate for a specific time
 * @param profileBasals - Array of basal rates or single basal rate
 * @param currentTime - Moment object representing the time to check
 * @returns Active basal rate value
 */
function getActiveBasalByTime(
	profileBasals: { value: number; time: string; timeAsSecond?: number }[] | number,
	currentTime: moment.Moment,
) {
	if (Array.isArray(profileBasals)) {
		const compatibleBasalProfiles = profileBasals.filter((b) => {
			return b.time.localeCompare(currentTime.format('HH:mm')) <= 0;
		});
		const lastCompatibleBasal = compatibleBasalProfiles[compatibleBasalProfiles.length - 1];
		return lastCompatibleBasal.value;
	} else {
		return profileBasals;
	}
}

/**
 * Calculates pump insulin activity
 * @param treatments - Array of treatments
 * @param profiles - Array of profiles
 * @param dia - Duration of insulin action in hours
 * @param peak - Time to peak insulin activity in minutes
 * @returns Total pump basal activity
 */
export default function calculatePumpActivity(
	treatments: NSTreatment[],
	profiles: NSProfile[],
	dia: number,
	peak: number,
) {
	const basalAsBoluses: { minutesAgo: number; insulin: number }[] = [];
	const endTime = moment().utc();
	const startTime = moment().add(-dia, 'hour').set({ minute: 0, second: 0, millisecond: 0 }).utc();
	const duration = dia * 60;

	const orderedProfiles = profiles
		.filter((profile) => {
			const profileName = profile.defaultProfile;
			return profile.store[profileName];
		})
		.sort((first, second) => moment(second.startDate).diff(moment(first.startDate)));

	const tempBasals = getTempBasal(treatments, duration);
	const profileSwitches = getProfileSwitch(treatments, duration);

	for (let currentTime = startTime; currentTime.diff(endTime) <= 0; currentTime.add(5, 'minutes')) {
		const activeTempBasals = tempBasals.filter((t) => t.start.diff(currentTime) <= 0 && t.end.diff(currentTime) > 0);
		const activeProfileSwitches = profileSwitches.filter(
			(t) => t.start.diff(currentTime) <= 0 && t.end.diff(currentTime) > 0,
		);
		let basalEntry: { minutesAgo: number; insulin: number };
		if (activeTempBasals.length > 0) {
			basalEntry = {
				minutesAgo: getDeltaMinutes(currentTime.toISOString() as TypeDateISO),
				insulin: activeTempBasals[0].insulin / 12,
			};
		} else if (activeProfileSwitches.length > 0) {
			const basal = getActiveBasalByTime(activeProfileSwitches[0].basal, currentTime);
			basalEntry = {
				minutesAgo: getDeltaMinutes(currentTime.toISOString() as TypeDateISO),
				insulin: basal / 12,
			};
		} else {
			const currentBasal = {
				value: getBasalFromProfiles(orderedProfiles, currentTime),
			};
			basalEntry = {
				minutesAgo: getDeltaMinutes(currentTime.toISOString() as TypeDateISO),
				insulin: currentBasal.value / 12,
			};
		}
		basalAsBoluses.push(basalEntry);
	}

	const pumpBasalActivity = basalAsBoluses.reduce(
		(total, entry) =>
			total +
			getExpTreatmentActivity({
				peak,
				duration,
				minutesAgo: entry.minutesAgo,
				units: entry.insulin,
			}),
		0,
	);
	logger.debug('Current pump basal activity: %o', pumpBasalActivity);
	return pumpBasalActivity;
}
