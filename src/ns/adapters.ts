import {
	CoreGlucoseEntry,
	CorePatient,
	CoreTreatment,
	Entry,
	MealBolusTreatment,
	NSProfile,
	NSTreatment,
	PatientInfoCgmsim,
	Sgv,
	isMealBolusTreatment,
} from '../core/types';

/**
 * Converts a Nightscout treatment DTO to a clean CoreTreatment
 */
export function toCoreTreatment(treatment: NSTreatment): CoreTreatment {
	const timestamp = new Date(treatment.created_at);

	if (isMealBolusTreatment(treatment)) {
		const isCarb = (treatment.carbs ?? 0) > 0 && !(treatment.insulin ?? 0);
		const isBolus = (treatment.insulin ?? 0) > 0 && !(treatment.carbs ?? 0);

		return {
			timestamp,
			type: isCarb ? 'carb' : isBolus ? 'bolus' : 'bolus',
			units: treatment.insulin,
			carbs: treatment.carbs,
		};
	}

	if (treatment.eventType === 'Temp Basal') {
		return {
			timestamp,
			type: 'basal',
			units: treatment.rate,
			durationMinutes: treatment.duration,
		};
	}

	if (treatment.eventType === 'Announcement') {
		const notes = treatment.notes || '';
		return {
			timestamp,
			type: 'note',
			notes,
		};
	}

	return {
		timestamp,
		type: 'note',
	};
}

/**
 * Converts an array of Nightscout treatments to CoreTreatments
 */
export function toCoreTreatments(treatments: NSTreatment[]): CoreTreatment[] {
	if (!treatments || !Array.isArray(treatments)) return [];
	return treatments.map(toCoreTreatment);
}

/**
 * Converts a Nightscout Sgv or Entry to a clean CoreGlucoseEntry
 */
export function toCoreGlucoseEntry(entry: Sgv | Entry): CoreGlucoseEntry {
	if ('date' in entry) {
		return {
			timestamp: new Date(entry.date),
			sgv: entry.sgv,
			direction: entry.direction as any,
		};
	}
	return {
		timestamp: new Date(entry.mills),
		sgv: entry.sgv,
	};
}

/**
 * Converts an array of Nightscout entries to CoreGlucoseEntries
 */
export function toCoreGlucoseEntries(entries: (Sgv | Entry)[]): CoreGlucoseEntry[] {
	if (!entries || !Array.isArray(entries)) return [];
	return entries.map(toCoreGlucoseEntry);
}

/**
 * Converts Nightscout patient parameters to CorePatient
 */
export function toCorePatient(patient: PatientInfoCgmsim): CorePatient {
	return {
		isf: patient.ISF,
		cr: patient.CR,
		dia: patient.DIA,
		tp: patient.TP,
		weight: patient.WEIGHT,
		age: patient.AGE,
		gender: patient.GENDER,
		carbsAbsTime: patient.CARBS_ABS_TIME,
		tz: patient.TZ,
	};
}

/**
 * Converts Nightscout profiles to hourly basal profile array
 */
export function toCoreBasalProfile(profiles: NSProfile[], profileName?: string): { hour: number; rate: number }[] {
	if (!profiles || !profiles.length) return [];

	const sortedProfiles = [...profiles].sort(
		(a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
	);
	const activeProfile = sortedProfiles[0];
	if (!activeProfile || !activeProfile.store) return [];

	const selectedName = profileName || activeProfile.defaultProfile;
	const store = activeProfile.store[selectedName];
	if (!store || !store.basal) return [];

	if (typeof store.basal === 'number') {
		const basalRate = store.basal;
		return Array.from({ length: 24 }, (_, hour) => ({ hour, rate: basalRate }));
	}

	if (Array.isArray(store.basal)) {
		return store.basal.map((b) => {
			const [hourStr] = b.time.split(':');
			return {
				hour: parseInt(hourStr, 10),
				rate: b.value,
			};
		});
	}

	return [];
}
