const fs: any = jest.genMockFromModule("fs");

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles: string[] = [];
let statMock: any;

function __setMockFiles(newMockFiles: string[]) {
    mockFiles = newMockFiles;
}

function __setStatMock(newStatMock: any) {
    statMock = newStatMock;
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdir(directoryPath: string, cb: any) {
    return cb(undefined, mockFiles) || [];
}

fs.__setMockFiles = __setMockFiles;
fs.__setStatMock = __setStatMock;
fs.readdir = readdir;
fs.stat = (path: string, cb: any) => cb(undefined, statMock);

module.exports = fs;
