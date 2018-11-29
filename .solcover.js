module.exports = {
    compileCommand: 'npm run compile -- --all',
    testCommand: 'export PORT=8555&& npm run test -- --network coverage --timeout 10000',
    copyPackages: ['openzeppelin-solidity'],
}
