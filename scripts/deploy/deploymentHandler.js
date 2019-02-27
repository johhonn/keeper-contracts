const confirmUpgrade = require('./wallet/confirmUpgrade')
const confirmTransaction = require('./wallet/confirmTransaction')
const loadWallet = require('./wallet/loadWallet')
const upgradeContracts = require('./contracts/upgradeContracts')
const deployContracts = require('./contracts/deployContracts')

module.exports = {
    upgradeContracts,
    deployContracts,
    confirmUpgrade,
    loadWallet,
    confirmTransaction
}
