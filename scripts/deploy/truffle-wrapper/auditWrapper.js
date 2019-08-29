/* global web3 */
const { argv } = require('yargs')
const { audit } = require('@oceanprotocol/dori')
const evaluateContracts = require('./evaluateContracts.js')

module.exports = (cb) => {
    audit({
        web3,
        evaluateContracts,
        strict: false,
        verbose: argv.verbose && true
    })
        .then(() => cb())
        .catch(err => cb(err))
}
