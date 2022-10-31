declare namespace jest {
	interface Matchers<R> {
		toMatchImageSnapshot({
			customDiffConfig:{
				threshold:number}
		}): R
	}

}
