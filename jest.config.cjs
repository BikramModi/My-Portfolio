module.exports = {
    testEnvironment: "node",

    testEnvironmentOptions: {
        localStorage: undefined,
    },

    transform: {
        "^.+\\.js$": [
            "babel-jest",
            {
                configFile: "./babel.config.js",
            },
        ],
    },

    setupFilesAfterEnv: [
        "<rootDir>/src/tests/setup.js",
    ],

    clearMocks: false,
    resetMocks: false,
    restoreMocks: true,
};