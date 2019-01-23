/* global artifacts, web3 */
const { setupWallet } = require('./setupWallet')

module.exports = (cb) => {
    // Run with npx truffle exec setUpWallet.js
    setupWallet(web3, artifacts)
        .then(() => cb())
        .catch(err => cb(err))
}
