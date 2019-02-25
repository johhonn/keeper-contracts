/* global web3 */
const setupWallets = require('../wallet/setupWallets')

module.exports = (cb) => {
    // Run with npx truffle exec setUpWalletWrapper.js
    setupWallets(web3, false)
        .then(() => cb())
        .catch(err => cb(err))
}
