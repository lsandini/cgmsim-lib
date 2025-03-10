import { deleteBase, removeTrailingSlash, uploadBase } from './utils';
import { Entry, EntryValueType } from './Types';
import moment = require('moment');
import logger from './utils';
import { Activity, DeviceStatus } from './Types';
import { SimulationResult } from './Types';
import { Note } from './Types';

/**
 * Uploads device status to the Nightscout API.
 * @param deviceStatus - The device status data to upload.
 * @param nsUrl - Nightscout URL.
 * @param apiSecret - Nightscout API secret.
 * @returns A promise that resolves when the upload is complete.
 * @throws Error if the upload fails.
 * @example
 * // Upload device status to Nightscout
 * const deviceStatus = {
 *   // ... device status data ...
 * };
 *
 * uploadDeviceStatus(deviceStatus, "https://nightscout.example.com", "apiSecret123")
 *   .then(() => {
 *     console.log("Device status uploaded successfully.");
 *   })
 *   .catch((error) => {
 *     console.error("Error uploading device status:", error);
 *   });
 */
export async function deleteDeviceStatus(days: number, nsUrl: string, apiSecret: string) {
	logger.debug('[delete] device status older then days: %o', days);

	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/devicestatus/';

	return deleteBase(days, api_url, apiSecret)
		.then(() => {
			logger.debug('[delete] DeviceStatus data uploaded successfully');
		})
		.catch((error) => {
			logger.error('[delete] Delete failed:', error);
		});
}
