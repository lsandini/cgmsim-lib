import logger, { getDeltaMinutes, getInsulinActivity } from './utils';
import * as moment from 'moment';
import { Profile, Treatment } from './Types';

function getTempBasal(treatments, duration) {
	const computedTempBasal: { start: moment.Moment; end: moment.Moment; insulin: number; }[] = [];
	const now = moment().utc();
	treatments
		.filter(e =>
			e.created_at &&
			now.diff(moment(e.created_at), 'minutes') <= duration && // temps basals set in the last 3 hours
			e.eventType === 'Temp Basal' &&
			e.duration != 0
		)
		.sort((f, s) => {
			return moment(f.created_at).diff(s.created_at);
		})
		.forEach((b) => {
			if (b.absolute !== undefined) {
				const start = moment(b.created_at).utc();
				const end = moment(b.created_at).add(b.duration, 'minutes').utc();
				computedTempBasal.push({
					start,
					insulin: b.absolute,
					end
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

function getBasalFromProfile(defaultProfileBasals: { time: string, value: number }[], currentAction: moment.Moment) {
	//last basal before the end
	const compatiblesBasalProfiles = defaultProfileBasals.filter(b => {
		return b.time.localeCompare(currentAction.format('HH:mm')) <= 0;
	});
	const index = compatiblesBasalProfiles.length - 1;
	const currentBasal = compatiblesBasalProfiles[index];
	return currentBasal;
}


export default function (treatments: Treatment[], profiles: Profile[], dia: number, peak: number) {
	const basalAsBoluses: { minutesAgo: number, insulin: number }[] = [];
	const endDiaAction = moment().utc();
	const startDiaAction = moment().add(-dia, 'hour').set({ minute: 0, second: 0, millisecond: 0 }).utc();
	const duration = dia * 60;

	const lastProfile = profiles
		.filter(profile => profile.store.Default && profile.store['Default'])
		.sort((first, second) => (moment(second.startDate).diff(moment(first.startDate))))[0];

	if (!lastProfile) {
		return 0;
	}
	const defaultProfileBasals = lastProfile.store.Default.basal;


	const computedTempBasal = getTempBasal(treatments, duration);

	// const basalsToUpdate = [];
	for (let currentAction = startDiaAction; currentAction.diff(endDiaAction) <= 0; currentAction.add(5, 'minutes')) {
		const tempBasalActives = computedTempBasal
			.filter(t => (
				t.start.diff(currentAction) <= 0 &&
				t.end.diff(currentAction) > 0
			));
		let basalToUpdate: { minutesAgo: number, insulin: number };
		//if there is a temp basal actives
		if (tempBasalActives.length > 0) {
			basalToUpdate = {
				minutesAgo: getDeltaMinutes(currentAction.toISOString()),
				insulin: tempBasalActives[0].insulin / 12,
			};
		} else {
			let currentBasal = { value: 0 };
			if (Array.isArray(defaultProfileBasals)) {
				currentBasal = getBasalFromProfile(defaultProfileBasals, currentAction);
			}else{
				currentBasal = { value: defaultProfileBasals }
			}

			basalToUpdate = {
				minutesAgo: getDeltaMinutes(currentAction.toISOString()),
				insulin: currentBasal.value / 12,
			};
		}
		basalAsBoluses.push(basalToUpdate);
	}

	const pumpBasalAct = basalAsBoluses
		.reduce((tot, entry) => tot + getInsulinActivity(peak, duration, entry.minutesAgo, entry.insulin), 0)
	logger.debug('the pump\'s basal activity is: %o', pumpBasalAct);
	return pumpBasalAct;
}

