import logger from './logger';

export default function generateSurpriseMeal({ treatments }: { treatments: Array<{ mills: number; carbs: number }> }) {
	const now = new Date();
	if (now.getHours() === 23) {
		const todayStr = now.toISOString().substring(0, 10);
		const totalMeals =
			treatments?.filter((entry) => new Date(entry.mills).toISOString().substring(0, 10) === todayStr) || [];

		logger.debug('totalMeals %o', totalMeals);

		const totalCarbs = totalMeals.reduce((tot, arr) => tot + (arr.carbs || 0), 0);

		logger.debug('totalCarbs %o', totalCarbs);
		if (totalCarbs < 200) {
			return {
				time: Date.now(),
				carbs: (200 - totalCarbs).toString(),
				enteredBy: 'surprise_Meal_Generator',
			};
		}
		return null;
	} else {
		return null;
	}
}
