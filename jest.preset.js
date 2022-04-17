const nxPreset = require('@nrwl/jest/preset');

module.exports = {
    ...nxPreset,
    coverageReporters: ['json', ['text', {'skipFull': false}]]
};
