declare namespace jest {
	interface Matchers<R> {
		toMatchImageSnapshot({
			failureThreshold: number,
			failureThresholdType:string			
		}): R
}

}
