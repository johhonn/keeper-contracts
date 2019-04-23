/* global web3 */
const { argv } = require('yargs')
const upgradeContracts = require('../contracts/upgradeContracts')

module.exports = (cb) => {
    const parameters = argv._
    const contracts = parameters.splice(2)

    upgradeContracts({
        web3,
        contracts,
        strict: false,
        testnet: argv['testnet'] || false,
        verbose: argv['verbose'] && true
    })
        .then(() => cb())
        .catch(err => cb(err))
}
