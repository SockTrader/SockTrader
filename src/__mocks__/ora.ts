const ora: any = jest.genMockFromModule("ora");

const succeedFn = jest.fn();
const failFn = jest.fn();
const startFn = jest.fn(() => ({succeed: succeedFn, fail: failFn}));

module.exports = jest.fn(() => ({start: startFn}));

module.exports.__start = startFn;
module.exports.__succeed = succeedFn;
module.exports.__fail = failFn;
