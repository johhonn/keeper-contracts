/* global artifacts, web3 */
const { argv } = require('yargs')
const { deployContracts } = require('@oceanprotocol/dori')
const initializeContracts = require('./initializeContracts.js')

module.exports = (cb) => {
    const parameters = argv._
    const contracts = parameters.splice(2)

    deployContracts({
        web3,
        artifacts,
        contracts,
        initializeContracts,
        forceWalletCreation: argv['force-wallet-creation'] || false,
        deeperClean: argv['deeper-clean'] || false,
        testnet: argv['testnet'] || false,
        verbose: argv['verbose'] && true
    })
        .then(() => cb())
        .catch(err => cb(err))
}
