module.exports = {
  testEnvironment: "node",
   testEnvironmentOptions: {
    localStorage: undefined,
  },
   transform: {
    "^.+\\.js$": "babel-jest"
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};