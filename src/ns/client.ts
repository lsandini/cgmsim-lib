import fetch from 'node-fetch';
import setupParams from './setupParams';
import logger from './logger';
import { isHttps, removeTrailingSlash } from '../core/utils';
import { Activity, DeviceStatus, Entry, Note, SimulationResult, Sgv, NSTreatment, NSProfile } from '../core/types';

/**
 * Uploads data to Nightscout API
 */
export function uploadBase(
	data: Entry | Activity | Note | SimulationResult | DeviceStatus | any,
	apiUrl: string,
	apiSecret: string,
): Promise<void> {
	const useHttps = isHttps(apiUrl);
	const { postParams } = setupParams(apiSecret, useHttps);
	const jsonData = JSON.stringify(data);

	return fetch(apiUrl, {
		...postParams,
		body: jsonData,
	})
		.then(() => {
			logger.debug('[ns/client] Successfully updated Nightscout');
		})
		.catch((error) => {
			logger.error('[ns/client] Error: %o', error);
			throw new Error(error);
		});
}

/**
 * Deletes data from Nightscout API older than specified days
 */
export function deleteBase(days: number, apiUrl: string, apiSecret: string): Promise<void> {
	const useHttps = isHttps(apiUrl);
	const { deleteParams } = setupParams(apiSecret, useHttps);
	const date = new Date();
	date.setDate(date.getDate() - days);
	const isoDate = date.toISOString().split('T')[0];

	return fetch(apiUrl + '?find[created_at][$lte]=' + isoDate, {
		...deleteParams,
	})
		.then(() => {
			logger.debug('[ns/client] Successfully deleted old data from Nightscout');
		})
		.catch((error) => {
			logger.debug('[ns/client] %o', error);
			throw new Error(error);
		});
}

/**
 * Loads data from Nightscout API
 */
export function loadBase(apiUrl: string, apiSecret: string): Promise<(Entry | Activity | Note | DeviceStatus)[]> {
	const useHttps = isHttps(apiUrl);
	const { getParams } = setupParams(apiSecret, useHttps);

	return fetch(apiUrl, {
		...getParams,
	})
		.then((response) => {
			logger.debug('[ns/client] Successfully loaded from Nightscout');
			return response.json();
		})
		.catch((error) => {
			logger.debug('[ns/client] %o', error);
			throw new Error(error);
		});
}

/**
 * Nightscout REST client encapsulation
 */
export class NightscoutClient {
	readonly nsUrl: string;
	readonly apiSecret: string;

	constructor(nsUrl: string, apiSecret: string) {
		this.nsUrl = removeTrailingSlash(nsUrl);
		this.apiSecret = apiSecret;
	}

	async getEntries(count = 50): Promise<Sgv[]> {
		const endpoint = `${this.nsUrl}/api/v1/entries/sgv.json?count=${count}`;
		const useHttps = isHttps(endpoint);
		const { getParams } = setupParams(this.apiSecret, useHttps);
		const res = await fetch(endpoint, getParams);
		if (!res.ok) throw new Error(`Failed to fetch entries: ${res.statusText}`);
		return (await res.json()) as Sgv[];
	}

	async getTreatments(count = 50): Promise<NSTreatment[]> {
		const endpoint = `${this.nsUrl}/api/v1/treatments.json?count=${count}`;
		const useHttps = isHttps(endpoint);
		const { getParams } = setupParams(this.apiSecret, useHttps);
		const res = await fetch(endpoint, getParams);
		if (!res.ok) throw new Error(`Failed to fetch treatments: ${res.statusText}`);
		return (await res.json()) as NSTreatment[];
	}

	async getProfiles(): Promise<NSProfile[]> {
		const endpoint = `${this.nsUrl}/api/v1/profile.json`;
		const useHttps = isHttps(endpoint);
		const { getParams } = setupParams(this.apiSecret, useHttps);
		const res = await fetch(endpoint, getParams);
		if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.statusText}`);
		return (await res.json()) as NSProfile[];
	}
}

export default NightscoutClient;
