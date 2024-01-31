import getLogger from './utils';
import { Direction } from './Types';

/**
 * Calculates the direction of blood glucose change based on recent data.
 * @param sgvLast - The most recent blood glucose value.
 * @param sgv1 - Blood glucose value 5 minutes ago.
 * @param sgv2 - Blood glucose value 10 minutes ago.
 * @param sgv3 - Blood glucose value 15 minutes ago.
 * @returns An object containing the direction of blood glucose change and the variation.
 * @example
 * // Calculate blood glucose direction based on recent data
 * const sgvLast = 120;
 * const sgv1 = 115;
 * const sgv2 = 110;
 * const sgv3 = 105;
 *
 * const result = calculateGlucoseDirection(sgvLast, sgv1, sgv2, sgv3);
 * console.log("Blood glucose direction:", result.direction);
 * console.log("Blood glucose variation:", result.sgvdir);
 */
export default function (
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
		getLogger().debug(
			'this is the mean SGV 5 min variation in the last 15 minutes: %o',
			sgvdir15min,
			'mg/dl',
		);

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
		} else if (sgvdir15min >= 10) {
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
