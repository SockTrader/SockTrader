const fs: any = jest.genMockFromModule("fs");

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles: string[] = [];

function __setMockFiles(newMockFiles: string[]) {
    mockFiles = newMockFiles;
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdir(directoryPath: string, cb: any) {
    return cb(undefined, mockFiles) || [];
}

fs.__setMockFiles = __setMockFiles;
fs.readdir = readdir;

module.exports = fs;
