import { removeTrailingSlash, uploadBase, loadBase } from './utils';
import { Entry, EntryValueType } from './Types';
import moment = require('moment');
import logger from './utils';
import { Activity, DeviceStatus } from './Types';
import { SimulationResult } from './Types';
import { Note } from './Types';
/**
 * Uploads notes to the Nightscout API.
 * @param notes - The notes to upload.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves when the upload is complete.
 * @example
 * // Upload a note to Nightscout
 * uploadNotes("Important note", "https://nightscout.example.com", "apiSecret123")
 *   .then(() => {
 *     console.log("Note uploaded successfully.");
 *   })
 *   .catch((error) => {
 *     console.error("Error uploading note:", error);
 *   });
 **/
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
/**
 * Uploads logs to the Nightscout API.
 * @param simResult - Simulation result with attached notes.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves when the upload is complete.
 * @example
 * // Upload simulation logs to Nightscout
 * const simulationResult = {
 *   // ... simulation result data ...
 *   notes: "Simulation complete",
 * };
 *
 * uploadLogs(simulationResult, "https://nightscout.example.com", "apiSecret123")
 *   .then(() => {
 *     console.log("Logs uploaded successfully.");
 *   })
 *   .catch((error) => {
 *     console.error("Error uploading logs:", error);
 *   });
 */
export function uploadLogs(simResult: SimulationResult & { notes: string }, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/treatments/';
	const now = moment();
	const sim = {
		...simResult,
		type: 'logs',
		dateString: now.toISOString(),
		date: now.toDate().getTime(),
	};
	return uploadBase(sim, api_url, apiSecret)
		.then(() => {
			logger.debug('[upload] Logs uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
		});
}
/**
 * Uploads entries (e.g., blood glucose readings) to the Nightscout API.
 * @param cgmsim - The entry data to upload.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves when the upload is complete.
 * @example
 * // Upload a blood glucose entry to Nightscout
 * const glucoseEntry = {
 *   // ... glucose entry data ...
 * };
 *
 * uploadEntries(glucoseEntry, "https://nightscout.example.com", "apiSecret123")
 *   .then(() => {
 *     console.log("Blood glucose entry uploaded successfully.");
 *   })
 *   .catch((error) => {
 *     console.error("Error uploading blood glucose entry:", error);
 *   });
 */
export function uploadEntries(cgmsim: EntryValueType, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/entries/';
	const now = moment();
	const entry: Entry = {
		...cgmsim,
		type: 'sgv',
		dateString: now.toISOString(),
		date: now.toDate().getTime(),
	};
	return uploadBase(entry, api_url, apiSecret)
		.then(() => {
			logger.debug('[upload] Blood glucose entry uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
		});
}

/**
 * Uploads activity data to the Nightscout API.
 * @param activity - Activity data to upload.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves when the upload is complete.
 * @example
 * // Upload activity data to Nightscout
 * const activityData = {
 *   // ... activity data ...
 * };
 *
 * uploadActivity(activityData, "https://nightscout.example.com", "apiSecret123")
 *   .then(() => {
 *     console.log("Activity data uploaded successfully.");
 *   })
 *   .catch((error) => {
 *     console.error("Error uploading activity data:", error);
 *   });
 */
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

/**
 * Uploads device status to the Nightscout API.
 * @param cob - Carbs on board.
 * @param iob - Insulin on board.
 * @param basalIob - Basal insulin on board.
 * @param bolusIob - Bolus insulin on board.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves when the upload is complete.
 * @example
 * // Upload device status to Nightscout
 * uploadDeviceStatus(30, 5, 2, 3, "https://nightscout.example.com", "apiSecret123")
 *   .then(() => {
 *     console.log("Device status uploaded successfully.");
 *   })
 *   .catch((error) => {
 *     console.error("Error uploading device status:", error);
 *   });
 */
export async function uploadDeviceStatus(
	cob: number,
	iob: number,
	basalIob: number,
	bolusIob: number,
	nsUrl: string,
	apiSecret: string,
) {
	logger.debug('[upload] device status %o', { iob, cob });

	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/devicestatus/';
	const deviceStatus = (await loadBase(api_url, apiSecret)) as DeviceStatus[];
	let latestDeviceStatus = {};
	if (deviceStatus.length > 0) {
		latestDeviceStatus = deviceStatus.sort((a, b) => moment(b.created_at).diff(moment(a.created_at)))[0];
	}
	const now = new Date().toISOString();
	return uploadBase(
		{
			...latestDeviceStatus,
			created_at: now,
			openaps: {
				openaps: {
					iob: iob,
					time: now,
					basaliob: basalIob,
					bolusiob: bolusIob,
				},
				suggested: { COB: cob, timestamp: now },
			},
		},
		api_url,
		apiSecret,
	)
		.then(() => {
			logger.debug('[upload] Activity data uploaded successfully');
		})
		.catch((error) => {
			logger.error('[upload] Upload failed:', error);
		});
}
