const getZOSMigration = require('./getZOSMigration')

function getAddressForImplementation(contractName) {
    const { contracts } = getZOSMigration()
    let implementation = contracts && contracts[contractName]
    return implementation.address
}

module.exports = getAddressForImplementation
