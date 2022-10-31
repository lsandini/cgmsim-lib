declare namespace jest {
	interface Matchers<R> {
		toMatchImageSnapshot(
			{
				// comparisonMethod,
				customDiffConfig,
				failureThreshold,
				failureThresholdType
			}: {
				customDiffConfig:{
					threshold :number
				},
				// comparisonMethod?: 'ssim' | 'pixelmatch',
				failureThreshold?: number,
				failureThresholdType?: string
			}
		): R
	}

}
