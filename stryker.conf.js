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
    ],
    symlinkNodeModules: false,
  });
};
