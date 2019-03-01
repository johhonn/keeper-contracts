const loadWallet = require('./wallet/loadWallet')
const submitTransaction = require('./wallet/submitTransaction')
const confirmTransaction = require('./wallet/confirmTransaction')
const confirmUpgrade = require('./wallet/confirmUpgrade')
const deployContracts = require('./contracts/deployContracts')
const upgradeContracts = require('./contracts/upgradeContracts')

module.exports = {
    upgradeContracts,
    deployContracts,
    confirmUpgrade,
    loadWallet,
    submitTransaction,
    confirmTransaction
}
