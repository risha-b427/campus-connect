/** @type {import("jest").Config} */
export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
          },
        },
        module: {
          type: "es6",
        },
      },
    ],
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
};
