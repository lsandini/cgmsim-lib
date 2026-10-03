import logger from './logger';
import { CoreGlucoseEntry, Direction, Sgv } from './types';

/**
 * Calculates the direction of blood glucose change based on recent data.
 * @param sgvLast - The most recent blood glucose value.
 * @param sgv1 - Blood glucose value 5 minutes ago.
 * @param sgv2 - Blood glucose value 10 minutes ago.
 * @param sgv3 - Blood glucose value 15 minutes ago.
 * @returns An object containing the direction of blood glucose change and the variation.
 */
export function calculateGlucoseDirection(
	sgvLast: number,
	sgv1: number,
	sgv2: number,
	sgv3: number,
): { sgvdir: number; direction: Direction } {
	if (sgvLast && sgv1 && sgv2 && sgv3) {
		const sgvdir1 = sgvLast - sgv1;
		const sgvdir2 = sgv1 - sgv2;
		const sgvdir3 = sgv2 - sgv3;
		const sgvdir15min = (sgvdir1 + sgvdir2 + sgvdir3) / 3;
		logger.debug('this is the mean SGV 5 min variation in the last 15 minutes: %o mg/dl', sgvdir15min);

		if (sgvdir15min < -10) {
			return {
				sgvdir: sgvdir15min,
				direction: 'DoubleDown',
			};
		} else if (sgvdir15min < -6) {
			return {
				sgvdir: sgvdir15min,
				direction: 'SingleDown',
			};
		} else if (sgvdir15min < -2) {
			return {
				sgvdir: sgvdir15min,
				direction: 'FortyFiveDown',
			};
		} else if (sgvdir15min < 2) {
			return {
				sgvdir: sgvdir15min,
				direction: 'Flat',
			};
		} else if (sgvdir15min < 6) {
			return {
				sgvdir: sgvdir15min,
				direction: 'FortyFiveUp',
			};
		} else if (sgvdir15min < 10) {
			return {
				sgvdir: sgvdir15min,
				direction: 'SingleUp',
			};
		} else {
			return {
				sgvdir: sgvdir15min,
				direction: 'DoubleUp',
			};
		}
	} else {
		return {
			sgvdir: 0,
			direction: 'Flat',
		};
	}
}

/**
 * Calculates trend arrow direction from either an array of recent glucose entries
 * or 4 discrete recent glucose measurements.
 */
export function calculateTrendArrow(
	recentEntriesOrSgv: (CoreGlucoseEntry | Sgv)[] | number,
	sgv1?: number,
	sgv2?: number,
	sgv3?: number,
): Direction {
	if (typeof recentEntriesOrSgv === 'number') {
		return calculateGlucoseDirection(recentEntriesOrSgv, sgv1 ?? 0, sgv2 ?? 0, sgv3 ?? 0).direction;
	}

	if (!Array.isArray(recentEntriesOrSgv) || recentEntriesOrSgv.length < 4) {
		return 'Flat';
	}

	// Sort newest first
	const sorted = [...recentEntriesOrSgv].sort((a, b) => {
		const timeA = 'mills' in a ? a.mills : new Date(a.timestamp).getTime();
		const timeB = 'mills' in b ? b.mills : new Date(b.timestamp).getTime();
		return timeB - timeA;
	});

	return calculateGlucoseDirection(sorted[0].sgv, sorted[1].sgv, sorted[2].sgv, sorted[3].sgv).direction;
}

export default calculateGlucoseDirection;
