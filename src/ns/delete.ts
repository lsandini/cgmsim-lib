import logger from './logger';
import { deleteBase } from './client';
import { removeTrailingSlash } from '../core/utils';

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

export { deleteBase };
export default deleteDeviceStatus;
