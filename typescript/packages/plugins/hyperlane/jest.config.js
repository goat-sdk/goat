const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>"],
    testMatch: ["**/*.test.ts"],
    // testPathIgnorePatterns: ['/node_modules/', '/ethers.js/', '/samgermainwebsite/'],
    transform: {
        ...tsJestTransformCfg,
    },
};
