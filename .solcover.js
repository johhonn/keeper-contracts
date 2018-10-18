module.exports = {
    compileCommand: 'npm run compile -- --all',
    testCommand: 'npm run truffle:test -- --network coverage',
    copyPackages: ['openzeppelin-solidity'],
};
