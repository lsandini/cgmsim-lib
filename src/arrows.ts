import logger from './utils';
import { Direction } from './Types';

//const logger = pino();


export default function (sgvLast, sgv1, sgv2, sgv3): { sgvdir: number; direction: Direction } {
	if (sgvLast && sgv1 && sgv2 && sgv3) {
		const sgvdir1 = sgvLast - sgv1;
		const sgvdir2 = sgv1 - sgv2;
		const sgvdir3 = sgv2 - sgv3;
		const sgvdir15min = (sgvdir1 + sgvdir2 + sgvdir3) / 3;
		logger.debug('this is the mean SGV 5 min variation in the last 15 minutes: %o', sgvdir15min, 'mg/dl');

		if (sgvdir15min < -10) {
			return {
				sgvdir: sgvdir15min,
				direction: 'DoubleDown'
			};

		} else if (sgvdir15min < -6) {
			return {
				sgvdir: sgvdir15min,
				direction: 'SingleDown'
			};

		} else if (sgvdir15min < -2) {
			return {
				sgvdir: sgvdir15min,
				direction: 'FortyFiveDown'
			};

		} else if (sgvdir15min < 2) {
			return {
				sgvdir: sgvdir15min,
				direction: 'Flat'
			};

		} else if (sgvdir15min < 6) {
			return {
				sgvdir: sgvdir15min,
				direction: 'FortyFiveUp'
			};

		} else if (sgvdir15min < 10) {
			return {
				sgvdir: sgvdir15min,
				direction: 'SingleUp'
			};

		} else if (sgvdir15min >= 10) {
			return {
				sgvdir: sgvdir15min,
				direction: 'DoubleUp'
			};
		}

	} else {
		return {
			sgvdir: 0,
			direction: 'Flat'
		};
	}
}