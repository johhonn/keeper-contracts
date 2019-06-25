/* global web3 */
const { argv } = require('yargs')
const { audit } = require('@oceanprotocol/dori')

module.exports = (cb) => {
    audit({
        web3,
        strict: false,
        verbose: argv['verbose'] && true
    })
        .then(() => cb())
        .catch(err => cb(err))
}
