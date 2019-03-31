module.exports = function(config) {
  config.set({
    packageManager: "npm",
    reporters: ["progress", "dashboard", "html"],
    testRunner: "jest",
    transpilers: [],
    coverageAnalysis: "off",
    mutator: { name: "typescript", excludedMutations: ["BooleanSubstitution", "StringLiteral"] },
    tsconfigFile: "tsconfig.spec.json",
    files: [
      "src/**/*.ts",
    ],
    mutate: [
      "src/**/*.ts",
      "!src/**/__tests__/**/*.ts",
      "!src/**/__mocks__/**/*.ts",
      "!src/**/data/**/*.ts",
      "!src/**/strategies/**/*.ts",
    ],
    symlinkNodeModules: false,
  });
};
