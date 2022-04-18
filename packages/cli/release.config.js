/* eslint-disable */

const name = 'cli';
const srcRoot = `packages/${name}`;
const pathToRepoRoot = '../..';

module.exports = {
    extends: `${pathToRepoRoot}/release.config.base.js`,
    pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
    tagFormat: name + '-v${version}',
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        ["@semantic-release/npm", {
            "tarballDir": `${pathToRepoRoot}/dist/${srcRoot}`,
            // "pkgRoot": "dist",
        }],
        '@semantic-release/github'
    ],
    commitPaths: [
        // REMOVING external dependencies to decrease unneeded releases and bad change logs
        // `${pathToRepoRoot}/workspace.json`,
        // `${pathToRepoRoot}/nx.json`,
        // `${pathToRepoRoot}/.nxignore`,
        // `${pathToRepoRoot}/package.json`,
        // `${pathToRepoRoot}/.prettierrc`,
        // `${pathToRepoRoot}/.prettierignore`,
        `*`, // anything in this directory
    ],
};
