const submitTransaction = require('./wallet/submitTransaction')
const confirmTransaction = require('./wallet/confirmTransaction')
const deployContracts = require('./contracts/deployContracts')
const loadWallet = require('./wallet/loadWallet')
const upgradeContracts = require('./contracts/upgradeContracts')
const confirmUpgrade = require('./wallet/confirmUpgrade')

module.exports = {
    upgradeContracts,
    deployContracts,
    confirmUpgrade,
    loadWallet,
    submitTransaction,
    confirmTransaction
}
