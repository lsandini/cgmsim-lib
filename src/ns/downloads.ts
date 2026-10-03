import logger from './logger';
import setupParams from './setupParams';
import { NSProfile, Sgv, NSTreatment } from '../core/types';
import { isHttps, removeTrailingSlash } from '../core/utils';
import fetch from 'node-fetch';

async function fetchAndParseData<T>({ endpoint, apiSecret }: { endpoint: string; apiSecret: string }): Promise<T[]> {
	const useHttps = isHttps(endpoint);
	const { getParams } = setupParams(apiSecret, useHttps);
	const response = await fetch(endpoint, getParams);
	if (response.status === 200) {
		return await response.json();
	} else {
		throw new Error(`API request failed with status ${response.status}`);
	}
}

function validateMaxCount(maxCount?: number): void {
	if (maxCount !== undefined && maxCount > 3000) {
		logger.error(`[downloads] maxCount exceeds the limit: ${maxCount}. It must be <= 3000.`);
		throw new Error('maxCount cannot exceed 3000.');
	}
}

export async function downloadNightscoutEntries(nsUrl: string, apiSecret: string, maxCount?: number): Promise<Sgv[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount
		? `${baseUrl}/api/v1/entries/sgv.json?count=${maxCount}`
		: `${baseUrl}/api/v1/entries/sgv.json`;

	logger.debug('[downloads] Fetching entries from:', endpoint);

	return fetchAndParseData<Sgv>({ endpoint, apiSecret });
}

export async function downloadNightscoutProfiles(
	nsUrl: string,
	apiSecret: string,
	maxCount?: number,
): Promise<NSProfile[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount ? `${baseUrl}/api/v1/profile.json?count=${maxCount}` : `${baseUrl}/api/v1/profile.json`;

	logger.debug('[downloads] Fetching profiles from:', endpoint);

	return fetchAndParseData<NSProfile>({ endpoint, apiSecret });
}

export async function downloadNightscoutTreatments(
	nsUrl: string,
	apiSecret: string,
	maxCount?: number,
): Promise<NSTreatment[]> {
	validateMaxCount(maxCount);

	const baseUrl = removeTrailingSlash(nsUrl);
	const endpoint = maxCount
		? `${baseUrl}/api/v1/treatments.json?count=${maxCount}`
		: `${baseUrl}/api/v1/treatments.json`;

	logger.debug('[downloads] Fetching treatments from:', endpoint);

	return fetchAndParseData<NSTreatment>({ endpoint, apiSecret });
}

export default async function downloads(nsUrl: string, apiSecret: string, maxCount?: number) {
	const entries = await downloadNightscoutEntries(nsUrl, apiSecret, maxCount);
	const treatments = await downloadNightscoutTreatments(nsUrl, apiSecret, maxCount);
	const profiles = await downloadNightscoutProfiles(nsUrl, apiSecret, maxCount);

	return {
		entries,
		treatments,
		profiles,
	};
}
