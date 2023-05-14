import { removeTrailingSlash, uploadBase } from './utils';
import { Entry, EntryValueType } from './Types';
import moment = require('moment');
import logger from './utils';
import { Activity } from './Types';
import { SimulationResult } from './Types';
import { Note } from './Types';

export function uploadNotes(
	notes: string,
	nsUrl: string,
	apiSecret: string,
	instanceName: string
) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/treatments/';
	const noteTreatment: Note = { type: 'Note', notes };
	return uploadBase(noteTreatment, api_url, apiSecret, instanceName);
}

export function uploadLogs(
	simResult: SimulationResult & { notes: string },
	nsUrl: string,
	apiSecret: string,
	instanceName: string
) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/treatments/';
	const now = moment();
	const sim = {
		...simResult,
		type: 'logs',
		dateString: now.toISOString(),
		date: now.toDate().getTime(),
	};
	return uploadBase(sim, api_url, apiSecret, instanceName);
}

export function uploadEntries(
	cgmsim: EntryValueType,
	nsUrl: string,
	apiSecret: string,
	instanceName: string
) {
	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/entries/';
	const now = moment();
	const entry: Entry = {
		...cgmsim,
		type: 'sgv',
		dateString: now.toISOString(),
		date: now.toDate().getTime(),
	};
	return uploadBase(entry, api_url, apiSecret, instanceName);
}

export function uploadActivity(
	activity: Activity,
	nsUrl: string,
	apiSecret: string
) {
	logger.debug('log something %o', activity);

	const _nsUrl = removeTrailingSlash(nsUrl);
	const api_url = _nsUrl + '/api/v1/activity/';
	return uploadBase(activity, api_url, apiSecret);
}
