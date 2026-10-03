import logger from './logger';
import { uploadBase } from './client';
import { removeTrailingSlash } from '../core/utils';
import {
	isMealBolusTreatment,
	TempBasalTreatment,
	MealBolusTreatment,
	Note,
	SimulationResult,
	EntryValueType,
	Entry,
	Activity,
	DeviceStatus,
} from '../core/types';

export function uploadNotes(notes: string, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/treatments/';
	const noteTreatment: Note = { type: 'Note', notes };
	return uploadBase(noteTreatment, api_url, apiSecret)
		.then(() => {
			logger.debug('[upload] Note uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
		});
}

export function uploadLogs(simResult: SimulationResult & { notes: string }, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/treatments/';
	const now = new Date();
	const sim = {
		...simResult,
		type: 'logs',
		dateString: now.toISOString(),
		date: now.getTime(),
	};
	return uploadBase(sim, api_url, apiSecret)
		.then(() => {
			logger.debug('[upload] Logs uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
		});
}

export function uploadEntries(cgmsim: EntryValueType, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/entries/';
	const now = new Date();
	const entry: Entry = {
		...cgmsim,
		type: 'sgv',
		dateString: now.toISOString(),
		date: now.getTime(),
	};
	return uploadBase(entry, api_url, apiSecret)
		.then(() => {
			logger.debug('[upload] Blood glucose entry uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
		});
}

export function uploadActivity(activity: Activity, nsUrl: string, apiSecret: string) {
	logger.debug('[upload] log something %o', activity);

	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/activity/';
	return uploadBase(activity, api_url, apiSecret)
		.then(() => {
			logger.debug('[upload] Activity data uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
		});
}

export async function uploadDeviceStatus(deviceStatus: DeviceStatus, nsUrl: string, apiSecret: string) {
	logger.debug('[upload] device status %o', deviceStatus);

	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/devicestatus/';

	return uploadBase(deviceStatus, api_url, apiSecret)
		.then(() => {
			logger.debug('[upload] DeviceStatus data uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
			throw error;
		});
}

export async function uploadTreatments(
	treatment: TempBasalTreatment | MealBolusTreatment,
	nsUrl: string,
	apiSecret: string,
): Promise<void> {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/treatments/';

	const now = new Date(treatment.created_at);
	const mills = now.getTime();

	const completeTreatment = {
		...treatment,
		mills,
		utcOffset: 0,
	};

	if (isMealBolusTreatment(treatment)) {
		if (!('carbs' in treatment) || treatment.carbs === undefined) {
			(completeTreatment as any).carbs = null;
		}
	} else {
		(completeTreatment as any).carbs = null;
		(completeTreatment as any).insulin = null;
	}

	return uploadBase(completeTreatment, api_url, apiSecret)
		.then(() => {
			if (isMealBolusTreatment(treatment)) {
				logger.debug('[upload] Meal bolus treatment uploaded successfully');
			} else {
				logger.debug('[upload] Temporary basal treatment uploaded successfully');
			}
		})
		.catch((error) => {
			logger.error('[upload] Treatment upload failed:', error);
			throw error;
		});
}
