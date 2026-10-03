import { NSProfile } from './types';

export default function calculateBasalProfile(profile: NSProfile[]): number {
	if (!profile || profile.length === 0) {
		return 0;
	}

	const sortedProfiles = [...profile].sort(
		(first, second) => new Date(second.startDate).getTime() - new Date(first.startDate).getTime(),
	);

	const lastProfile = sortedProfiles[0];
	if (!lastProfile || !lastProfile.store || !lastProfile.defaultProfile) {
		return 0;
	}

	const defaultProfile = lastProfile.defaultProfile;
	const profileConfig = lastProfile.store[defaultProfile];
	if (!profileConfig) {
		return 0;
	}

	const defaultProfileBasals = Array.isArray(profileConfig.basal) ? profileConfig.basal[0].value : profileConfig.basal;

	return defaultProfileBasals / 60;
}
