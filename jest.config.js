module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
    testPathIgnorePatterns: ['<rootDir>/dist'],
    coverageThreshold: {
        global: {
            lines: 80,
        },
    },
};