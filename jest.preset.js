const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: ['clover', ['text', { skipFull: false }]],
};
