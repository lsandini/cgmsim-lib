import { Activity } from './Types';
import { uploadBase } from './utils';

export default function (activity: Activity, nsUrl: string, apiSecret: string) {
	const api_url = nsUrl + '/api/v1/activity/';
	return uploadBase(activity, api_url, apiSecret);

}