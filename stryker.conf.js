module.exports = function(config) {
  config.set({
    packageManager: "npm",
    reporters: ["progress", "dashboard", "html"],
    testRunner: "jest",
    transpilers: [],
    coverageAnalysis: "off",
    htmlReporter: {
      baseDir: 'test_results/mutation/html'
    },
    mutator: { name: "typescript", excludedMutations: ["BooleanLiteral", "StringLiteral"] },
    tsconfigFile: "tsconfig.json",
    files: [
      "src/**/*.ts",
    ],
    mutate: [
      "src/**/*.ts",
      "!src/**/__fixtures__/**/*.ts",
      "!src/**/__tests__/**/*.ts",
      "!src/**/__mocks__/**/*.ts",
      "!src/**/data/**/*.ts",
      "!src/**/strategies/**/*.ts",
    ],
    symlinkNodeModules: false,
  });
};
