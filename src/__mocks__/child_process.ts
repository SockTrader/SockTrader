const cp: any = jest.genMockFromModule("child_process");

const childProcess = {
    stdout: {
        pipe: jest.fn(),
    },
};

cp.fork = jest.fn(() => childProcess);
cp.removeAllListeners = jest.fn();
cp.kill = jest.fn();

module.exports = cp;
