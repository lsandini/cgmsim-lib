module.exports = {
	preset: 'ts-jest',
	testEnvironment: './jest.customEnv.js',	
    setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    testPathIgnorePatterns: ['<rootDir>/dist'],
    coverageThreshold: {
        global: {
            lines: 80,
        },
    },
};