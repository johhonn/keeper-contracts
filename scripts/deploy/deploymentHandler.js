const confirmUpgrade = require('./wallet/confirmUpgrade')
const upgradeContracts = require('./contracts/upgradeContracts')
const deployContracts = require('./contracts/deployContracts')

module.exports = {
    upgradeContracts,
    deployContracts,
    confirmUpgrade
}
