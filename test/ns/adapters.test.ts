import {
	toCoreTreatment,
	toCoreTreatments,
	toCoreGlucoseEntry,
	toCorePatient,
	toCoreBasalProfile,
} from '../../src/ns/adapters';
import { MealBolusTreatment, NSProfile, PatientInfoCgmsim, Sgv, TempBasalTreatment } from '../../src/core/types';

describe('Nightscout Adapters (@lsandini/cgmsim-lib/ns)', () => {
	test('toCoreTreatment converts MealBolusTreatment correctly', () => {
		const nsMeal: MealBolusTreatment = {
			eventType: 'Meal Bolus',
			insulin: 4.5,
			carbs: 45,
			created_at: '2026-10-03T12:00:00.000Z',
		};

		const coreTreatment = toCoreTreatment(nsMeal);
		expect(coreTreatment.type).toBe('bolus');
		expect(coreTreatment.units).toBe(4.5);
		expect(coreTreatment.carbs).toBe(45);
		expect(new Date(coreTreatment.timestamp).toISOString()).toBe('2026-10-03T12:00:00.000Z');
	});

	test('toCoreTreatment converts TempBasalTreatment correctly', () => {
		const nsTemp: TempBasalTreatment = {
			eventType: 'Temp Basal',
			rate: 1.25,
			duration: 60,
			durationInMilliseconds: 3600000,
			created_at: '2026-10-03T12:30:00.000Z',
		};

		const coreTreatment = toCoreTreatment(nsTemp);
		expect(coreTreatment.type).toBe('basal');
		expect(coreTreatment.units).toBe(1.25);
		expect(coreTreatment.durationMinutes).toBe(60);
	});

	test('toCoreGlucoseEntry converts Sgv correctly', () => {
		const now = Date.now();
		const sgv: Sgv = {
			mills: now,
			sgv: 112,
		};

		const coreEntry = toCoreGlucoseEntry(sgv);
		expect(coreEntry.sgv).toBe(112);
		expect(new Date(coreEntry.timestamp).getTime()).toBe(now);
	});

	test('toCorePatient converts patient info correctly', () => {
		const nsPatient: PatientInfoCgmsim = {
			ISF: 40,
			CR: 12,
			DIA: 5,
			TP: 60,
			WEIGHT: 80,
			AGE: 40,
			GENDER: 'Male',
			TZ: 'Europe/Rome',
			CARBS_ABS_TIME: 360,
		};

		const corePatient = toCorePatient(nsPatient);
		expect(corePatient.isf).toBe(40);
		expect(corePatient.cr).toBe(12);
		expect(corePatient.dia).toBe(5);
		expect(corePatient.tp).toBe(60);
		expect(corePatient.weight).toBe(80);
		expect(corePatient.age).toBe(40);
		expect(corePatient.gender).toBe('Male');
		expect(corePatient.tz).toBe('Europe/Rome');
	});

	test('toCoreBasalProfile converts NSProfile array correctly', () => {
		const profiles: NSProfile[] = [
			{
				startDate: '2026-01-01T00:00:00.000Z',
				defaultProfile: 'Standard',
				store: {
					Standard: {
						basal: [
							{ time: '00:00', value: 0.7 },
							{ time: '06:00', value: 0.9 },
							{ time: '12:00', value: 0.8 },
						],
					},
				},
			},
		];

		const basalArr = toCoreBasalProfile(profiles);
		expect(basalArr).toHaveLength(3);
		expect(basalArr[0]).toEqual({ hour: 0, rate: 0.7 });
		expect(basalArr[1]).toEqual({ hour: 6, rate: 0.9 });
		expect(basalArr[2]).toEqual({ hour: 12, rate: 0.8 });
	});

	test('toCoreTreatment converts SMB MealBolusTreatment correctly', () => {
		const smbTreatment = {
			_id: '6aca268b19974d2bc470ab1f',
			created_at: '2026-10-10T11:50:35.170Z',
			insulin: 0.4,
			eventType: 'SMB' as const,
			enteredBy: 'Trio',
			id: '9E38E62F-79F8-44CD-9558-0C6AF165C824',
			utcOffset: 0,
			mills: 1791633035170,
			carbs: null,
		};

		const coreTreatment = toCoreTreatment(smbTreatment as any);
		expect(coreTreatment.type).toBe('bolus');
		expect(coreTreatment.units).toBe(0.4);
		expect(new Date(coreTreatment.timestamp).toISOString()).toBe('2026-10-10T11:50:35.170Z');
	});
});
