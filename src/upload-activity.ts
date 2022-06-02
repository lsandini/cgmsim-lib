import { Activity } from './Types';
import { removeTrailingSlash, uploadBase } from './utils';

export default function (activity: Activity, nsUrl: string, apiSecret: string) {
	const _nsUrl = removeTrailingSlash(nsUrl)
	const api_url = _nsUrl + '/api/v1/activity/';
	return uploadBase(activity, api_url, apiSecret);

}