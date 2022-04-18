/* eslint-disable */

module.exports = {
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/npm',
        '@semantic-release/github'
    ],
    branches: [
        '+([0-9])?(.{+([0-9]),x}).x',
        'main',
        'next',
        {name: 'beta', prerelease: true},
        {name: 'alpha', prerelease: true},
    ],
};
