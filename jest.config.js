module.exports = {
  preset: 'ts-jest',
  testEnvironment: './jest.customEnv.js',
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
  testPathIgnorePatterns: ['<rootDir>/dist'],
  coveragePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/test'],
  coverageReporters: ["json-summary"],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
