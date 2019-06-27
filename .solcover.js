module.exports = {
    norpc: true,
    port: 8545,
    compileCommand: 'npm run compile -- --all',
    testCommand: 'export ETHEREUM_RPC_PORT=8545&& npm run test:fast -- --network coverage --timeout 10000',
    copyPackages: ['openzeppelin-eth'],
    skipFiles: [
        'test'
    ],
}
