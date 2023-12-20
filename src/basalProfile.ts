import moment = require('moment');
import { Profile } from './Types';
export default function (profile: Profile[]): number {
	let lastProfile: Profile = null;
	let lastProfiles = profile.sort((first, second) =>
		moment(second.startDate).diff(-moment(first.startDate)),
	);

	if (!lastProfiles || lastProfiles.length === 0) {
		return 0;
	}
	lastProfile = lastProfiles[0];
	const defaultProfile = lastProfile.defaultProfile;
	const defaultProfileBasals = Array.isArray(
		lastProfile.store[defaultProfile].basal,
	)
		? lastProfile.store[defaultProfile].basal[0].value
		: lastProfile.store[defaultProfile].basal;
	return defaultProfileBasals / 60;
}
