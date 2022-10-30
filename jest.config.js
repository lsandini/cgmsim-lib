module.exports = {
	preset: './jest.preset.js',
	testEnvironment: './jest.customEnv.js',	
    setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    testPathIgnorePatterns: ['<rootDir>/dist'],
    coverageThreshold: {
        global: {
            lines: 80,
        },
    },
};