const setupWallets = require('./wallet/setupWallets')
const loadWallet = require('./wallet/loadWallet')
const requestContractUpgrade = require('./contracts/requestContractUpgrades')
const deployContracts = require('./contracts/deployContracts')

module.exports = {
    setupWallets,
    loadWallet,
    requestContractUpgrade,
    deployContracts
}
